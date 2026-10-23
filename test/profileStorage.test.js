import test from "node:test";
import assert from "node:assert/strict";
import { createInitialProfile } from "../src/profile/profileSchema.js";
import { clearStoredProfile, loadProfileDraft, loadSavedProfile, saveProfile, saveProfileDraft } from "../src/services/profileStorage.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("draft and saved profile persistence preserve structured answers", () => {
  const storage = memoryStorage();
  const profile = createInitialProfile();
  profile.interests.topicIds = ["ai"];
  assert.equal(saveProfileDraft(profile, storage), true);
  assert.deepEqual(loadProfileDraft(storage).value.interests.topicIds, ["ai"]);
  assert.equal(saveProfile(profile, storage), true);
  assert.equal(loadProfileDraft(storage).value, null);
  assert.deepEqual(loadSavedProfile(storage).value.interests.topicIds, ["ai"]);
  assert.equal(clearStoredProfile(storage), true);
  assert.equal(loadSavedProfile(storage).value, null);
});

test("invalid storage data fails safely", () => {
  const storage = memoryStorage();
  storage.setItem("msba-opportunity-hub.profile.v1", "not-json");
  assert.deepEqual(loadSavedProfile(storage), { value: null, available: false });
});

