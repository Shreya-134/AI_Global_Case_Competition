import { providerStates, classifyGoogleError } from "./providerStates.js";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

let scriptPromise;

function loadGoogleIdentityScript() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve(globalThis.google);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity="true"]');
    const script = existing || document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", () => resolve(globalThis.google), { once: true });
    script.addEventListener("error", () => reject({ code: "script-load" }), { once: true });
    if (!existing) document.head.append(script);
  });
  return scriptPromise;
}

async function calendarRequest(path, token, options = {}, fetchImpl = fetch) {
  const response = await fetchImpl(`https://www.googleapis.com/calendar/v3${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) throw { status: response.status };
  return response.json();
}

export function freeBusyResponseToBlocks(response, selectedCalendarIds) {
  return selectedCalendarIds.flatMap((calendarId) =>
    (response.calendars?.[calendarId]?.busy || []).map((range, index) => ({
      id: `google-${calendarId}-${range.start}-${index}`.replace(/[^a-zA-Z0-9-]/g, "-"),
      label: "Busy", recurrence: "once", start: range.start, end: range.end,
      allDay: false, timezone: "UTC", source: "google", sourceId: "google",
      sourceRef: `${calendarId}|${range.start}|${range.end}`,
    })),
  );
}

export function createGoogleCalendarProvider({
  clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID,
  loadIdentity = loadGoogleIdentityScript,
  fetchImpl = fetch,
} = {}) {
  let token = null;
  let tokenClient = null;

  const requestToken = async () => {
    const googleApi = await loadIdentity();
    return new Promise((resolve, reject) => {
      tokenClient = googleApi.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES.join(" "),
        callback: (response) => response?.error ? reject(response) : resolve(response.access_token),
        error_callback: reject,
      });
      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  };

  return {
    id: "google",
    isConfigured: Boolean(clientId),
    get hasSession() { return Boolean(token); },
    async connect() {
      if (!clientId) return { status: providerStates.ERROR, errorCode: "google-request" };
      try {
        token = await requestToken();
        const data = await calendarRequest("/users/me/calendarList?minAccessRole=freeBusyReader&maxResults=250", token, {}, fetchImpl);
        return {
          status: providerStates.CONNECTED,
          calendars: (data.items || []).map(({ id, summary, primary }) => ({ id, label: summary || "Calendar", primary: Boolean(primary) })),
        };
      } catch (error) {
        token = null;
        const errorCode = classifyGoogleError(error);
        return { status: errorCode === "google-permission" ? providerStates.PERMISSION_DENIED : providerStates.ERROR, errorCode };
      }
    },
    async importBusy({ calendarIds, rangeStart, rangeEnd, timezone }) {
      if (!token) return { status: providerStates.RECONNECTION_REQUIRED, errorCode: "google-expired" };
      try {
        const response = await calendarRequest("/freeBusy", token, {
          method: "POST",
          body: JSON.stringify({
            timeMin: new Date(`${rangeStart}T00:00:00`).toISOString(),
            timeMax: new Date(`${rangeEnd}T23:59:59.999`).toISOString(),
            timeZone: timezone,
            items: calendarIds.map((id) => ({ id })),
          }),
        }, fetchImpl);
        return { status: providerStates.READY, blocks: freeBusyResponseToBlocks(response, calendarIds) };
      } catch (error) {
        const errorCode = classifyGoogleError(error);
        if (errorCode === "google-expired") token = null;
        return { status: errorCode === "google-expired" ? providerStates.RECONNECTION_REQUIRED : providerStates.ERROR, errorCode };
      }
    },
    disconnect() {
      const current = token;
      token = null;
      if (current && globalThis.google?.accounts?.oauth2?.revoke) globalThis.google.accounts.oauth2.revoke(current, () => {});
      return { status: providerStates.NOT_CONNECTED };
    },
  };
}
