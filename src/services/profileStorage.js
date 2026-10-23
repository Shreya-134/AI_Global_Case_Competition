import { hydrateProfile } from "../profile/profileSchema.js";

export const PROFILE_DRAFT_KEY = "msba-opportunity-hub.profile-draft.v1";
export const SAVED_PROFILE_KEY = "msba-opportunity-hub.profile.v1";

function browserStorage() {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}

function read(key, storage = browserStorage()) {
  if (!storage) return { value: null, available: false };
  try {
    const serialized = storage.getItem(key);
    return { value: serialized ? hydrateProfile(JSON.parse(serialized)) : null, available: true };
  } catch { return { value: null, available: false }; }
}

function write(key, profile, storage = browserStorage()) {
  if (!storage) return false;
  try { storage.setItem(key, JSON.stringify(profile)); return true; } catch { return false; }
}

export function loadProfileDraft(storage) { return read(PROFILE_DRAFT_KEY, storage); }
export function saveProfileDraft(profile, storage) { return write(PROFILE_DRAFT_KEY, profile, storage); }

// Other features can read the saved profile without importing onboarding UI code.
export function loadSavedProfile(storage) { return read(SAVED_PROFILE_KEY, storage); }

export function saveProfile(profile, storage) {
  const target = storage ?? browserStorage();
  if (!write(SAVED_PROFILE_KEY, profile, target)) return false;
  try { target?.removeItem(PROFILE_DRAFT_KEY); return true; } catch { return false; }
}

export function clearStoredProfile(storage = browserStorage()) {
  if (!storage) return false;
  try {
    storage.removeItem(PROFILE_DRAFT_KEY); storage.removeItem(SAVED_PROFILE_KEY); return true;
  } catch { return false; }
}

