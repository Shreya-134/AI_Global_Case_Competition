# Calendar integrations

The student-profile schedule step supports Google Calendar, Apple Calendar exports, standalone `.ics` uploads, and manual entry. All calendar UI lives under `src/pages/StudentProfile`; the homepage is not involved.

## Google Calendar setup

The browser integration uses the official Google Identity Services token client. It requests only:

- `calendar.calendarlist.readonly` to show calendars the student may select.
- `calendar.freebusy` to retrieve busy time ranges.

It does not request event titles, descriptions, attendees, or locations. The access token is held only in module memory and is never written to local storage. A reload or expired token requires the student to reconnect.

1. Create a Google Cloud project and enable the Google Calendar API.
2. Configure the OAuth consent screen and add the two scopes above.
3. Create an OAuth client with application type **Web application**.
4. Add each development and production origin under **Authorized JavaScript origins**. Local Vite development normally uses `http://localhost:5173`. The popup token flow does not need a redirect URI.
5. Copy `.env.example` to `.env.local` and set `VITE_GOOGLE_CLIENT_ID` to the public web client ID.
6. Restart Vite after changing environment variables.

Do not add a Google client secret to a Vite environment file: values prefixed with `VITE_` are shipped to the browser. Production deployments should restrict the OAuth client to exact known origins and complete Google's consent-screen and verification requirements.

For background refresh or access when the student is absent, add a backend authorization-code flow. That future backend must exchange codes, encrypt refresh tokens at rest, enforce user ownership, support revocation/deletion, and avoid logging tokens or calendar identifiers. This browser-only version intentionally does not implement background access.

## Apple Calendar

Websites cannot directly request EventKit access to calendars on an Apple device. Students therefore export an `.ics` file from Apple Calendar and upload it. A future native iOS version can implement the same provider interface using EventKit, with an iOS usage description, explicit system permission, on-device selection, and revocation handling.

## Calendar files and stored data

`.ics` files are parsed locally and discarded after preview. The saved profile contains normalized busy ranges and small import metadata (file name, time, and count), not the original file. The importer removes descriptions and locations and labels imported times simply as “Busy.” Replacing a file replaces only file-sourced blocks; disconnecting Google removes only Google-sourced blocks.

Current profiles are stored in browser `localStorage`. Clearing browser data or using **Clear saved profile** removes them. Before production, add an explicit privacy policy, retention period, account-scoped deletion/export, and server-side protection if profiles move to a backend.
