# MSBA Opportunity Hub AI

A mobile-first career networking and event-planning prototype for the **USC Marshall MSBA Class of 2027**, developed for a university AI case competition.

> Turn your career goals into a personalized weekly networking plan, and pursue opportunities alongside your MSBA cohort.

## Project status

**Planning only. No application code has been implemented.**

The repository was inspected before creating this plan. It contained one initialization commit on `homepage`, with no application files, framework, routes, dependencies, components, or existing README. The `main` branch was created for this project plan. There is currently no app to run, build, or test.

This README captures the implementation plan based on the supplied project brief. Application development is a later phase.

## Product goals

- Discover relevant networking events, workshops, conferences, and career opportunities across several source categories.
- Personalize recommendations using each student's background, career goals, interests, budget, format preferences, and availability.
- Generate a feasible weekly networking plan with clear recommendation explanations.
- Give students control over revisions and approval before changing their accepted calendar.
- Help the cohort share opportunities and event insights, connect around shared attendance, and voluntarily explore carpool matches.

The MVP should demonstrate a polished end-to-end journey without requiring paid APIs, a backend, or live external integrations.

## MVP scope

### Public experience and onboarding

- Public homepage with a concise value proposition, sample calendar preview, and Explore Events, Sign Up, and Log In actions.
- Public browsing of sample events without signing in.
- Multi-step demo profile setup covering background, skills, career goals, networking hours, event preferences, calendar preferences, and community choices.
- Clearly simulated login and persistent return to the saved demo profile.
- Editable preferences that affect subsequent recommendations.

### Personalized dashboard and discovery

- Greeting, weekly networking target, scheduled networking hours, and next simulated generation time.
- Simple time-allocation charts based on sample or user-entered commitments, labeled as scheduled time rather than actual activity tracking.
- Upcoming approved events and commitments, with conflict indicators where applicable.
- Event filters for industry, role, type, date, format, cost, and skills/topics.
- Event details with organizer, source, eligibility, verification status, and personalized relevance where available.
- Save, share with the cohort, and ask the Assistant to consider an event.

### Assistant and weekly calendar

- Conversational interface backed initially by deterministic request interpretation, matching, and scheduling.
- Use profile preferences and supported natural-language constraints, such as free events, industry focus, and topic-hour goals; make interpreted constraints visible and clarify unsupported requests.
- Deduplicate events, check eligibility and dates, exclude conflicts, rank suitable opportunities, and explain selections.
- Generate a proposed schedule with event count, total hours, and any shortfall against the student's target.
- Remove or replace events, regenerate with feedback, and show changes from the previous proposal.
- Keep proposed plans separate from approved calendar entries; require explicit approval to update the calendar.
- Store the chosen generation day/time and provide an explicit simulation of recurring generation and the “Your calendar is ready” notification.
- Offer honestly labeled calendar-sync and email-reminder simulations through mock adapters.

### MSBA community

- Cohort-shared events with submitter, source, date/time, category, and unverified status.
- Sample event insights plus locally created posts; basic reactions/comments if time permits.
- Separate per-event choices for attendance visibility and carpool participation after approval.
- Simulated matches using the same event, compatible timing, approximate pickup zone, and seat/ride availability.
- No precise home addresses, real messages, ride bookings, or implied participant confirmations.

## Planned technology and architecture

Because the repository has no existing framework to preserve, the initial implementation will use:

- React with Vite.
- JavaScript and JSX.
- Responsive CSS with reusable design tokens and components.
- Local sample data and `localStorage` for prototype persistence.
- A lightweight chart library only if needed.
- Mock adapters for future AI, event-source, calendar, and notification integrations.

No backend, database, authentication provider, paid API, or client-side secrets are planned for the initial MVP. Demo login is a local prototype convenience and does not provide real account security. Prototype data stays in the current browser and will not synchronize across devices or classmates.

Proposed structure, to be created during implementation:

