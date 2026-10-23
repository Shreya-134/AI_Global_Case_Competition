export const PROFILE_SCHEMA_VERSION = 1;

export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
  } catch {
    return "America/Los_Angeles";
  }
}

export function createInitialProfile() {
  const today = new Date();
  const rangeEnd = new Date(today.getTime() + 90 * 86400000);
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    setupComplete: false,
    completedAt: null,
    sectionStatus: {
      background: "not-started",
      interests: "not-started", industries: "not-started", career: "not-started",
      carpool: "not-started", schedule: "not-started",
    },
    background: { text: "", resume: null },
    interests: { topicIds: [], customTopics: [], eventTypeIds: [] },
    industries: { industryIds: [], customIndustries: [], stillExploring: false },
    career: { goalIds: [], priorityGoalId: null },
    carpool: { startingPoint: "", meetingDistanceId: null },
    schedule: {
      timezone: getDeviceTimeZone(), varies: false, preferredTimeIds: ["any"], busyBlocks: [],
      importRange: { start: today.toISOString().slice(0, 10), end: rangeEnd.toISOString().slice(0, 10) },
      providerConnections: {
        google: { status: "not-connected", selectedCalendarIds: [], calendars: [], lastSuccessfulRefresh: null },
        apple: { status: "not-connected", selectedCalendarIds: [], calendars: [], lastSuccessfulRefresh: null },
      },
      uploadedCalendars: [],
    },
  };
}

export function hydrateProfile(value) {
  const initial = createInitialProfile();
  if (!value || value.schemaVersion !== PROFILE_SCHEMA_VERSION) return initial;
  const profile = {
    ...initial, ...value,
    sectionStatus: { ...initial.sectionStatus, ...value.sectionStatus },
    background: { ...initial.background, ...value.background, resume: null },
    interests: { ...initial.interests, ...value.interests },
    industries: { ...initial.industries, ...value.industries },
    career: { ...initial.career, ...value.career },
    carpool: { ...initial.carpool, ...value.carpool },
    schedule: {
      ...initial.schedule, ...value.schedule,
      importRange: { ...initial.schedule.importRange, ...value.schedule?.importRange },
      providerConnections: {
        google: { ...initial.schedule.providerConnections.google, ...value.schedule?.providerConnections?.google },
        apple: { ...initial.schedule.providerConnections.apple, ...value.schedule?.providerConnections?.apple },
      },
      uploadedCalendars: Array.isArray(value.schedule?.uploadedCalendars) ? value.schedule.uploadedCalendars : [],
    },
  };
  if (profile.schedule.providerConnections.google.status === "connected" || profile.schedule.providerConnections.google.status === "importing") {
    profile.schedule.providerConnections.google.status = "reconnection-required";
  }
  return profile;
}

export function createStableId(prefix, label) {
  const slug = label.toLocaleLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom";
  const randomPart = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${slug}-${randomPart}`;
}

