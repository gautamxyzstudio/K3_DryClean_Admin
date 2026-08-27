import dayjs from "dayjs";

/**
 * Format date string or timestamp into readable format (e.g., "27 Aug 2026")
 */
export function formatDate(date: string | number | Date | null | undefined, fallback = "—"): string {
  if (!date) return fallback;
  const parsed = dayjs(date);
  if (!parsed.isValid()) return fallback;
  return parsed.format("DD MMM YYYY");
}

/**
 * Format date and time (e.g., "27 Aug 2026, 10:30 AM")
 */
export function formatDateTime(date: string | number | Date | null | undefined, fallback = "—"): string {
  if (!date) return fallback;
  const parsed = dayjs(date);
  if (!parsed.isValid()) return fallback;
  return parsed.format("DD MMM YYYY, hh:mm A");
}

/**
 * Convert ISO string to HTML datetime-local format (YYYY-MM-DDTHH:mm)
 */
export function toDateTimeLocalInput(date: string | number | Date | null | undefined): string {
  if (!date) return "";
  const parsed = dayjs(date);
  if (!parsed.isValid()) return "";
  return parsed.format("YYYY-MM-DDTHH:mm");
}

/**
 * Convert HTML date input to ISO 8601 string
 */
export function toISOStringSafe(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.toISOString() : "";
}

/**
 * Check if a date has passed compared to now
 */
export function isDateInPast(date: string | number | Date | null | undefined): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  if (!parsed.isValid()) return false;
  return parsed.isBefore(dayjs());
}
