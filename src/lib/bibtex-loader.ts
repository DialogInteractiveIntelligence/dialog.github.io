/**
 * Astro content loader that turns a single BibTeX file into a collection.
 *
 * Standard BibTeX fields are used for the bibliography; a few custom fields
 * drive the website (all optional):
 *
 *   image    = {../assets/publications/key.jpg}   thumbnail, relative to the .bib file
 *   pdf      = {https://...}                       link to the PDF
 *   code     = {https://github.com/...}            link to code
 *   website  = {https://...}                       project/paper website
 *   video    = {https://...}                       talk or demo video
 *   selected = {true}                              show on the homepage
 *   project  = {project-slug}                      link to a project in src/content/projects
 *   abstract = {...}                               shown on the publication page
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, type Entry, type Creator } from '@retorquere/bibtex-parser';
import type { Loader } from 'astro/loaders';

const VERBATIM_FIELDS = ['image', 'pdf', 'code', 'website', 'video', 'project', 'selected', 'url', 'doi'] as const;

export interface BibAuthor {
  /** Display form, e.g. "José van der Berg". */
  name: string;
  firstName: string;
  lastName: string;
  /** Particles such as "van der". */
  prefix: string;
}

const TYPE_LABELS: Record<string, string> = {
  article: 'Journal article',
  inproceedings: 'Conference paper',
  conference: 'Conference paper',
  incollection: 'Book chapter',
  inbook: 'Book chapter',
  book: 'Book',
  phdthesis: 'PhD thesis',
  mastersthesis: 'MSc thesis',
  techreport: 'Technical report',
  misc: 'Preprint',
  unpublished: 'Preprint',
  online: 'Online',
};

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function toAuthor(c: Creator): BibAuthor {
  if (c.name && !c.lastName) {
    // Corporate author or single-token name.
    return { name: c.name, firstName: '', lastName: c.name, prefix: '' };
  }
  const firstName = c.firstName ?? '';
  const lastName = c.lastName ?? '';
  const prefix = c.prefix ?? '';
  const name = [firstName, prefix, lastName, c.suffix].filter(Boolean).join(' ');
  return { name, firstName, lastName, prefix };
}

function venueOf(entry: Entry): string {
  const f = entry.fields;
  return (
    f.journal ??
    f.booktitle ??
    f.school ??
    f.institution?.join(', ') ??
    f.howpublished ??
    f.publisher?.join(', ') ??
    ''
  );
}

function monthOf(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isNaN(n) && n >= 1 && n <= 12) return n;
  return MONTHS[raw.toLowerCase().slice(0, 9)] ?? MONTHS[raw.toLowerCase().slice(0, 3)];
}

function isTruthy(raw: string | undefined): boolean {
  return raw !== undefined && /^(true|yes|1)$/i.test(raw.trim());
}

export interface BibtexLoaderOptions {
  /** Path to the .bib file, relative to the project root. */
  file: string;
}

export function bibtexLoader({ file }: BibtexLoaderOptions): Loader {
  return {
    name: 'bibtex-loader',
    async load({ store, logger, parseData, generateDigest, config, watcher }) {
      const root = fileURLToPath(config.root);
      const absPath = path.resolve(root, file);
      const relPath = path.relative(root, absPath).split(path.sep).join('/');

      async function sync() {
        const text = await readFile(absPath, 'utf8');
        const lib = parse(text, {
          english: false, // keep titles exactly as written in the .bib
          caseProtection: false,
          fieldMode: Object.fromEntries(VERBATIM_FIELDS.map((k) => [k, 'verbatim'])),
          unsupported: 'ignore',
        });

        for (const err of lib.errors) {
          logger.warn(`${relPath}: ${err.error}`);
        }

        store.clear();
        for (const entry of lib.entries) {
          const f = entry.fields;
          const year = Number.parseInt(f.year ?? '', 10);
          const data = {
            key: entry.key,
            type: entry.type.toLowerCase(),
            typeLabel: TYPE_LABELS[entry.type.toLowerCase()] ?? 'Publication',
            title: f.title ?? entry.key,
            authors: (f.author ?? []).map(toAuthor),
            editors: (f.editor ?? []).map(toAuthor),
            year: Number.isNaN(year) ? undefined : year,
            month: monthOf(f.month),
            venue: venueOf(entry),
            volume: f.volume,
            number: f.number,
            pages: f.pages,
            publisher: f.publisher?.join(', '),
            doi: f.doi,
            url: f.url,
            pdf: f.pdf,
            code: f.code,
            website: f.website,
            video: f.video,
            image: f.image,
            selected: isTruthy(f.selected),
            project: f.project,
            abstract: f.abstract,
            keywords: f.keywords ?? [],
            note: f.note,
            bibtex: entry.input.trim(),
          };

          const parsed = await parseData({ id: entry.key, data, filePath: relPath });
          store.set({
            id: entry.key,
            data: parsed,
            filePath: relPath,
            digest: generateDigest(entry.input),
          });
        }
        logger.info(`Loaded ${lib.entries.length} publications from ${relPath}`);
      }

      await sync();

      if (watcher) {
        watcher.add(absPath);
        watcher.on('change', async (changed) => {
          if (path.resolve(changed) === absPath) {
            logger.info('Reloading publications');
            await sync();
          }
        });
      }
    },
  };
}
