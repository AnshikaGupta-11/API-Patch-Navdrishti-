const test = require("node:test");
const assert = require("node:assert/strict");
const { detectChanges } = require("../src/detector");

test("detects a missing and added field in a rename", () => {
  const baseline = { statusCode: 200, body: { id: 1, name: "Rahul" } };
  const observed = { statusCode: 200, body: { id: 1, display_name: "Rahul" } };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((change) => change.kind === "MISSING_FIELD" && change.path === "name"));
  assert.ok(changes.some((change) => change.kind === "ADDED_FIELD" && change.path === "display_name"));
  assert.ok(changes.some((change) => change.kind === "FIELD_RENAMED" && change.path === "name"));
});

test("detects weather API multi-field rename", () => {
  const baseline = {
    statusCode: 200,
    body: { temp: 24, condition: "Sunny", humidity: 45, city: "Indore" }
  };
  const observed = {
    statusCode: 200,
    body: { temperature: 24, condition: "Sunny", humidity: 45, city_name: "Indore" }
  };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "FIELD_RENAMED" && c.path === "temp" && c.targetPath === "temperature"));
  assert.ok(changes.some((c) => c.kind === "FIELD_RENAMED" && c.path === "city" && c.targetPath === "city_name"));
});

test("detects a type change", () => {
  const baseline = { statusCode: 200, body: { price: 50 } };
  const observed = { statusCode: 200, body: { price: "50" } };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((change) => change.kind === "TYPE_CHANGED" && change.path === "price"));
});

test("detects HTTP status code changes", () => {
  const baseline = { statusCode: 200, body: { status: "ok" } };
  const observed = { statusCode: 503, body: { status: "service unavailable" } };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "STATUS_CHANGED" && c.actual === 503));
});

test("detects header additions", () => {
  const baseline = { statusCode: 200, headers: { "content-type": "application/json" } };
  const observed = {
    statusCode: 200,
    headers: { "content-type": "application/json", "x-github-api-version": "2026-10-10" }
  };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "HEADER_ADDED" && c.path === "$headers.x-github-api-version"));
});

test("detects latency/performance degradation", () => {
  const baseline = { statusCode: 200, responseTimeMs: 200, body: {} };
  const observed = { statusCode: 200, responseTimeMs: 450, body: {} };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "PERFORMANCE_DEGRADED"));
});

test("returns no changes for matching responses", () => {
  const baseline = { statusCode: 200, body: { id: 1, name: "Rahul" } };
  assert.deepEqual(detectChanges(baseline, baseline), []);
});
