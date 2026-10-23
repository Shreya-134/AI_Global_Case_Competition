# Shared Theme

The shared theme is independent of page layouts. It provides reusable design
tokens and UI building blocks for future React features.

## File locations

- `src/theme/fonts.css` loads Inter and Plus Jakarta Sans with system fallbacks.
- `src/theme/tokens.css` defines color, typography, spacing, radius, shadow, and
  interaction tokens.
- `src/theme/base.css` provides the shared light theme baseline, focus treatment,
  and reduced-motion behavior.
- `src/theme/index.css` is the theme CSS entry point.
- `src/components/ui/` contains generic React components and their shared styles.

## Import the theme

Once the React/Vite app entry exists, import the theme once near the root:

```jsx
import "./theme/index.css";
```

Shared components can be imported through the UI barrel file:

```jsx
import { Button, Card, InterestChip } from "./components/ui";
```

Each component also imports its shared styles, so direct imports remain usable:

```jsx
import Button from "./components/ui/Button";
```

## Example in another feature

This example is deliberately feature-neutral and contains no page-specific
content or layout:

```jsx
import { Button, Card, TextInput } from "../components/ui";

export default function ExampleFeature() {
  return (
    <Card aria-labelledby="example-heading">
      <h2 id="example-heading">Feature settings</h2>
      <TextInput label="Display name" name="displayName" />
      <Button type="submit">Save changes</Button>
    </Card>
  );
}
```

## Component APIs

- `Button`: `variant="primary|secondary"`; use `surface="dark"` for a secondary
  button placed on a dark background.
- `Card`: supports `as`, `elevated`, and normal element attributes.
- `TextInput`: requires a visible `label`; accepts `hint`, `error`, and normal
  input attributes.
- `InterestChip`: use `selected` and handle changes in the parent feature. It
  exposes selection with `aria-pressed`.
- `EventCard`: accepts generic `title`, `eyebrow`, `meta`, `description`,
  `actions`, and `tone="lavender|yellow"` values.
- `ChatBubble`: use `speaker="user|assistant"` and optionally provide a visible
  `label`.

Buttons and chips use a minimum 44px touch target. Interactive components include
focus-visible, hover, pressed, selected, and disabled treatments. Inputs expose
invalid and descriptive-message states to assistive technology. Motion is reduced
when the operating system requests it.

The font stylesheet uses Google Fonts and retains sensible system fallbacks if
the font request is unavailable. If the final competition demo must work fully
offline, replace that import with locally hosted licensed font files without
changing the font-family tokens.

