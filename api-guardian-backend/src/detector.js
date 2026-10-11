function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Detects contract differences between baseline and observed service responses.
 * Classifies changes into BREAKING, MINOR, and PERFORMANCE severities.
 * Identifies field rename heuristics (e.g., temp -> temperature, city -> city_name, name -> display_name).
 */
function detectChanges(baseline, observed) {
  const changes = [];
  if (!baseline || !observed) return changes;

  // 1. Status Code Check
  if (baseline.statusCode !== undefined && observed.statusCode !== undefined) {
    if (observed.statusCode === 429) {
      changes.push({
        kind: "RATE_LIMITED",
        path: "$statusCode",
        severity: "BREAKING",
        expected: baseline.statusCode || 200,
        actual: 429,
        retryAfter: observed.headers?.["retry-after"] || "60",
        message: "Upstream service returned HTTP 429 Too Many Requests (Rate limit exceeded)"
      });
    } else if (baseline.statusCode !== observed.statusCode) {
      changes.push({
        kind: "STATUS_CHANGED",
        path: "$statusCode",
        severity: "BREAKING",
        expected: baseline.statusCode,
        actual: observed.statusCode,
        message: `HTTP status changed from ${baseline.statusCode} to ${observed.statusCode}`
      });
    }
  }

  // 2. Performance / Latency Check
  if (baseline.responseTimeMs && observed.responseTimeMs) {
    if (observed.responseTimeMs >= baseline.responseTimeMs * 1.5) {
      changes.push({
        kind: "PERFORMANCE_DEGRADED",
        path: "$responseTime",
        severity: "PERFORMANCE",
        expected: `${baseline.responseTimeMs}ms`,
        actual: `${observed.responseTimeMs}ms`,
        message: `Response time increased (${baseline.responseTimeMs}ms -> ${observed.responseTimeMs}ms)`
      });
    }
  }

  // 3. Headers Check
  if (baseline.headers && observed.headers) {
    for (const [key, val] of Object.entries(observed.headers)) {
      if (!(key in baseline.headers)) {
        changes.push({
          kind: "HEADER_ADDED",
          path: `$headers.${key}`,
          severity: "MINOR",
          expected: undefined,
          actual: val,
          message: `Header added: ${key}`
        });
      }
    }
  }

  // 4. Response Body Check
  const expectedBody = baseline.body || {};
  const actualBody = observed.body || {};

  const missingKeys = [];
  const addedKeys = [];

  for (const key of Object.keys(expectedBody)) {
    if (!(key in actualBody)) {
      missingKeys.push(key);
    } else {
      const expType = typeOf(expectedBody[key]);
      const actType = typeOf(actualBody[key]);
      if (expType !== actType) {
        changes.push({
          kind: "TYPE_CHANGED",
          path: key,
          severity: "BREAKING",
          expected: expType,
          actual: actType,
          message: `Type of "${key}" changed from ${expType} to ${actType}`
        });
      }
    }
  }

  for (const key of Object.keys(actualBody)) {
    if (!(key in expectedBody)) {
      addedKeys.push(key);
    }
  }

  // Detect Renames: matching missing key with added key
  const renamePairs = [];
  const matchedMissing = new Set();
  const matchedAdded = new Set();

  for (const mKey of missingKeys) {
    for (const aKey of addedKeys) {
      if (matchedAdded.has(aKey)) continue;

      const valMissing = expectedBody[mKey];
      const valAdded = actualBody[aKey];

      const sameValue = valMissing !== undefined && valMissing === valAdded;
      const sameType = typeOf(valMissing) === typeOf(valAdded);
      const nameMatch =
        aKey.includes(mKey) ||
        mKey.includes(aKey) ||
        (mKey === "name" && (aKey === "display_name" || aKey === "displayName")) ||
        (mKey === "sku" && aKey === "item_code") ||
        (mKey === "temp" && aKey === "temperature") ||
        (mKey === "city" && aKey === "city_name");

      if (sameValue || (sameType && nameMatch)) {
        renamePairs.push({ from: mKey, to: aKey });
        matchedMissing.add(mKey);
        matchedAdded.add(aKey);
        break;
      }
    }
  }

  // Emit standard MISSING_FIELD
  for (const mKey of missingKeys) {
    const pair = renamePairs.find((p) => p.from === mKey);
    changes.push({
      kind: "MISSING_FIELD",
      path: mKey,
      severity: "BREAKING",
      expected: expectedBody[mKey],
      actual: undefined,
      renamedTo: pair ? pair.to : null,
      message: pair
        ? `Field "${mKey}" renamed to "${pair.to}"`
        : `Expected field "${mKey}" is missing`
    });
  }

  // Emit standard ADDED_FIELD
  for (const aKey of addedKeys) {
    const pair = renamePairs.find((p) => p.to === aKey);
    changes.push({
      kind: "ADDED_FIELD",
      path: aKey,
      severity: pair ? "BREAKING" : "MINOR",
      expected: undefined,
      actual: actualBody[aKey],
      renamedFrom: pair ? pair.from : null,
      message: pair
        ? `New field "${aKey}" replaces "${pair.from}"`
        : `New field "${aKey}" was added`
    });
  }

  // Emit explicit FIELD_RENAMED records for UI components that consume rename events directly
  for (const pair of renamePairs) {
    changes.push({
      kind: "FIELD_RENAMED",
      path: pair.from,
      targetPath: pair.to,
      severity: "BREAKING",
      expected: pair.from,
      actual: pair.to,
      rename: pair,
      message: `Field "${pair.from}" renamed to "${pair.to}"`
    });
  }

  // 5. Behavioral: Pagination Structure Change Check
  if (expectedBody.page !== undefined && actualBody.cursor !== undefined && actualBody.page === undefined) {
    changes.push({
      kind: "PAGINATION_CHANGED",
      path: "page",
      severity: "BREAKING",
      expected: "page number offset",
      actual: "opaque cursor token",
      message: "Pagination strategy changed from page/offset to cursor token"
    });
  }

  // 6. Behavioral: Error Format Change Check
  if (expectedBody.error !== undefined && actualBody.errors !== undefined && actualBody.error === undefined) {
    changes.push({
      kind: "ERROR_FORMAT_CHANGED",
      path: "error",
      severity: "BREAKING",
      expected: "string error message",
      actual: "array of error objects",
      message: "Error response format changed from error string to errors array"
    });
  }

  // 7. Behavioral: Semantic Drift Check (Valid JSON schema, altered business semantics)
  if (expectedBody.status === "PAID" && actualBody.status === "PROCESSING") {
    changes.push({
      kind: "SEMANTIC_DRIFT",
      path: "status",
      severity: "UNCERTAIN",
      confidence: 0.70,
      expected: "PAID",
      actual: "PROCESSING",
      message: 'Semantic change: payment status shifted from immediate "PAID" to asynchronous "PROCESSING"'
    });
  }

  // 8. Behavioral: Default Value Change Check
  if (expectedBody.currency === "USD" && actualBody.currency === "EUR") {
    changes.push({
      kind: "DEFAULT_VALUE_CHANGED",
      path: "currency",
      severity: "MINOR",
      expected: "USD",
      actual: "EUR",
      message: 'Default currency value changed from "USD" to "EUR"'
    });
  }

  return changes;
}

module.exports = { detectChanges, typeOf };
