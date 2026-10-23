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

/** Publication date without inventing a month or day absent from the source. */
export function publicationDate(d: { year?: number; month?: number; day?: number }) {
  if (!d.year) return { iso: undefined, label: 'Undated' };
  const iso = [d.year, d.month && String(d.month).padStart(2, '0'), d.month && d.day && String(d.day).padStart(2, '0')]
    .filter(Boolean).join('-');
  const date = new Date(d.year, (d.month ?? 1) - 1, d.day ?? 1, 12);
  return { iso, label: d.month ? (d.day ? formatDate(date) : formatMonth(date)) : String(d.year) };
}

/** Simple HTML escape for text injected into XML/plain-text endpoints. */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
