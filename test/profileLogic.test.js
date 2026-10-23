import test from "node:test";
import assert from "node:assert/strict";
import { createInitialProfile } from "../src/profile/profileSchema.js";
import {
  addCustomEntry,
  getStepAfterSave,
  markSectionSkipped,
  resolveOptionLabels,
  selectIndustry,
  selectPreferredTime,
  selectStillExploring,
  toggleGoal,
  validateCareer,
  validateManualBlock,
  sectionHasData,
} from "../src/profile/profileLogic.js";

test("custom entries trim whitespace and reject case-insensitive duplicates", () => {
  const predefined = [{ id: "ai", label: "AI" }];
  const added = addCustomEntry("  Product   Strategy  ", predefined, [], "topic");
  assert.equal(added.error, null);
  assert.equal(added.added.label, "Product Strategy");
  assert.equal(addCustomEntry(" product strategy ", predefined, added.entries).error, "duplicate");
  assert.equal(addCustomEntry(" ai ", predefined, added.entries).error, "duplicate");
  assert.equal(addCustomEntry("   ", predefined, added.entries).error, "empty");
});

test("still exploring clears industries and an industry clears still exploring", () => {
  const initial = { industryIds: ["technology"], customIndustries: [{ id: "custom", label: "Space" }], stillExploring: false };
  const exploring = selectStillExploring(initial);
  assert.deepEqual(exploring.industryIds, []);
  assert.deepEqual(exploring.customIndustries, []);
  assert.equal(exploring.stillExploring, true);
  assert.deepEqual(selectIndustry(exploring, "finance"), { industryIds: ["finance"], customIndustries: [], stillExploring: false });
});

test("removing the priority goal clears priority and validation requires a selected priority", () => {
  const withGoals = { goalIds: ["internship", "mentor"], priorityGoalId: "mentor" };
  const removed = toggleGoal(withGoals, "mentor");
  assert.equal(removed.priorityGoalId, null);
  assert.equal(validateCareer(removed), "priority-required");
  assert.equal(validateCareer({ goalIds: [], priorityGoalId: null }), null);
});

test("Any time is mutually exclusive with specific preferences", () => {
  assert.deepEqual(selectPreferredTime(["any"], "morning"), ["morning"]);
  assert.deepEqual(selectPreferredTime(["morning", "weekends"], "any"), ["any"]);
});

test("manual schedule validation covers times, weekdays, date ranges, and overnight blocks", () => {
  const invalid = validateManualBlock({ recurrence: "weekly", weekdays: [], startDate: "2026-11-10", endDate: "2026-11-01", startTime: "18:00", endTime: "08:00", timezone: "" });
  assert.ok(invalid.weekdays);
  assert.ok(invalid.endDate);
  assert.equal(invalid.endTime, "end-after-start");
  assert.ok(invalid.timezone);
  assert.deepEqual(validateManualBlock({ recurrence: "once", date: "2026-11-01", startTime: "16:00", endTime: "17:00", timezone: "America/Los_Angeles" }), {});
});

test("saved option IDs keep working when display labels are edited", () => {
  const savedIds = ["technology"];
  assert.deepEqual(resolveOptionLabels(savedIds, [{ id: "technology", label: "Tech" }]), ["Tech"]);
});

test("skipping preserves prior answers and review edits return to review", () => {
  const profile = createInitialProfile();
  profile.carpool.startingPoint = "USC University Park campus";
  const skipped = markSectionSkipped(profile, "carpool");
  assert.equal(skipped.carpool.startingPoint, "USC University Park campus");
  assert.equal(skipped.sectionStatus.carpool, "skipped");
  assert.equal(getStepAfterSave(2, true, 5), 5);
  assert.equal(getStepAfterSave(2, false, 5), 3);
});

test("background whitespace is empty while text or resume metadata counts as provided", () => {
  const profile = createInitialProfile();
  profile.background.text = "   \n ";
  assert.equal(sectionHasData(profile, "background"), false);
  profile.background.text = "Career changer";
  assert.equal(sectionHasData(profile, "background"), true);
  profile.background.text = "";
  profile.background.resume = { fileName: "resume.pdf", storageStatus: "session-selected" };
  assert.equal(sectionHasData(profile, "background"), true);
});

