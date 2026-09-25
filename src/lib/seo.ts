/**
 * Builders for JSON-LD structured data (schema.org) and Google Scholar
 * "Highwire Press" citation meta tags. Nothing here affects the visual page.
 */
import type { CollectionEntry } from 'astro:content';
import { site } from '../site.config';
import { absolute } from './url';

type JsonLd = Record<string, unknown>;

export function organizationId(siteUrl: URL | string | undefined): string {
  return `${absolute('/', siteUrl)}#organization`;
}

export function organizationJsonLd(siteUrl: URL | string | undefined, logoUrl?: string): JsonLd {
  const sameAs = Object.values(site.social).filter(Boolean);
  const address =
    site.address.street || site.address.city
      ? {
          '@type': 'PostalAddress',
          streetAddress: [site.address.building, site.address.street].filter(Boolean).join(', ') || undefined,
          postalCode: site.address.postalCode || undefined,
          addressLocality: site.address.city || undefined,
          addressCountry: site.address.countryCode || undefined,
        }
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'ResearchOrganization',
    '@id': organizationId(siteUrl),
    name: site.name,
    alternateName: site.shortName !== site.name ? site.shortName : undefined,
    description: site.tagline,
    url: absolute('/', siteUrl),
    logo: logoUrl,
    image: logoUrl,
    email: site.email || undefined,
    address,
    parentOrganization: {
      '@type': 'EducationalOrganization',
      name: site.institution.name,
      url: site.institution.url,
    },
    knowsAbout: site.keywords,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function websiteJsonLd(siteUrl: URL | string | undefined): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: absolute('/', siteUrl),
    inLanguage: site.locale,
    publisher: { '@id': organizationId(siteUrl) },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], siteUrl: URL | string | undefined): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.path, siteUrl),
    })),
  };
}

export function personJsonLd(
  person: CollectionEntry<'people'>,
  siteUrl: URL | string | undefined,
  imageUrl?: string,
): JsonLd {
  const d = person.data;
  const sameAs = Object.values(d.links ?? {}).filter(Boolean) as string[];
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${absolute(`/people/${person.id}/`, siteUrl)}#person`,
    name: d.name,
    jobTitle: d.title,
    url: absolute(`/people/${person.id}/`, siteUrl),
    image: imageUrl ? absolute(imageUrl, siteUrl) : undefined,
    email: d.email ? `mailto:${d.email}` : undefined,
    affiliation: { '@id': organizationId(siteUrl) },
    memberOf: { '@id': organizationId(siteUrl) },
    worksFor: { '@id': organizationId(siteUrl) },
    knowsAbout: d.interests.length ? d.interests : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function projectJsonLd(
  project: CollectionEntry<'projects'>,
  siteUrl: URL | string | undefined,
  imageUrl?: string,
  members: CollectionEntry<'people'>[] = [],
): JsonLd {
  const d = project.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    name: d.title,
    description: d.summary,
    url: absolute(`/projects/${project.id}/`, siteUrl),
    image: imageUrl ? absolute(imageUrl, siteUrl) : undefined,
    foundingDate: d.start?.toISOString().slice(0, 10),
    dissolutionDate: d.end?.toISOString().slice(0, 10),
    parentOrganization: { '@id': organizationId(siteUrl) },
    funder: d.funding ? { '@type': 'Organization', name: d.funding } : undefined,
    keywords: d.tags.length ? d.tags.join(', ') : undefined,
    member: members.map((m) => ({
      '@type': 'Person',
      name: m.data.name,
      url: absolute(`/people/${m.id}/`, siteUrl),
    })),
    sameAs: [d.links.website, d.links.code].filter(Boolean),
  };
}

