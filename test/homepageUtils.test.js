import test from "node:test";
import assert from "node:assert/strict";
import { homepageConfig } from "../src/config/homepageConfig.js";
import { formatEventDate, formatEventTimeRange, swipeDirection, wrappedIndex } from "../src/pages/Homepage/homepageUtils.js";

test("carousel indices wrap in both directions", () => {
  assert.equal(wrappedIndex(3, 3), 0);
  assert.equal(wrappedIndex(-1, 3), 2);
});

test("swipes require a deliberate horizontal gesture", () => {
  assert.equal(swipeDirection({ x: 200, y: 100 }, { x: 100, y: 110 }), 1);
  assert.equal(swipeDirection({ x: 100, y: 100 }, { x: 180, y: 105 }), -1);
  assert.equal(swipeDirection({ x: 100, y: 100 }, { x: 110, y: 190 }), 0);
});

test("the shared event derives one consistent date and time", () => {
  assert.equal(formatEventDate(homepageConfig.exampleEvent, "en-US"), "Thursday, October 29, 2026");
  assert.equal(formatEventTimeRange(homepageConfig.exampleEvent, "en-US"), "6:00–8:00 PM");
  assert.equal(homepageConfig.calendar.days.find((day) => day.date === homepageConfig.exampleEvent.date)?.shortLabel, "Thu");
  assert.equal(homepageConfig.carpool.destination, homepageConfig.exampleEvent.location);
});
