/** Serves the raw BibTeX file so people and reference managers can import it directly. */
import bib from '../data/publications.bib?raw';

export function GET() {
  return new Response(bib, {
    headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' },
  });
}
