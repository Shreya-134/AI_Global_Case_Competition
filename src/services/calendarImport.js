import ICAL from "ical.js";

const MAX_OCCURRENCES = 2000;

function propertyValue(component, name) {
  return component.getFirstPropertyValue(name)?.toString().toUpperCase() ?? "";
}

function unavailableTimezone(component, root) {
  for (const name of ["dtstart", "dtend"]) {
    const timezoneId = component.getFirstProperty(name)?.getParameter("tzid");
    if (timezoneId && !root.getTimeZoneByID(timezoneId)) return timezoneId;
  }
  return null;
}

function overlaps(start, end, rangeStart, rangeEnd) {
  return end > rangeStart && start < rangeEnd;
}

function toBusyBlock(details, sourceRef) {
  const summary = details.item.component.getFirstPropertyValue("summary") || "Busy";
  return {
    id: `ics-${sourceRef.replace(/[^a-zA-Z0-9-]/g, "-")}`,
    label: String(summary), recurrence: "once",
    start: details.startDate.toJSDate().toISOString(), end: details.endDate.toJSDate().toISOString(),
    allDay: Boolean(details.startDate.isDate), timezone: details.startDate.zone?.tzid || "floating",
    source: "calendar-import", sourceRef,
  };
}

export function validateCalendarFile(file, maxBytes) {
  if (!file) return "Choose an .ics calendar file.";
  if (file.size > maxBytes) return `The file is larger than ${Math.round(maxBytes / 1048576)} MB.`;
  if (!file.name.toLocaleLowerCase().endsWith(".ics")) return "Choose a file ending in .ics.";
  return null;
}

export function parseCalendarText(text, { rangeStart, rangeEnd }) {
  if (!text.includes("BEGIN:VCALENDAR")) throw new Error("This file does not contain a valid iCalendar calendar.");
  const startBoundary = new Date(`${rangeStart}T00:00:00`);
  const endBoundary = new Date(`${rangeEnd}T23:59:59.999`);
  if (!Number.isFinite(startBoundary.getTime()) || !Number.isFinite(endBoundary.getTime())) throw new Error("Choose a valid import date range.");
  if (endBoundary < startBoundary) throw new Error("Import end date must follow the start date.");

  let root;
  try { root = new ICAL.Component(ICAL.parse(text)); }
  catch { throw new Error("The calendar file could not be parsed. Check that it is a valid .ics export."); }

  const blocks = [];
  const warnings = [];
  const masters = root.getAllSubcomponents("vevent").filter((item) => !item.hasProperty("recurrence-id"));
  for (const component of masters) {
    if (propertyValue(component, "status") === "CANCELLED" || propertyValue(component, "transp") === "TRANSPARENT") continue;
    const missingTimezone = unavailableTimezone(component, root);
    if (missingTimezone) { warnings.push(`Skipped an event using unsupported time zone “${missingTimezone}”.`); continue; }

    let event;
    try { event = new ICAL.Event(component); }
    catch { warnings.push("Skipped an event with unsupported recurrence data."); continue; }
    const uid = event.uid || `event-${blocks.length}`;

    if (!event.isRecurring()) {
      const start = event.startDate.toJSDate();
      const end = event.endDate.toJSDate();
      if (overlaps(start, end, startBoundary, endBoundary)) {
        blocks.push(toBusyBlock({ item: event, startDate: event.startDate, endDate: event.endDate }, `${uid}|${start.toISOString()}|${end.toISOString()}`));
      }
      continue;
    }

    try {
      const iterator = event.iterator();
      let count = 0;
      let occurrence;
      while ((occurrence = iterator.next()) && count < MAX_OCCURRENCES) {
        count += 1;
        const details = event.getOccurrenceDetails(occurrence);
        const start = details.startDate.toJSDate();
        const end = details.endDate.toJSDate();
        if (start > endBoundary) break;
        if (propertyValue(details.item.component, "status") === "CANCELLED" || propertyValue(details.item.component, "transp") === "TRANSPARENT") continue;
        if (overlaps(start, end, startBoundary, endBoundary)) blocks.push(toBusyBlock(details, `${uid}|${start.toISOString()}|${end.toISOString()}`));
      }
      if (count >= MAX_OCCURRENCES) warnings.push("A recurring event reached the import limit and was truncated.");
    } catch { warnings.push("Skipped an event with unsupported recurrence or time-zone data."); }
  }
  return { blocks: Array.from(new Map(blocks.map((block) => [block.sourceRef, block])).values()), warnings };
}

export function mergeBusyBlocks(existing, imported) {
  const existingRefs = new Set(existing.map((block) => block.sourceRef).filter(Boolean));
  return [...existing, ...imported.filter((block) => !existingRefs.has(block.sourceRef))];
}