```text
src/
  pages/        Homepage, onboarding, login, dashboard, events,
                assistant, weekly calendar, community, profile
  components/   Navigation, cards, filters, forms, charts, calendar views
  data/         Sample events, commitments, cohort members, and posts
  services/     Matching, plan generation, persistence, community,
                and mock integration adapters
  utils/        Date/time handling, conflict checks, validation, deduplication
  styles/       Design tokens, shared styles, responsive layouts
```

Authenticated mobile navigation will include **Home, Events, Assistant, Community, and Profile**, with the Assistant prominent. The weekly calendar will be accessible from the dashboard and Assistant workflow.

## Core data model plan

- **StudentProfile:** identity, cohort, background/experience, skills, career goals, target industries/roles, preferred topics/types/formats, weekly target, budget, generation schedule, notifications, calendar preferences, attendance visibility, carpool preferences, and approximate pickup area.
- **Event:** stable ID, title/description, start/end timestamps, timezone, location/format, category, industries/roles/skills, cost, organizer, source, eligibility, verification status, creator, and attendance opt-ins. Source URLs appear only when verified.
- **CalendarCommitment:** ID, title, start/end timestamps, type, source, and acceptance status.
- **WeeklyPlan:** ID, user ID, week start, recommended event references, planned/target hours, status, creation time, and approval time.
- **CommunityEventShare:** event reference, user reference, and creation time.
- **EventFeedback:** user/event references, rating, feedback, and takeaways.

Use stable references instead of copying event records. Persist saved-event IDs, proposals, approved plans, community posts, and per-event consent choices. Version persisted data and handle missing or invalid browser storage gracefully.

## Matching and scheduling approach

1. Combine saved preferences with supported constraints from the Assistant request; expose the interpretation for review.
2. Gather sample and locally shared events, normalize records, and remove duplicates.
3. Filter by planning week, known eligibility, budget, format, and availability. Surface unknown eligibility or cost instead of implying verification.
4. Rank by career goal, industry, role, skill/topic, event-type, and cohort relevance; provide understandable reasons.
5. Select a feasible combination that avoids existing commitments and overlaps between selected events, while respecting the chosen networking-hour limit and requested topic allocation where possible.
6. Report unmet targets and explain limitations instead of filling time with poor matches.
7. Save a proposal; update accepted calendar entries only after explicit approval, without duplicating already accepted events.

Store timezone-aware timestamps, compare normalized instants, and display times in the student's selected timezone, initially `America/Los_Angeles`. Define calendar weeks consistently as Monday through Sunday; “next week” means the following calendar week in that timezone. Preserve the generation timezone with the recurring preference and account for daylight-saving changes.

Travel buffers will be labeled as unavailable unless reliable travel inputs are implemented. Calendar approval does not register the student for an external event or opt them into attendance sharing or transportation.

## Phased implementation plan

### Phase 1 — Public experience and profile foundation

1. Initialize React/Vite and the proposed modular structure.
2. Establish mobile-first typography, colors, spacing, forms, cards, and accessible navigation.
3. Add varied, clearly labeled sample events and sample class commitments.
4. Build the public homepage, event browsing/details, and navigation.
5. Build multi-step onboarding, simulated login, and persistent profile state.

**Exit check:** A visitor can browse events, create a profile with distinct goals/preferences, refresh, and return to the saved demo profile. Personalized and community actions require the demo login.

### Phase 2 — Dashboard and personalized discovery

1. Add dashboard summaries, labeled time-allocation charts, and current commitments.
2. Add discovery filters, saved events, relevance explanations, and profile editing.
3. Show the next generation time using the saved schedule.

**Exit check:** Different profiles produce different relevant recommendations; preference edits persist and affect subsequent results. Scheduled hours are never presented as measured activity.

### Phase 3 — Assistant and feasible planning

1. Implement request interpretation separately from event matching and deterministic scheduling.
2. Build the conversational Assistant with supported example prompts and visible interpreted constraints.
3. Generate explained proposals with event counts, total hours, conflicts excluded, and shortfalls disclosed.
4. Support removing/replacing events and regenerating with feedback.

**Exit check:** Requests such as “8 hours next week, including 3 hours of LLM workshops” produce a feasible plan or an explicit shortfall, and do not change the accepted calendar.