export function publicationJsonLd(
  pub: CollectionEntry<'publications'>,
  siteUrl: URL | string | undefined,
  imageUrl?: string,
): JsonLd {
  const d = pub.data;
  const isJournal = d.type === 'article';
  const isPartOf = d.venue
    ? {
        '@type': isJournal ? 'Periodical' : 'PublicationEvent',
        name: d.venue,
        volumeNumber: d.volume,
        issueNumber: d.number,
      }
    : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': d.doi ? `https://doi.org/${d.doi}` : absolute(`/publications/${pub.id}/`, siteUrl),
    headline: d.title,
    name: d.title,
    abstract: d.abstract,
    author: d.authors.map((a) => ({
      '@type': 'Person',
      name: a.name,
      givenName: a.firstName || undefined,
      familyName: [a.prefix, a.lastName].filter(Boolean).join(' ') || undefined,
    })),
    datePublished: d.year ? `${d.year}${d.month ? `-${String(d.month).padStart(2, '0')}` : ''}` : undefined,
    isPartOf,
    pagination: d.pages,
    publisher: d.publisher ? { '@type': 'Organization', name: d.publisher } : undefined,
    identifier: d.doi ? { '@type': 'PropertyValue', propertyID: 'DOI', value: d.doi } : undefined,
    sameAs: [d.doi ? `https://doi.org/${d.doi}` : undefined, d.url].filter(Boolean),
    url: absolute(`/publications/${pub.id}/`, siteUrl),
    image: imageUrl ? absolute(imageUrl, siteUrl) : undefined,
    keywords: d.keywords.length ? d.keywords.join(', ') : undefined,
    encoding: d.pdf ? { '@type': 'MediaObject', contentUrl: d.pdf, encodingFormat: 'application/pdf' } : undefined,
    sourceOrganization: { '@id': organizationId(siteUrl) },
  };
}

export function newsJsonLd(
  post: CollectionEntry<'news'>,
  siteUrl: URL | string | undefined,
  imageUrl?: string,
): JsonLd {
  const d = post.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: d.title,
    description: d.summary,
    datePublished: d.date.toISOString(),
    dateModified: d.date.toISOString(),
    image: imageUrl ? absolute(imageUrl, siteUrl) : undefined,
    url: absolute(`/news/${post.id}/`, siteUrl),
    mainEntityOfPage: absolute(`/news/${post.id}/`, siteUrl),
    author: { '@id': organizationId(siteUrl) },
    publisher: { '@id': organizationId(siteUrl) },
    keywords: d.tags.length ? d.tags.join(', ') : undefined,
    inLanguage: site.locale,
  };
}

export function collectionPageJsonLd(
  name: string,
  description: string,
  path: string,
  siteUrl: URL | string | undefined,
  items: { name: string; path: string }[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absolute(path, siteUrl),
    isPartOf: { '@type': 'WebSite', url: absolute('/', siteUrl) },
    about: { '@id': organizationId(siteUrl) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: absolute(it.path, siteUrl),
      })),
    },
  };
}

/**
 * Highwire Press tags read by Google Scholar. Order matters for authors.
 * https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
 */
export function citationMeta(pub: CollectionEntry<'publications'>, siteUrl: URL | string | undefined) {
  const d = pub.data;
  const tags: { name: string; content: string }[] = [];
  const push = (name: string, content?: string) => {
    if (content) tags.push({ name, content });
  };
  push('citation_title', d.title);
  for (const a of d.authors) push('citation_author', a.name);
  if (d.year) push('citation_publication_date', d.month ? `${d.year}/${d.month}` : String(d.year));
  if (d.type === 'article') push('citation_journal_title', d.venue);
  else if (d.type === 'inproceedings' || d.type === 'conference') push('citation_conference_title', d.venue);
  else if (d.type === 'incollection' || d.type === 'inbook') push('citation_inbook_title', d.venue);
  else if (d.type === 'phdthesis' || d.type === 'mastersthesis') push('citation_dissertation_institution', d.venue);
  else if (d.type === 'techreport') push('citation_technical_report_institution', d.venue);
  push('citation_volume', d.volume);
  push('citation_issue', d.number);
  if (d.pages) {
    const [first, last] = d.pages.split(/[–-]+/);
    push('citation_firstpage', first?.trim());
    push('citation_lastpage', last?.trim());
  }
  push('citation_publisher', d.publisher);
  push('citation_doi', d.doi);
  push('citation_pdf_url', d.pdf);
  push('citation_abstract_html_url', absolute(`/publications/${pub.id}/`, siteUrl));
  push('citation_language', site.locale);
  return tags;
}
