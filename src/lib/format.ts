const long = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

/** "18 Sept 2026" */
export function formatDate(d: Date): string {
  return long.format(d);
}

/** "Sept 2026" */
export function formatMonth(d: Date): string {
  return monthYear.format(d);
}

/** Simple HTML escape for text injected into XML/plain-text endpoints. */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
