import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { bibtexLoader } from './lib/bibtex-loader';
import { ROLE_ORDER } from './lib/people';

const optionalUrl = z.url().optional().or(z.literal('')).transform((v) => (v ? v : undefined));

const links = z
  .object({
    website: optionalUrl,
    scholar: optionalUrl,
    orcid: optionalUrl,
    github: optionalUrl,
    linkedin: optionalUrl,
    bluesky: optionalUrl,
    x: optionalUrl,
    dblp: optionalUrl,
  })
  .partial()
  .default({});

/**
 * People: one Markdown file per person in src/content/people/<slug>.md.
 * The Markdown body is the biography.
 */
const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.enum(ROLE_ORDER),
      /** Free-form position shown under the name, e.g. "Assistant professor" or "PhD candidate". */
      title: z.string(),
      /** Portrait, ideally square, at least 800×800 px. */
      photo: image().optional(),
      email: z.email().optional(),
      /** Research interests shown on the person page. */
      interests: z.array(z.string()).default([]),
      /** Extra name spellings used in the .bib file, e.g. ["Weijers, R."]. */
      bibNames: z.array(z.string()).default([]),
      links,
      /** Lower numbers appear first within a role group. */
      order: z.number().int().optional(),
      joined: z.coerce.date().optional(),
      left: z.coerce.date().optional(),
      /** Where alumni went next. */
      now: z.string().optional(),
    }),
});

/**
 * Projects: one Markdown file per project in src/content/projects/<slug>.md.
 * The Markdown body is the long description.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One sentence used on cards and as the meta description. */
      summary: z.string().max(200),
      /** Thumbnail with a 3:2 aspect ratio, at least 1200×800 px. */
      image: image(),
      imageAlt: z.string().optional(),
      /** People slugs (file names in src/content/people without .md). */
      people: z.array(z.string()).default([]),
      /** External collaborators, shown as plain text. */
      collaborators: z.array(z.string()).default([]),
      status: z.enum(['active', 'finished']).default('active'),
      featured: z.boolean().default(false),
      start: z.coerce.date().optional(),
      end: z.coerce.date().optional(),
      funding: z.string().optional(),
      tags: z.array(z.string()).default([]),
      links: z
        .object({
          website: optionalUrl,
          code: optionalUrl,
          demo: optionalUrl,
          paper: optionalUrl,
        })
        .partial()
        .default({}),
      /** Lower numbers appear first. */
      order: z.number().int().optional(),
    }),
});

/**
 * News: one Markdown file per post in src/content/news/<slug>.md.
 */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      /** One or two sentences shown in lists and feeds. */
      summary: z.string().max(300),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** e.g. ["paper", "grant", "talk", "award", "people"] */
      tags: z.array(z.string()).default([]),
      /** Related project slugs. */
      projects: z.array(z.string()).default([]),
      /** Related BibTeX keys. */
      publications: z.array(z.string()).default([]),
      /** Related people slugs. */
      people: z.array(z.string()).default([]),
      /** Optional external link (e.g. the conference or funder page). */
      link: optionalUrl,
      draft: z.boolean().default(false),
    }),
});

/**
 * Publications: parsed from a single BibTeX file. See src/lib/bibtex-loader.ts
 * for the custom fields that are recognised.
 */
const publications = defineCollection({
  loader: bibtexLoader({ file: 'src/data/publications.bib' }),
  schema: ({ image }) =>
    z.object({
      key: z.string(),
      type: z.string(),
      typeLabel: z.string(),
      title: z.string(),
      authors: z.array(
        z.object({ name: z.string(), firstName: z.string(), lastName: z.string(), prefix: z.string() }),
      ),
      editors: z.array(
        z.object({ name: z.string(), firstName: z.string(), lastName: z.string(), prefix: z.string() }),
      ),
      year: z.number().int().optional(),
      month: z.number().int().optional(),
      venue: z.string(),
      volume: z.string().optional(),
      number: z.string().optional(),
      pages: z.string().optional(),
      publisher: z.string().optional(),
      doi: z.string().optional(),
      url: z.string().optional(),
      pdf: z.string().optional(),
      code: z.string().optional(),
      website: z.string().optional(),
      video: z.string().optional(),
      image: image().optional(),
      selected: z.boolean(),
      project: z.string().optional(),
      abstract: z.string().optional(),
      keywords: z.array(z.string()),
      note: z.string().optional(),
      bibtex: z.string(),
    }),
});

/**
 * Demos & talks: one entry per public appearance (demo, talk, poster, keynote),
 * in src/data/talks.yaml. Shared across projects via the `project` field so
 * other project pages can reuse the same collection.
 */
const talks = defineCollection({
  loader: file('src/data/talks.yaml'),
  schema: z.object({
    id: z.string(),
    /** ISO date (YYYY-MM-DD), or "TODO" while the date is still unknown. */
    date: z.string(),
    title: z.string(),
    event: z.string(),
    type: z.enum(['demo', 'talk', 'poster', 'keynote']).optional(),
    location: z.string(),
    links: z
      .object({
        slides: optionalUrl,
        poster: optionalUrl,
        video: optionalUrl,
        photo: optionalUrl,
        event: optionalUrl,
      })
      .partial()
      .default({}),
    /** Project slug this entry belongs to (matches src/content/projects or a bespoke project page). */
    project: z.string(),
  }),
});

export const collections = { people, projects, news, publications, talks };
