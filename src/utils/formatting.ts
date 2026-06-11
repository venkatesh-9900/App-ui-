import { format, formatDistanceToNowStrict } from "date-fns"

export function truncateText (address: string) {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Ensures a date string is parsed as UTC. Only appends 'Z' when the string has
// no timezone designator at all — a trailing 'Z' or numeric offset like
// "+05:30"/"-08:00" is already unambiguous and must be left untouched (appending
// 'Z' to e.g. "...+05:30" produces an invalid date).
const asUTC = (s: string) => /(Z|[+-]\d{2}:?\d{2})$/.test(s) ? s : s + 'Z'

export function formatDate(dateString?: string) {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(asUTC(dateString)), 'MMM d, yyyy')
    } catch {
      return 'N/A'
    }
  }
/**
 * Formats an ISO date string into a readable format:
 *    "Jan 1, 2026, 05:29:59"
 *
 * Input examples:
 *  - "2026-01-01T05:29:59Z"
 *  - "2026-01-01T05:29:59"
 *
 * @param {string} dateString - A date string that can be parsed by `new Date()`.
 * @returns {string} A formatted, human-readable date string.
 *
 * @example
 * formatPrettyDate("2026-01-01T05:29:59Z")
 * // 👉 "Jan 1, 2026, 05:29:59"
 */
export function formatPrettyDate(dateString: string) {
  const d = new Date(asUTC(dateString))

  return d.toLocaleString("en-US", {
    month: "short", // "Jan"
    day: "numeric", // "1"
    year: "numeric", // "2026"
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // keep 05:29:59 instead of 5:29:59 AM
  })
}

export function formatRelativeDate(dateString?: string) {
  if (!dateString) return "N/A"
  try {
    return formatDistanceToNowStrict(new Date(asUTC(dateString)), { addSuffix: true })
  } catch {
    return "N/A"
  }
}
