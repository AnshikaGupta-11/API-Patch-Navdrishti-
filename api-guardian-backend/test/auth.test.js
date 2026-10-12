const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { app } = require("../src/server");
const { getDb, resetAuthDatabase, verifyPassword, hashPassword } = require("../src/auth");

let server;
let baseUrl;

test.before(async () => {
  resetAuthDatabase();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("POST /api/auth/register creates user with secure Scrypt hash and returns session token", async () => {
  const email = `engineer-${Date.now()}@test.org`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "StrongPassword2026!",
      name: "Security Engineer"
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.email, email);
  assert.equal(data.user.name, "Security Engineer");

  // Verify user in SQLite database directly
  const db = getDb();
  const dbUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  assert.ok(dbUser);
  assert.notEqual(dbUser.password_hash, "StrongPassword2026!");
  assert.ok(dbUser.salt);
  assert.equal(verifyPassword("StrongPassword2026!", dbUser.password_hash, dbUser.salt), true);
  assert.equal(verifyPassword("WrongPassword!", dbUser.password_hash, dbUser.salt), false);
});

test("POST /api/auth/register rejects invalid email format with HTTP 400", async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "invalid-email-format",
      password: "ValidPassword123!"
    })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes("email"));
});

test("POST /api/auth/register rejects password shorter than 8 characters with HTTP 400", async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "short-pass@test.org",
      password: "123"
    })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes("8 characters"));
});

test("POST /api/auth/register rejects duplicate email with HTTP 409 Conflict", async () => {
  const email = `unique-${Date.now()}@test.org`;
  const payload = {
    email,
    password: "Password1234!",
    name: "Duplicate Tester"
  };

  // First registration
  const res1 = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  assert.equal(res1.status, 201);

  // Second registration with same email (case-insensitive)
  const res2 = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, email: email.toUpperCase() })
  });
  assert.equal(res2.status, 409);
  const data2 = await res2.json();
  assert.ok(data2.error.includes("already exists"));
});

test("POST /api/auth/login succeeds with valid credentials and returns session token", async () => {
  const email = `login-user-${Date.now()}@test.org`;
  const password = "LoginSuccessPass2026!";

  // Register first
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: "Login Test" })
  });

  // Login
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.email, email);
});

test("POST /api/auth/login rejects incorrect password with HTTP 401", async () => {
  const email = `login-wrong-${Date.now()}@test.org`;
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "RealPassword123!" })
  });

  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "WrongPassword123!" })
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.ok(data.error.includes("Invalid email or password"));
});

test("POST /api/auth/login rejects non-existent email with HTTP 401", async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "does-not-exist@nowhere.org", password: "SomePassword123!" })
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.ok(data.error.includes("Invalid email or password"));
});

test("GET /api/auth/me returns current user profile when authenticated", async () => {
  const email = `me-user-${Date.now()}@test.org`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "MePassword2026!", name: "Profile User" })
  });
  const regData = await regRes.json();
  const token = regData.token;

  // Query /api/auth/me
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.user.email, email);
  assert.equal(data.user.name, "Profile User");
  assert.equal(data.user.password_hash, undefined);
  assert.equal(data.user.salt, undefined);
});

test("POST /api/auth/logout invalidates session token", async () => {
  const email = `logout-user-${Date.now()}@test.org`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "LogoutPassword2026!" })
  });
  const { token } = await regRes.json();

  // Logout
  const outRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(outRes.status, 200);

  // Verification: GET /api/auth/me should now fail with 401
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(meRes.status, 401);
});

test("SQLite persistence: seeded demo account persists in SQLite database", async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "lead.architect@internet-after-api.dev",
      password: "GuardianPass2026!"
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.user.email, "lead.architect@internet-after-api.dev");
  assert.equal(data.user.name, "Chinmay Bulani");
});
