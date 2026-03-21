export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/**
 * Parse a timestamptz string from Supabase and return a local-time Date.
 * new Date(isoString) correctly shifts UTC → local when the string has a
 * timezone offset, which Supabase always provides for timestamptz columns.
 */
const parseLocal = (isoString: string): Date => new Date(isoString);

/**
 * Formats a Date as "YYYY-MM-DDTHH:mm" in local time.
 * Shared by isoToLocal and getSoftMinDateTime.
 */
export const formatLocalDateTime = (d: Date): string =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-") + "T" + [
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
  ].join(":");

/**
 * Returns "YYYY-MM-DD" in the **local** timezone.
 * Used to match calendar cells (which are also local dates) against events.
 */
export const toLocalDateKey = (isoString: string): string => {
  const d = parseLocal(isoString);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

export const formatDate = (isoString: string): string => {
  return parseLocal(isoString).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  // → "1 June 2026"
};

export const formatTime = (isoString: string): string => {
  return parseLocal(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
  // → "19:00"
};

export const formatDateTimeRange = (start: string, finish?: string): string => {
  const startDate = formatDate(start);
  const finishDate = finish ? formatDate(finish) : null;
  const sameDay = finishDate && startDate === finishDate;

  if (finish && !sameDay) {
    return `${startDate} ${formatTime(start)} – ${finishDate} ${formatTime(finish)}`;
  }

  const timeStr = finish
    ? `${formatTime(start)} – ${formatTime(finish)}`
    : formatTime(start);

  return `${timeStr} · ${startDate}`;
};

/**
 * Converts a UTC ISO string from Supabase into a "YYYY-MM-DDTHH:mm" local
 * string suitable for <input type="datetime-local"> values.
 */
export const isoToLocal = (isoString: string): string =>
  formatLocalDateTime(parseLocal(isoString));

/**
 * Returns a datetime string 1 hour in the past, used as the `min` attribute
 * on datetime-local inputs. This is a *soft* floor — it allows slight
 * back-dating for events that started very recently, while preventing
 * accidental far-past submissions.
 *
 * Call this inside a component (not at module level) so the value is always
 * fresh rather than fixed at the time the module was first imported.
 */
export const getSoftMinDateTime = (): string => {
  const d = new Date(Date.now() - 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return formatLocalDateTime(d);
};

export const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export const SHORT_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/**
 * Returns the Monday of the week containing `date` (local time, midnight).
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Returns the Sunday of the week containing `date` (local time, 23:59:59.999).
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Formats a Monday-start week as a compact label.
 * Same month:        "16-22"
 * Cross-month:       "28 Mar - 3 Apr"
 */
export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart);
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getDate()}-${weekEnd.getDate()}`;
  }
  return `${weekStart.getDate()} ${SHORT_MONTHS[weekStart.getMonth()]} - ${weekEnd.getDate()} ${SHORT_MONTHS[weekEnd.getMonth()]}`;
}

/**
 * Formats a single day as "Sat 21".
 */
export function formatDayLabel(date: Date): string {
  return `${SHORT_DAYS[date.getDay()]} ${date.getDate()}`;
}