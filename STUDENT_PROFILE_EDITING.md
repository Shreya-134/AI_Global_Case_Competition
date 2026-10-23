# Editing the student profile

## Content

Edit `src/config/onboardingConfig.js` for headings, helper text, button labels, choice labels, validation messages, and calendar copy. The file includes comments for the most common edits. Product name is shared with the homepage through `src/config/homepageConfig.js`.

Examples:

```js
// src/config/homepageConfig.js
productName: "USC Event Compass"

// src/config/onboardingConfig.js
buttons: { continue: "Next", /* keep the other existing labels */ }
industries: {
  options: [
    { id: "technology", label: "Tech" },
    { id: "sports", label: "Sports" }, // New IDs should be unique and permanent.
  ]
}
```

Descriptions and helper text are grouped under the relevant screen or `schedule` section in `src/config/onboardingConfig.js`.

Keep option `id` values stable when changing labels. Saved profiles store IDs, so changing `Technology` to `Tech` is safe when its ID remains `technology`. Changing or deleting an ID can make an older selection unavailable in the review screen.

## Layout and behavior

- `src/pages/StudentProfile/StudentProfileOnboarding.jsx`: flow and persistence.
- `src/pages/StudentProfile/steps/`: one file per editable step.
- `src/pages/StudentProfile/StudentProfileOnboarding.css`: profile-only layout and responsive styles.
- `src/profile/profileSchema.js`: saved data shape and backward-compatible defaults.
- `src/profile/profileLogic.js`: framework-independent selection and validation logic.
- `src/services/calendarProviders/`: provider adapters and shared connection states.
- `src/services/calendarImport.js`: local `.ics` parsing and source-aware replacement.

Shared colors, typography, spacing, and components remain under `src/theme` and `src/components/ui`. Do not copy theme values into profile files.

Other features can read the normalized saved profile without importing onboarding UI:

```js
import { loadSavedProfile } from "./src/services/profileStorage.js";

const { value: profile } = loadSavedProfile();
const busyBlocks = profile?.schedule.busyBlocks ?? [];
```

## Testing changes

Run:

```bash
npm test
npm run build
```

Preview the profile at `http://localhost:5173/onboarding` after running `npm run dev` from the repository root.
