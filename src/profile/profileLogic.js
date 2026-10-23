import { createStableId } from "./profileSchema.js";

export function normalizeEntry(value) {
  return value.trim().replace(/\s+/g, " ");
}

export function addCustomEntry(value, predefined, customEntries, prefix = "custom") {
  const label = normalizeEntry(value);
  if (!label) return { error: "empty", entries: customEntries, added: null };
  const normalized = label.toLocaleLowerCase();
  const duplicate = [...predefined, ...customEntries].some(
    (option) => option.label.toLocaleLowerCase() === normalized,
  );
  if (duplicate) return { error: "duplicate", entries: customEntries, added: null };
  const added = { id: createStableId(prefix, label), label };
  return { error: null, entries: [...customEntries, added], added };
}

export function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function selectIndustry(industries, id) {
  return { ...industries, stillExploring: false, industryIds: toggleId(industries.industryIds, id) };
}

export function selectStillExploring(industries) {
  return { ...industries, stillExploring: !industries.stillExploring, industryIds: [], customIndustries: [] };
}

export function toggleGoal(career, goalId) {
  const goalIds = toggleId(career.goalIds, goalId);
  return {
    goalIds,
    priorityGoalId: goalIds.includes(career.priorityGoalId) ? career.priorityGoalId : null,
  };
}

export function selectPreferredTime(selected, id) {
  if (id === "any") return selected.includes("any") ? [] : ["any"];
  return toggleId(selected.filter((item) => item !== "any"), id);
}

export function validateCareer(career) {
  return career.goalIds.length > 0 && !career.priorityGoalId ? "priority-required" : null;
}

export function validateManualBlock(block) {
  const errors = {};
  if (!block.startTime) errors.startTime = "Choose a start time.";
  if (!block.endTime) errors.endTime = "Choose an end time.";
  if (block.startTime && block.endTime && block.endTime <= block.startTime) {
    errors.endTime = "End time must be after start time. Overnight blocks are not supported.";
  }
  if (block.recurrence === "once") {
    if (!block.date) errors.date = "Choose a date.";
  } else {
    if (!block.weekdays?.length) errors.weekdays = "Choose at least one weekday.";
    if (!block.startDate) errors.startDate = "Choose a start date.";
    if (!block.endDate) errors.endDate = "Choose an end date.";
    if (block.startDate && block.endDate && block.endDate < block.startDate) {
      errors.endDate = "End date must be on or after the start date.";
    }
  }
  if (!block.timezone) errors.timezone = "Choose a time zone.";
  return errors;
}

export function sectionHasData(profile, sectionId) {
  switch (sectionId) {
    case "interests": return Boolean(profile.interests.topicIds.length || profile.interests.customTopics.length || profile.interests.eventTypeIds.length);
    case "industries": return Boolean(profile.industries.stillExploring || profile.industries.industryIds.length || profile.industries.customIndustries.length);
    case "career": return profile.career.goalIds.length > 0;
    case "carpool": return Boolean(profile.carpool.startingPoint || profile.carpool.meetingDistanceId);
    case "schedule": return Boolean(
      profile.schedule.busyBlocks.length ||
      profile.schedule.varies ||
      profile.schedule.preferredTimeIds.some((id) => id !== "any"),
    );
    default: return false;
  }
}

export function getStepAfterSave(currentStep, returnToReview, reviewIndex) {
  return returnToReview ? reviewIndex : Math.min(currentStep + 1, reviewIndex);
}

export function markSectionSkipped(profile, sectionId) {
  return {
    ...profile,
    sectionStatus: { ...profile.sectionStatus, [sectionId]: "skipped" },
  };
}

