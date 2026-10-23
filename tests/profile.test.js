import test from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  blankProfile,
  loadState,
  persistState,
  validProfile,
} from "../src/services/profile.js";

const memory = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};
test("a draft resumes at its saved step without losing preferences", () => {
  const storage = memory();
  const profile = {
    ...blankProfile(),
    name: "Alex",
    email: "alex@example.com",
    roles: ["Data analyst"],
    hours: 7,
  };
  assert.equal(persistState(storage, { profile, stage: 3, saved: null }), true);
  const restored = loadState(storage);
  assert.deepEqual(restored.profile, profile);
  assert.equal(restored.stage, 3);
  assert.equal(restored.saved, null);
});
test("a completed profile survives refresh separately from a draft being edited", () => {
  const storage = memory();
  const saved = { ...blankProfile(), name: "Alex", email: "alex@example.com" };
  const profile = { ...saved, hours: 8 };
  persistState(storage, { saved, profile, stage: 2 });
  assert.equal(loadState(storage).saved.hours, 4);
  assert.equal(loadState(storage).profile.hours, 8);
});
test("missing, malformed, outdated, and structurally invalid storage recover safely", () => {
  const storage = memory();
  assert.equal(loadState(storage).stage, -1);
  for (const raw of [
    "{",
    "null",
    JSON.stringify({ version: 2 }),
    JSON.stringify({
      version: 1,
      profile: { ...blankProfile(), roles: "bad" },
      stage: 1,
      saved: null,
    }),
    JSON.stringify({
      version: 1,
      profile: blankProfile(),
      stage: 99,
      saved: null,
    }),
  ]) {
    storage.setItem(STORAGE_KEY, raw);
    const result = loadState(storage);
    assert.deepEqual(result.profile, blankProfile());
    assert.equal(result.stage, -1);
    assert.ok(result.notice);
  }
});
test("blocked reads and writes do not crash the flow", () => {
  const storage = {
    getItem() {
      throw new Error("Blocked");
    },
    setItem() {
      throw new Error("Quota");
    },
  };
  assert.equal(loadState(storage).stage, -1);
  assert.equal(
    persistState(storage, { profile: blankProfile(), stage: 0, saved: null }),
    false,
  );
});
test("signup never enables event-level attendance or carpool consent", () => {
  assert.equal(validProfile(blankProfile()), true);
  assert.equal(
    validProfile({ ...blankProfile(), attendanceVisible: true }),
    false,
  );
  assert.equal(
    validProfile({ ...blankProfile(), carpoolEnabled: true }),
    false,
  );
  assert.equal(validProfile({ ...blankProfile(), hours: 100 }), false);
});
