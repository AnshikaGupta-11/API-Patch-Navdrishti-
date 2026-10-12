const { DatabaseSync } = require("node:sqlite");
const crypto = require("node:crypto");
const path = require("node:path");
const fs = require("node:fs");

const DEFAULT_DB_PATH = path.join(__dirname, "../data/auth.db");

let dbInstance = null;

function getDb(customPath = null) {
  if (dbInstance && !customPath) return dbInstance;

  const dbPath = customPath || process.env.AUTH_DB_PATH || DEFAULT_DB_PATH;
  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Initialize SQLite Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  if (!customPath) {
    dbInstance = db;
    seedDemoUser(db);
  }

  return db;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, storedHash, salt) {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch {
    return false;
  }
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function seedDemoUser(db) {
  try {
    const checkStmt = db.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE");
    const existing = checkStmt.get("lead.architect@internet-after-api.dev");
    if (!existing) {
      const { salt, hash } = hashPassword("GuardianPass2026!");
      const now = new Date().toISOString();
      const insertStmt = db.prepare(`
        INSERT INTO users (id, email, name, password_hash, salt, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        "usr-demo-001",
        "lead.architect@internet-after-api.dev",
        "Chinmay Bulani",
        hash,
        salt,
        now,
        now
      );
    }
  } catch (err) {
    console.error("[Auth] Error seeding demo user:", err);
  }
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}

// ----------------------------------------------------------------------
// Express Route Handlers
// ----------------------------------------------------------------------

function registerHandler(req, res) {
  const { email, password, name } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "A valid email address is required" });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name && typeof name === "string" && name.trim()) ? name.trim() : cleanEmail.split("@")[0];

  const db = getDb();

  try {
    const existing = db.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE").get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const { salt, hash } = hashPassword(password);
    const userId = `usr-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, cleanEmail, cleanName, hash, salt, now, now);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(token, userId, now, expiresAt);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        createdAt: now
      }
    });
  } catch (err) {
    console.error("[Auth] Registration error:", err);
    return res.status(500).json({ error: "Failed to create user account" });
  }
}

function loginHandler(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const db = getDb();

  try {
    const user = db.prepare(`
      SELECT id, email, name, password_hash, salt, created_at
      FROM users
      WHERE email = ? COLLATE NOCASE
    `).get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = verifyPassword(String(password), user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, now, expiresAt);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return res.status(500).json({ error: "Authentication service error" });
  }
}

function meHandler(req, res) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  const db = getDb();

  try {
    const session = db.prepare(`
      SELECT s.token, s.expires_at, u.id, u.email, u.name, u.created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ?
    `).get(token);

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (new Date(session.expires_at) < new Date()) {
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
      return res.status(401).json({ error: "Session has expired" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        createdAt: session.created_at
      }
    });
  } catch (err) {
    console.error("[Auth] Me error:", err);
    return res.status(500).json({ error: "Failed to verify session" });
  }
}

function logoutHandler(req, res) {
  const token = extractToken(req);
  if (token) {
    try {
      const db = getDb();
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    } catch {
      // ignore
    }
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
}

function resetAuthDatabase(customPath = null) {
  const db = getDb(customPath);
  db.exec("DELETE FROM sessions; DELETE FROM users;");
  seedDemoUser(db);
}

module.exports = {
  getDb,
  hashPassword,
  verifyPassword,
  isValidEmail,
  registerHandler,
  loginHandler,
  meHandler,
  logoutHandler,
  resetAuthDatabase,
  seedDemoUser
};
