# Research group website

Static website for the group, built with [Astro](https://astro.build) and deployed to GitHub Pages by GitHub Actions on every push to `main`.

All content lives in plain text files, so adding a person, project, paper or news post is a matter of adding one file (and, optionally, one image) and pushing.

## Running locally

```bash
npm install
node scripts/make-placeholders.mjs   # once: creates placeholder images that do not exist yet
npm run dev                          # http://localhost:4321/dialog.github.io/
npm run build && npm run preview     # production build
```

Node 22 or newer is required.

## First things to edit

1. **`src/site.config.ts`**: group name, tagline, "about" paragraph, institution, address, email, social links, keywords.
2. **`src/assets/group.jpg`**: the group photo shown on the homepage (any landscape photo; it is cropped to 21:9 on wide screens and 3:2 on phones).
3. **`astro.config.mjs`**: `site` and `base`. See "Where the site lives" below.
4. Delete the placeholder entries in `src/content/` and `src/data/publications.bib` as you add real ones.

## Adding content

### A person

Create `src/content/people/<first-last>.md`:

```md
---
name: Jane Doe
role: faculty            # faculty | postdoc | phd | msc | staff | alumni
title: Associate professor
photo: ../../assets/people/jane-doe.jpg   # optional, square, ≥ 800×800
email: j.doe@example.org                  # optional
interests: [Dialogue systems, Grounding]  # optional
bibNames: ["Doe, J."]                     # optional extra spellings used in the .bib
links:                                    # all optional
  website: https://...
  scholar: https://scholar.google.com/...
  orcid: https://orcid.org/...
  github: https://github.com/...
  linkedin: https://...
order: 1                                  # optional, lower first within a role
joined: 2018-09-01                        # optional
left: 2024-06-30                          # optional (alumni)
now: Research scientist at ...            # optional (alumni)
---

Biography in Markdown.
```

The file name (without `.md`) is the person's slug, used in URLs and to reference them from projects and news. The person's projects, publications and news are listed on their page automatically.

**Publication matching**: a bib author is linked to a person when the last name (including particles such as "van der") and first initial match the `name` field. If the .bib uses a different spelling, add it under `bibNames`.

### A project

Create `src/content/projects/<slug>.md`:

```md
---
title: Grounding in Multi-Party Dialogue
summary: One sentence for cards and search results (max 200 chars).
image: ../../assets/projects/<slug>.jpg   # required, 3:2, ≥ 1200×800
imageAlt: Short description of the image
people: [jane-doe, ruben-weijers]         # people slugs
collaborators: [Example University]       # optional, plain text
status: active                            # active | finished
featured: true                            # show first on the homepage
start: 2024-09-01                         # optional
end: 2028-08-31                           # optional
funding: NWO Vidi                         # optional
tags: [dialogue, grounding]               # optional
links: { website: ..., code: ..., demo: ..., paper: ... }   # optional
order: 1                                  # optional
---

Long description in Markdown.
```

Publications whose bib entry has `project = {<slug>}` are listed on the project page.

### A publication

Add an entry to `src/data/publications.bib`. Standard fields are used for the citation; these optional extras drive the site:

| Field | Purpose |
|---|---|
| `image` | Thumbnail (4:3), path relative to the .bib file, e.g. `{../assets/publications/key.jpg}` |
| `pdf`, `code`, `website`, `video` | Link buttons |
| `selected = {true}` | Show on the homepage |
| `project = {slug}` | Link to a project |
| `abstract` | Shown on the paper page |

Each entry gets its own page at `/publications/<bibkey>/` with Google Scholar meta tags and JSON-LD. The whole file is served at `/publications.bib`.

### A news post

Create `src/content/news/<yyyy-mm-slug>.md`:

```md
---
title: Paper accepted at ACL 2026
date: 2026-05-20
summary: One or two sentences (max 300 chars).
image: ../../assets/news/<file>.jpg       # optional, 3:2
imageAlt: Description
tags: [paper]                             # e.g. paper, grant, talk, award, people
people: [jane-doe]                        # optional, links the post to people
projects: [dialogue-grounding]            # optional
publications: [doe2026grounding]          # optional, bib keys
link: https://...                         # optional external link
draft: false                              # true hides the post
---

Body in Markdown.
```

Posts appear on the homepage, in `/news/`, in the RSS feed and on linked people/project pages.

## Where the site lives

GitHub Pages serves a repository called `<owner>.github.io` at `https://<owner>.github.io/`, and any other repository at `https://<owner>.github.io/<repo>/`.

The deploy workflow detects this automatically. For local builds, `astro.config.mjs` defaults to the project-site form. To change it permanently, edit the two defaults there, or set repository variables `SITE_URL` and `SITE_BASE` under *Settings → Secrets and variables → Actions → Variables*. For a custom domain:

1. Add a `public/CNAME` file containing the domain.
2. Set `SITE_URL=https://your.domain` and `SITE_BASE=/` as repository variables.
3. Update the `Sitemap:` line in `public/robots.txt`.

## Deploying

1. Push this repository to GitHub.
2. In the repository, open *Settings → Pages* and set **Source** to **GitHub Actions**.
3. Every push to `main` builds and publishes the site. The workflow is in `.github/workflows/deploy.yml`.

## What the site does for search engines and AI agents

- Per-page titles, descriptions, canonical URLs, Open Graph and Twitter cards.
- JSON-LD structured data: `ResearchOrganization`, `Person`, `ResearchProject`, `ScholarlyArticle`, `NewsArticle`, `BreadcrumbList`, `CollectionPage`.
- Google Scholar (Highwire Press) `citation_*` meta tags on every publication page.
- `sitemap-index.xml`, `rss.xml`, `robots.txt` that welcomes AI crawlers by name.
- `llms.txt` and `llms-full.txt`: a Markdown digest of the whole site for LLM agents.
- Semantic HTML, responsive images in modern formats, no client-side JavaScript.

## Project layout

```
src/
  site.config.ts        site-wide settings
  content.config.ts     content schemas (validated at build time)
  content/{people,projects,news}/   one Markdown file per item
  data/publications.bib the bibliography
  assets/               images processed by Astro (group.jpg, people/, projects/, publications/, news/)
  components/           cards, rows, header, footer
  layouts/Base.astro    page shell with all <head> tags
  lib/                  bibtex loader, author matching, SEO builders, llms.txt builder
  pages/                routes
  styles/global.css     design tokens and base styles
public/                 files copied as-is (favicon, robots.txt)
scripts/                helper scripts
```
