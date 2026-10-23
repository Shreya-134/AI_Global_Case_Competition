import test from "node:test";
import assert from "node:assert/strict";
import { createGoogleCalendarProvider, freeBusyResponseToBlocks, GOOGLE_SCOPES } from "../src/services/calendarProviders/googleCalendarProvider.js";
import { classifyGoogleError, providerStates } from "../src/services/calendarProviders/providerStates.js";

test("Google provider requests only calendar list and free/busy scopes", () => {
  assert.deepEqual(GOOGLE_SCOPES, [
    "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
    "https://www.googleapis.com/auth/calendar.freebusy",
  ]);
});

test("permission, cancellation, expiry, and request errors are classified", () => {
  assert.equal(classifyGoogleError({ error: "access_denied" }), "google-permission");
  assert.equal(classifyGoogleError({ type: "popup_closed" }), "google-cancelled");
  assert.equal(classifyGoogleError({ status: 401 }), "google-expired");
  assert.equal(classifyGoogleError({ status: 500 }), "google-request");
});

test("calendar selection maps only selected free/busy ranges without event details", () => {
  const blocks = freeBusyResponseToBlocks({ calendars: { work: { busy: [{ start: "2026-11-01T17:00:00Z", end: "2026-11-01T18:00:00Z" }] }, private: { busy: [{ start: "2026-11-02T17:00:00Z", end: "2026-11-02T18:00:00Z" }] } } }, ["work"]);
  assert.equal(blocks.length, 1); assert.equal(blocks[0].label, "Busy"); assert.equal(blocks[0].sourceId, "google");
});

test("unconfigured Google provider never reports a connection", async () => {
  const provider = createGoogleCalendarProvider({ clientId: "", loadIdentity: async () => { throw new Error("must not load"); }, fetchImpl: async () => { throw new Error("must not fetch"); } });
  assert.equal(provider.isConfigured, false);
  assert.deepEqual(await provider.connect(), { status: providerStates.ERROR, errorCode: "google-request" });
});
