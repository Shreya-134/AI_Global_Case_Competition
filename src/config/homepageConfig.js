/*
 * HOMEPAGE CONTENT
 * Edit product names, button labels, demo events, and animation speed here.
 * Homepage components read from this file so content is not duplicated in layouts.
 */

const productName = "Your Product Name";

// Leave this empty to derive the assistant name as `${productName} AI`.
const assistantNameOverride = "Campus AI";

export const homepageConfig = {
  productName,
  assistantName: assistantNameOverride || `${productName} AI`,
  metaDescription: "A sample preview of a personalized campus event planning experience.",
  headline: "Your next connection starts here.",
  subtitle: "Find campus events that fit your interests and your schedule.",
  exploreButtonLabel: "Explore events",
  authButtonLabel: "Sign up / Log in",
  dashboardTitle: "Your personalized week",
  chatPlaceholder: "Ask about events...",
  previewLabel: "Example preview",

  // Add actual application routes here when the Events and Auth pages exist.
  destinations: {
    exploreEvents: null,
    authentication: null,
  },

  labels: {
    interestGroup: "Interests",
    availabilityGroup: "Availability",
    calendar: "Sample weekly calendar",
    assistantPanel: "Planning assistant",
    demoBadge: "Demo",
    routePending: "Destination route coming soon",
    quickSuggestions: "Try a preset",
    pause: "Pause demo",
    resume: "Resume demo",
    replay: "Replay demo",
    reducedMotion: "Animation off",
    typing: "is finding matches",
    eventLocationSeparator: "·",
    timezone: "PT",
    studentLabel: "Student",
    profileInitials: "MS",
  },

  interests: ["AI & ML", "Analytics", "Product", "Networking"],
  availability: ["After 3 PM", "Wednesday–Friday", "4 hours this week"],

  calendar: {
    startHour: 15,
    endHour: 19,
    days: [
      { id: "wed", shortLabel: "Wed", longLabel: "Wednesday", dateLabel: "Oct 28" },
      { id: "thu", shortLabel: "Thu", longLabel: "Thursday", dateLabel: "Oct 29" },
      { id: "fri", shortLabel: "Fri", longLabel: "Friday", dateLabel: "Oct 30" },
    ],
  },

  // Change demo event names, days, times, and locations here.
  events: [
    {
      id: "ai-mixer",
      name: "AI & Analytics Mixer",
      dayId: "wed",
      start: "16:00",
      end: "17:15",
      location: "Marshall Courtyard",
      tone: "lavender",
    },
    {
      id: "data-roundtable",
      name: "Women in Data Roundtable",
      dayId: "thu",
      start: "17:00",
      end: "18:15",
      location: "Fertitta Hall",
      tone: "yellow",
    },
    {
      id: "product-night",
      name: "Product & Tech Night",
      dayId: "fri",
      start: "15:30",
      end: "17:00",
      location: "Online",
      tone: "lavender",
    },
    {
      id: "alumni-social",
      name: "MSBA Alumni Social",
      dayId: "wed",
      start: "17:30",
      end: "18:30",
      location: "Popovich Hall",
      tone: "yellow",
    },
  ],

  // Demo chat copy and preset results stay linked to event IDs above.
  assistantGreeting: "Hi! I can build a sample event plan around your interests.",
  assistantResponseLead: "I found these sample matches for your week:",
  presets: [
    {
      id: "after-three",
      label: "Networking + tech after 3 PM",
      userMessage: "Find networking and tech events after 3 PM.",
      eventIds: ["ai-mixer", "data-roundtable", "product-night"],
    },
    {
      id: "wednesday",
      label: "Wednesday networking",
      userMessage: "Show me networking events on Wednesday after class.",
      eventIds: ["ai-mixer", "alumni-social"],
    },
    {
      id: "virtual",
      label: "Virtual tech event",
      userMessage: "Find a virtual tech event after 3 PM.",
      eventIds: ["product-night"],
    },
  ],

  // Animation timing is in milliseconds. Increase readingPauseMs for a slower loop.
  animation: {
    greetingMs: 1400,
    userMessageMs: 1200,
    typingMs: 1300,
    responseLeadMs: 700,
    highlightMs: 1600,
    readingPauseMs: 5200,
  },
};

