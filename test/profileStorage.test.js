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
  profile.schedule.providerConnections.google.selectedCalendarIds = ["primary"];
  assert.equal(saveProfileDraft(profile, storage), true);
  assert.deepEqual(loadProfileDraft(storage).value.interests.topicIds, ["ai"]);
  assert.equal(saveProfile(profile, storage), true);
  assert.equal(loadProfileDraft(storage).value, null);
  assert.deepEqual(loadSavedProfile(storage).value.interests.topicIds, ["ai"]);
  assert.deepEqual(loadSavedProfile(storage).value.schedule.providerConnections.google.selectedCalendarIds, ["primary"]);
  assert.equal(clearStoredProfile(storage), true);
  assert.equal(loadSavedProfile(storage).value, null);
});

test("invalid storage data fails safely", () => {
  const storage = memoryStorage();
  storage.setItem("msba-opportunity-hub.profile.v1", "not-json");
  assert.deepEqual(loadSavedProfile(storage), { value: null, available: false });
});

test("older profiles gain empty background fields and session resume metadata is cleared on reload", () => {
  const storage = memoryStorage();
  const olderProfile = createInitialProfile();
  delete olderProfile.background;
  delete olderProfile.sectionStatus.background;
  storage.setItem("msba-opportunity-hub.profile-draft.v1", JSON.stringify(olderProfile));
  assert.deepEqual(loadProfileDraft(storage).value.background, { text: "", resume: null });

  const current = createInitialProfile();
  current.background = { text: "Analytics student", resume: { fileName: "resume.pdf", size: 100, storageStatus: "session-selected" } };
  storage.setItem("msba-opportunity-hub.profile-draft.v1", JSON.stringify(current));
  assert.deepEqual(loadProfileDraft(storage).value.background, { text: "Analytics student", resume: null });
});

