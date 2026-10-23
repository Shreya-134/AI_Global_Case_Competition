export const providerStates = Object.freeze({
  NOT_CONNECTED: "not-connected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  PERMISSION_DENIED: "permission-denied",
  RECONNECTION_REQUIRED: "reconnection-required",
  IMPORTING: "importing",
  READY: "ready-for-review",
  ERROR: "error",
});

export function classifyGoogleError(error) {
  const code = error?.type || error?.error || error?.code;
  if (["popup_closed", "popup_failed_to_open", "cancelled"].includes(code)) return "google-cancelled";
  if (["access_denied", "consent_required"].includes(code)) return "google-permission";
  if (error?.status === 401 || code === 401) return "google-expired";
  return "google-request";
}
