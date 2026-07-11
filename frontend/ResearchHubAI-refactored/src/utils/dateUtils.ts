/** Small, dependency-free date helpers. */

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
