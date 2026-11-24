export function getLogicalDateString(resetHour = 4, now = new Date()): string {
  const adjusted = new Date(now);
  if (adjusted.getHours() < resetHour) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const year = adjusted.getFullYear();
  const month = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}