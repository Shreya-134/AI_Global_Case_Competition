/*
 * HOMEPAGE CONTENT
 * Change homepage copy, slide content, destinations, and timing here.
 */

// Change the shared product name here.
const productName = "Your Product Name";

export const homepageConfig = {
  productName,
  metaDescription: "Discover events, meet classmates, and make time for meaningful opportunities.",
  headline: "Your next connection starts here.",
  headlineHighlight: "connection",
  description: "Discover events, find your people, and make time for what matters.",
  exploreButtonLabel: "Explore events",
  authButtonLabel: "Sign up / Log in",

  // Add application routes when the Events and Auth pages exist.
  destinations: {
    exploreEvents: null,
    authentication: null,
  },

  carousel: {
    eyebrow: "A little preview of what’s possible",
    exampleLabel: "Example preview",
    previousLabel: "Show previous feature",
    nextLabel: "Show next feature",
    pauseLabel: "Pause slideshow",
    playLabel: "Resume slideshow",
    reducedMotionLabel: "Autoplay off",
    slideLabel: "Feature",
    slides: [
      {
        id: "ai-assistance",
        navigationLabel: "AI assistance",
        title: "Meet your AI event assistant",
        description: "Tell us what you’re looking for. Discover events that fit.",
        illustration: "ai",
      },
      {
        id: "integrated-calendar",
        navigationLabel: "Integrated calendar",
        title: "Make room for the right events",
        description: "See opportunities alongside your classes and commitments.",
        illustration: "calendar",
      },
      {
        id: "carpool-connections",
        navigationLabel: "Carpool connections",
        title: "Get there together",
        description: "Connect with USC MSBA classmates attending the same off-campus event.",
        illustration: "carpool",
      },
    ],
  },

  demoChat: {
    userLabel: "Student",
    assistantLabel: "Event assistant",
    userMessage: "Any AI networking events after class?",
    typingLabel: "Finding an idea",
    assistantMessage: "Here are a few ideas for your week.",
  },

  // This one object is shared by the AI and calendar slides.
  exampleEvent: {
    name: "AI & Analytics Mixer",
    date: "2026-10-29",
    startTime: "18:00",
    endTime: "20:00",
    timezone: "America/Los_Angeles",
    location: "Downtown Los Angeles",
  },

  calendar: {
    importLabel: "Calendar availability",
    importStatus: "Illustrative import",
    days: [
      { id: "wed", date: "2026-10-28", shortLabel: "Wed" },
      { id: "thu", date: "2026-10-29", shortLabel: "Thu" },
      { id: "fri", date: "2026-10-30", shortLabel: "Fri" },
    ],
    commitments: [
      { id: "class-wed", dayId: "wed", label: "Class", slot: "afternoon" },
      { id: "work-thu", dayId: "thu", label: "Project", slot: "afternoon" },
      { id: "class-fri", dayId: "fri", label: "Class", slot: "morning" },
    ],
  },

  carpool: {
    pickupLabel: "Campus meeting point",
    pickup: "USC University Park",
    destinationLabel: "Event destination",
    destination: "Downtown Los Angeles",
    connectionLabel: "Same event. Shared ride.",
    disclaimer: "Illustrative classmates and route—not a live ride match.",
    avatars: [
      { id: "maya", initials: "MK", label: "Fictional classmate Maya" },
      { id: "dev", initials: "DL", label: "Fictional classmate Dev" },
      { id: "ana", initials: "AR", label: "Fictional classmate Ana" },
    ],
  },

  // Change autoplay and transition timing here. Values are milliseconds.
  animation: {
    autoplayMs: 8000,
    transitionMs: 450,
    chatUserDelayMs: 350,
    chatTypingDelayMs: 1150,
    chatResponseDelayMs: 2200,
    chatEventDelayMs: 3100,
  },
};
