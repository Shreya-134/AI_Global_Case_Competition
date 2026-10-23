import test from "node:test";
import assert from "node:assert/strict";
import { mergeBusyBlocks, parseCalendarText, replaceSourceBlocks, validateCalendarFile } from "../src/services/calendarImport.js";

const calendar = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Test//Calendar//EN\r
BEGIN:VEVENT\r
UID:series-1\r
DTSTART:20261026T160000Z\r
DTEND:20261026T170000Z\r
RRULE:FREQ=DAILY;COUNT=4\r
EXDATE:20261027T160000Z\r
SUMMARY:Analytics class\r
DESCRIPTION:Private notes that must not be retained\r
LOCATION:Private room\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:transparent-1\r
DTSTART:20261027T180000Z\r
DTEND:20261027T190000Z\r
TRANSP:TRANSPARENT\r
SUMMARY:Free time\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:cancelled-1\r
DTSTART:20261028T180000Z\r
DTEND:20261028T190000Z\r
STATUS:CANCELLED\r
SUMMARY:Cancelled\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:all-day-1\r
DTSTART;VALUE=DATE:20261029\r
DTEND;VALUE=DATE:20261030\r
SUMMARY:All-day commitment\r
END:VEVENT\r
END:VCALENDAR`;

test("ICS import expands bounded recurrence, honors exclusions, and drops private fields", () => {
  const result = parseCalendarText(calendar, { rangeStart: "2026-10-26", rangeEnd: "2026-10-30" });
  assert.equal(result.blocks.length, 4);
  assert.equal(result.blocks.every((block) => block.label === "Busy"), true);
  assert.equal(result.blocks.filter((block) => !block.allDay).length, 3);
  assert.equal(result.blocks.some((block) => block.allDay), true);
  assert.equal("description" in result.blocks[0], false);
  assert.equal("location" in result.blocks[0], false);
});

test("unsupported timezone data is reported instead of imported", () => {
  const text = `BEGIN:VCALENDAR\r
VERSION:2.0\r
BEGIN:VEVENT\r
UID:tz-1\r
DTSTART;TZID=Unknown/Zone:20261026T160000\r
DTEND;TZID=Unknown/Zone:20261026T170000\r
SUMMARY:Unknown zone\r
END:VEVENT\r
END:VCALENDAR`;
  const result = parseCalendarText(text, { rangeStart: "2026-10-26", rangeEnd: "2026-10-27" });
  assert.equal(result.blocks.length, 0);
  assert.match(result.warnings[0], /unsupported time zone/);
});

test("recurrence exceptions are honored within the selected range", () => {
  const text = `BEGIN:VCALENDAR\r
VERSION:2.0\r
BEGIN:VEVENT\r
UID:exception-series\r
DTSTART:20261026T160000Z\r
DTEND:20261026T170000Z\r
RRULE:FREQ=DAILY;COUNT=3\r
SUMMARY:Recurring class\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:exception-series\r
RECURRENCE-ID:20261027T160000Z\r
DTSTART:20261027T160000Z\r
DTEND:20261027T170000Z\r
STATUS:CANCELLED\r
SUMMARY:Cancelled occurrence\r
END:VEVENT\r
END:VCALENDAR`;
  const result = parseCalendarText(text, { rangeStart: "2026-10-26", rangeEnd: "2026-10-29" });
  assert.equal(result.blocks.length, 2);
  assert.equal(result.blocks.some((block) => block.label === "Cancelled occurrence"), false);
});

test("reimporting the same file does not duplicate busy blocks", () => {
  const imported = parseCalendarText(calendar, { rangeStart: "2026-10-26", rangeEnd: "2026-10-30" }).blocks;
  assert.equal(mergeBusyBlocks(imported, imported).length, imported.length);
});

test("file validation checks extension and size", () => {
  assert.equal(validateCalendarFile({ name: "calendar.txt", size: 10 }, 100), "file-extension");
  assert.equal(validateCalendarFile({ name: "calendar.ics", size: 101 }, 100), "file-too-large");
  assert.equal(validateCalendarFile({ name: "calendar.ics", size: 10 }, 100), null);
});

test("refreshing or removing one source preserves other schedule sources", () => {
  const existing = [
    { id: "manual-1", source: "manual", sourceId: "manual" },
    { id: "google-old", source: "google", sourceId: "google" },
    { id: "file-1", source: "calendar-file", sourceId: "calendar-file" },
  ];
  assert.deepEqual(replaceSourceBlocks(existing, "google", [{ id: "google-new", sourceId: "google" }]).map((item) => item.id), ["manual-1", "file-1", "google-new"]);
  assert.deepEqual(replaceSourceBlocks(existing, "google", []).map((item) => item.id), ["manual-1", "file-1"]);
});

