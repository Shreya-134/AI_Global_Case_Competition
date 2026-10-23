import { providerStates } from "./providerStates.js";

// Browser apps cannot request EventKit access. This adapter keeps the same
// provider shape so a future native wrapper can replace it without UI rewrites.
export const appleCalendarProvider = {
  id: "apple",
  isConfigured: false,
  connect() { return Promise.resolve({ status: providerStates.NOT_CONNECTED, requiresFile: true }); },
  disconnect() { return { status: providerStates.NOT_CONNECTED }; },
};
