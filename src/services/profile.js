export const STORAGE_KEY = "msba-opportunity-hub:v1";
export const browserStorage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
export const steps = [
  "Your background",
  "Your direction",
  "Your networking week",
  "Your availability",
  "Review and finish",
];
export const blankProfile = () => ({
  name: "",
  email: "",
  experience: "",
  skills: [],
  interests: [],
  roles: [],
  industries: [],
  learning: [],
  hours: 4,
  topics: [],
  types: [],
  formats: [],
  budget: "Free events",
  availability: [],
  timezone: "America/Los_Angeles",
  generationDay: "Sunday",
  generationTime: "18:00",
  calendarView: "Agenda",
  attendanceVisible: false,
  carpoolEnabled: false,
});
const arrayFields = [
  "skills",
  "interests",
  "roles",
  "industries",
  "learning",
  "topics",
  "types",
  "formats",
  "availability",
];
export function validProfile(value) {
  const base = blankProfile();
  return Boolean(
    value &&
    typeof value === "object" &&
    Object.keys(base).every((key) =>
      arrayFields.includes(key)
        ? Array.isArray(value[key]) &&
          value[key].every((item) => typeof item === "string")
        : typeof value[key] === typeof base[key],
    ) &&
    Number.isInteger(value.hours) &&
    value.hours >= 1 &&
    value.hours <= 12 &&
    !value.attendanceVisible &&
    !value.carpoolEnabled,
  );
}
export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw)
      return { profile: blankProfile(), stage: -1, saved: null, notice: "" };
    const data = JSON.parse(raw);
    if (
      data.version !== 1 ||
      !validProfile(data.profile) ||
      !Number.isInteger(data.stage) ||
      data.stage < -1 ||
      data.stage > 5 ||
      (data.saved !== null && !validProfile(data.saved))
    )
      throw new Error("Invalid profile");
    return {
      ...data,
      notice:
        data.stage >= 0 && data.stage < 5
          ? "Your draft is ready. Pick up where you left off."
          : "",
    };
  } catch {
    return {
      profile: blankProfile(),
      stage: -1,
      saved: null,
      notice:
        "We could not read your saved profile and reset it. Please create a new demo profile.",
    };
  }
}
export function persistState(storage, state) {
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        profile: state.profile,
        stage: state.stage,
        saved: state.saved,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
