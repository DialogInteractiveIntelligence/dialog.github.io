/**
 * URL helpers that respect the configured `base` path, so the site works both
 * at a domain root and under a sub-path such as `/dialog.github.io/`.
 */

const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

/** Build a site-relative href, e.g. `href('/people/')` → `/dialog.github.io/people/`. */
export function href(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('mailto:')) return path;
  return BASE + path.replace(/^\/+/, '');
}

/** Absolute URL for canonical links, Open Graph, JSON-LD and feeds. */
export function absolute(path: string, site: URL | string | undefined): string {
  const origin = typeof site === 'string' ? site : site?.toString() ?? '';
  if (/^https?:\/\//.test(path)) return path;
  // Paths produced by astro:assets already include the base; do not add it twice.
  const withBase = BASE !== '/' && path.startsWith(BASE) ? path : href(path);
  return new URL(withBase, origin).toString();
}

/** Turn any string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Is `current` the same page as, or inside, `target`? Used for nav highlighting. */
export function isActive(current: string, target: string): boolean {
  const t = href(target);
  return current === t || current.startsWith(t);
}
