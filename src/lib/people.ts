/**
 * Matching between people in `src/content/people` and author names in the BibTeX file.
 *
 * A bib author matches a person when the (accent-stripped, lower-cased) last name
 * including particles is equal and the first initial agrees. People can add extra
 * spellings under `bibNames` in their frontmatter, e.g. `["Weijers, R.", "R. Weijers"]`.
 */
import type { CollectionEntry } from 'astro:content';
import type { BibAuthor } from './bibtex-loader';

export type Person = CollectionEntry<'people'>;
export type Publication = CollectionEntry<'publications'>;

export const ROLE_ORDER = ['faculty', 'postdoc', 'phd', 'msc', 'staff', 'alumni'] as const;
export type Role = (typeof ROLE_ORDER)[number];

export const ROLE_LABELS: Record<Role, string> = {
  faculty: 'Faculty',
  postdoc: 'Postdoctoral researchers',
  phd: 'PhD candidates',
  msc: 'MSc students',
  staff: 'Staff',
  alumni: 'Alumni',
};

export function normalize(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface NameKey {
  last: string;
  initial: string;
}

/** "José van der Berg" → { last: "van der berg", initial: "j" } */
function keyFromDisplayName(name: string): NameKey | undefined {
  const parts = normalize(name).split(' ');
  if (parts.length < 2) return undefined;
  return { last: parts.slice(1).join(' '), initial: parts[0][0] };
}

/** "van der Berg, José" → { last: "van der berg", initial: "j" }; also accepts "J. van der Berg". */
function keyFromBibName(name: string): NameKey | undefined {
  if (name.includes(',')) {
    const [last, first] = name.split(',');
    const l = normalize(last);
    const f = normalize(first ?? '');
    return l && f ? { last: l, initial: f[0] } : undefined;
  }
  return keyFromDisplayName(name);
}

function keyFromAuthor(a: BibAuthor): NameKey | undefined {
  const last = normalize([a.prefix, a.lastName].filter(Boolean).join(' '));
  const initial = normalize(a.firstName)[0];
  return last && initial ? { last, initial } : undefined;
}

function sameKey(a: NameKey | undefined, b: NameKey | undefined): boolean {
  return !!a && !!b && a.last === b.last && a.initial === b.initial;
}

function keysForPerson(person: Person): NameKey[] {
  const keys = [keyFromDisplayName(person.data.name)];
  for (const n of person.data.bibNames ?? []) keys.push(keyFromBibName(n));
  return keys.filter((k): k is NameKey => !!k);
}

/** Map a bib author to a person entry (or undefined if they are not in the group). */
export function findPerson(author: BibAuthor, people: Person[]): Person | undefined {
  const ak = keyFromAuthor(author);
  return people.find((p) => keysForPerson(p).some((pk) => sameKey(pk, ak)));
}

/** All publications on which a given person is an author. */
export function publicationsOf(person: Person, publications: Publication[]): Publication[] {
  const keys = keysForPerson(person);
  return publications.filter((pub) => pub.data.authors.some((a) => keys.some((k) => sameKey(k, keyFromAuthor(a)))));
}

/** Sort: current members by role then `order` then name; alumni last, most recent leavers first. */
export function sortPeople(people: Person[]): Person[] {
  return [...people].sort((a, b) => {
    const ra = ROLE_ORDER.indexOf(a.data.role);
    const rb = ROLE_ORDER.indexOf(b.data.role);
    if (ra !== rb) return ra - rb;
    const oa = a.data.order ?? 999;
    const ob = b.data.order ?? 999;
    if (oa !== ob) return oa - ob;
    return a.data.name.localeCompare(b.data.name);
  });
}

/** Sort newest first: by year, then month, then title. */
export function sortPublications(pubs: Publication[]): Publication[] {
  return [...pubs].sort((a, b) => {
    const ya = a.data.year ?? 0;
    const yb = b.data.year ?? 0;
    if (ya !== yb) return yb - ya;
    const ma = a.data.month ?? 0;
    const mb = b.data.month ?? 0;
    if (ma !== mb) return mb - ma;
    return a.data.title.localeCompare(b.data.title);
  });
}
