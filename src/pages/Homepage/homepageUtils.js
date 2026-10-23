export function wrappedIndex(index, length) {
  return ((index % length) + length) % length;
}

export function swipeDirection(start, end, threshold = 45) {
  if (!start || !end) return 0;
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return 0;
  return deltaX < 0 ? 1 : -1;
}

function dateAtMiddayUtc(date) {
  return new Date(`${date}T12:00:00Z`);
}

export function formatEventDate(event, locale) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: event.timezone,
  }).format(dateAtMiddayUtc(event.date));
}

export function formatEventTime(time, locale) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(2026, 0, 1, hours, minutes));
}

export function formatEventTimeRange(event, locale) {
  const start = formatEventTime(event.startTime, locale);
  const end = formatEventTime(event.endTime, locale);
  const startPeriod = start.match(/\s([AP]M)$/)?.[1];
  const endPeriod = end.match(/\s([AP]M)$/)?.[1];
  const compactStart = startPeriod && startPeriod === endPeriod ? start.replace(/\s[AP]M$/, "") : start;
  return `${compactStart}–${end}`;
}