### Phase 4 — Approval and calendar workflow

1. Add weekly calendar review and proposal change summaries.
2. Implement explicit approval and persistent accepted calendar entries.
3. Add generation schedule settings, a simulated due-generation action/notification, and mock calendar/reminder actions.

**Exit check:** Approval adds the selected events once, survives refresh, and leaves existing commitments intact. Recurrence, notifications, external sync, and reminders are clearly labeled simulations.

### Phase 5 — Cohort community

1. Add local event submission, sharing, and an insights feed seeded with sample posts.
2. Include eligible shared events in subsequent recommendations.
3. Add event-level attendance visibility and carpool opt-ins.
4. Show simulated cohort matches by event, timing, approximate area, and seat availability.

**Exit check:** A student can share an event, publish a local insight, and independently choose attendance visibility and carpool participation. No real classmates are contacted.

### Phase 6 — Demo readiness and verification

1. Verify the complete journey on mobile and desktop layouts.
2. Check keyboard navigation, form labels, focus states, contrast, and empty/error states.
3. Verify browser persistence and honest labels across sample data and simulated integrations.
4. Run the production build and relevant tests; resolve failures.
5. Document setup/run commands once they exist, plus demo steps, supported Assistant requests, limitations, and functional versus simulated features.

**Exit check:** The full competition demo works without API keys or internet-dependent AI services.

## Verification plan

During implementation, prioritize meaningful automated checks for the planning logic and persistence boundaries:

- Conflict handling, including overlaps between candidate events and commitments.
- Planning-week boundaries, timezone conversion, and daylight-saving behavior.
- Duplicate records and repeated approval without duplicate calendar entries.
- Budget, known eligibility, formats, hour limits, and insufficient matching events.
- Separation of proposed and approved plans.
- Preference changes, saved state, and invalid/missing storage recovery.
- Attendance and carpool consent retained independently per event.

Use a manual walkthrough for the complete journey: homepage → explore → onboarding → dashboard → Assistant → proposal revision → approval → calendar → community → refresh and return. Run available tests and the build after each coherent implementation phase. No build or application tests apply to the current documentation-only stage.

## Design direction

Use soft-neutral or white backgrounds, charcoal text, restrained lavender/violet accents, readable typography, rounded cards, subtle borders, and comfortable spacing. Keep charts simple and labels clear. Stack dashboard sections on narrow screens and maintain a consistent design system across all screens.

Avoid crowded layouts, excessive gradients/animation, oversized heroes, and decorative emoji as the primary icon system.

## Demo honesty and privacy

- Label curated sample events, simulated cohort members, and unverified submissions.
- Do not fabricate real URLs, speakers, registrations, confirmations, or connected services.
- Describe the first Assistant as local deterministic matching, without claiming a live LLM.
- Keep private calendar details out of cohort views.
- Default attendance sharing and carpool participation to opt-out; require explicit choices.
- Use neighborhood-level pickup areas, never precise home addresses.
- Clearly label locally saved community actions and simulated notifications, calendar sync, email reminders, and transportation matching.

## MVP acceptance checklist

- [ ] Open the public homepage and explore sample events.
- [ ] Create and return to a persistent demo profile.
- [ ] See a personalized dashboard, scheduled-time charts, and commitments.
- [ ] Ask supported natural-language questions and receive explained recommendations.
- [ ] Generate a conflict-free weekly proposal with honest hour totals/shortfalls.
- [ ] Remove or replace events and regenerate the proposal.
- [ ] Approve the plan and see events in the app calendar.
- [ ] Set a weekly generation day/time and see the simulated ready notification.
- [ ] Independently opt into attendance visibility and carpool matching.
- [ ] View simulated cohort matches.
- [ ] Share an event and create a local community insight post.
- [ ] Refresh and return without losing prototype state.

## Deferred beyond the initial prototype

Production authentication, shared multi-user storage, live event ingestion, real LLM integration, background scheduling, calendar-provider authorization/sync, delivered email/push notifications, and real transportation coordination require later implementation. They are not prerequisites for the competition MVP.
