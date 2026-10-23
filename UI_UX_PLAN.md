# Mobile UI/UX Plan

## Purpose

The MSBA Opportunity Hub should help USC Marshall MSBA students turn career goals
and availability into a realistic weekly networking plan. The experience should
feel supportive and transparent: recommendations are explained, proposed calendar
changes require approval, and simulated capabilities are clearly labeled.

This document guides future page design. Signup and the Community Discussion
Board are implemented prototypes; other product screens remain planned.

## Experience principles

1. **Mobile first:** prioritize one-handed use, clear hierarchy, 44px minimum
   touch targets, and content that works from 320px upward.
2. **Plan with the student:** show interpreted constraints and recommendation
   reasons instead of presenting unexplained automated decisions.
3. **Ask before changing:** keep proposed events separate from approved calendar
   entries and require explicit approval.
4. **Be honest about the prototype:** label sample data, local persistence,
   simulated notifications, mock integrations, and unverified submissions.
5. **Protect privacy by default:** keep calendar details private and require
   separate opt-ins for attendance visibility and carpool matching.
6. **Keep choices manageable:** use progressive disclosure, concise summaries,
   and clear primary actions instead of dense controls.

## Mobile information architecture

The public experience is planned to include the homepage, sample event discovery,
event detail, sign-up, and simulated login. The Community Discussion Board
prototype is available at `/community`, with local demo discussions and persistent
bottom navigation. Other dashboard destinations are not implemented yet. When
available, the full app navigation should provide Home, Events, Assistant,
Community, and Profile. Weekly calendar review is reached from Home and the
Assistant planning flow.

On wider screens, the same destinations may move to a top or side navigation while
preserving labels, order, and task continuity.

## Key journeys

### Public discovery

Communicate the product value concisely, preview a sample weekly calendar, and
offer Explore Events, Sign Up, and Log In actions. Visitors can inspect clearly
labeled sample events before creating a profile. Avoid an oversized hero that
pushes useful content below the fold.

### Onboarding and return

Break profile setup into short steps: background and skills, career goals,
networking target, event preferences, availability, calendar preferences, and
community choices. Show progress, preserve entered information, explain why
sensitive preferences are requested, and let students review before saving.

### Discover and evaluate

Default to scannable event cards with essential date, format, cost, and relevance
information. Filters should open in a mobile sheet and summarize active choices.
Event detail should distinguish verified facts, unknown information, personalized
reasons, and actions such as save, share, or ask the Assistant to consider.

### Generate and revise a weekly plan

The Assistant should show what it understood from the request. The proposed plan
summarizes event count, total hours, conflicts avoided, and any target shortfall.
Students can remove, replace, or regenerate events and see what changed before
approving. Approval must be a clear, separate action.

### Calendar approval

Use an agenda-first mobile view with an optional calendar view on larger screens.
Differentiate existing commitments, proposed events, and approved events by more
than color alone. Explain that approval adds an app-calendar entry but does not
register the student with an external organizer.

### Community and transportation

Show whether content is sample, locally created, or unverified. Attendance
visibility and carpool participation are separate per-event controls and default
off. Use approximate pickup areas only; never request or display exact home
addresses. Matches must be described as simulated, not confirmed rides.

## Visual and interaction direction

Use the shared purple, wisteria, yellow, lavender, and soft-neutral theme. Favor
rounded cards, subtle shadows, generous spacing, plain-language labels, and a
single clear primary action per decision point. Reserve yellow for high-value
primary actions, and do not rely on color alone for status.

Use Plus Jakarta Sans for concise headings and Inter for body copy, labels, and
inputs. Keep paragraphs short on mobile. Icons should supplement visible labels;
decorative emoji should not serve as the primary icon system.

All flows need visible keyboard focus, useful error messages, logical heading
order, properly associated labels, screen-reader state announcements where
content updates dynamically, and reduced-motion behavior. Loading, empty, error,
offline, and invalid-local-data states should be designed alongside success states.

## Responsive guidance

- **Small mobile:** one column, full-width form controls, bottom navigation, and
  stacked card actions where needed.
- **Large mobile/tablet:** wider cards and selective two-column groups when reading
  order remains clear.
- **Desktop:** constrained content width, persistent navigation where useful, and
  side-by-side planning/detail panels only when they reduce context switching.

Responsive changes must not hide essential information or create a different
approval model on larger screens.

## Design sequence

1. Validate the public discovery and onboarding flow.
2. Design dashboard summaries and event discovery using realistic sample states.
3. Prototype Assistant interpretation, plan revision, and approval as one journey.
4. Extend the Community prototype with event sharing and independent consent
   controls.
5. Test the complete flow on narrow mobile and desktop widths with keyboard and
   screen-reader checks.

Before visual polish, verify that users can distinguish proposed versus approved
events, understand why an event was recommended, identify simulated behavior, and
change privacy choices without losing other work.
