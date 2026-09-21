/**
 * Builds the /llms.txt and /llms-full.txt documents: a Markdown summary of the
 * whole site for LLM-based crawlers and agents (https://llmstxt.org).
 */
import { getCollection } from 'astro:content';
import { site } from '../site.config';
import { absolute } from './url';
import { ROLE_LABELS, ROLE_ORDER, sortPeople, sortPublications } from './people';

function stripFrontmatter(body: string | undefined): string {
  return (body ?? '').trim();
}

export async function buildLlmsText(siteUrl: URL | undefined, full: boolean): Promise<string> {
  const url = (p: string) => absolute(p, siteUrl);
  const people = sortPeople(await getCollection('people'));
  const projects = (await getCollection('projects')).sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
  const publications = sortPublications(await getCollection('publications'));
  const news = (await getCollection('news', ({ data }) => !data.draft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const lines: string[] = [];
  lines.push(`# ${site.name}`);
  lines.push('');
  lines.push(`> ${site.tagline}`);
  lines.push('');
  lines.push(site.about.replace(/<[^>]+>/g, ''));
  lines.push('');
  lines.push(`${site.name} is a research group at ${site.institution.name}${site.institution.department ? ` (${site.institution.department})` : ''}.`);
  if (site.address.city) lines.push(`Location: ${[site.address.street, site.address.postalCode, site.address.city, site.address.country].filter(Boolean).join(', ')}.`);
  if (site.email) lines.push(`Contact: ${site.email}`);
  lines.push(`Research areas: ${site.keywords.join(', ')}.`);
  lines.push('');
  lines.push('## Pages');
  lines.push('');
  lines.push(`- [Home](${url('/')})`);
  lines.push(`- [People](${url('/people/')}): all group members`);
  lines.push(`- [Projects](${url('/projects/')}): research projects`);
  lines.push(`- [Publications](${url('/publications/')}): full publication list; BibTeX at ${url('/publications.bib')}`);
  lines.push(`- [News](${url('/news/')}): announcements; RSS at ${url('/rss.xml')}`);
  if (!full) lines.push(`- [Full site as text](${url('/llms-full.txt')})`);
  lines.push('');

  lines.push('## People');
  lines.push('');
  for (const role of ROLE_ORDER) {
    const members = people.filter((p) => p.data.role === role);
    if (!members.length) continue;
    lines.push(`### ${ROLE_LABELS[role]}`);
    lines.push('');
    for (const p of members) {
      const extras = [p.data.email, p.data.links?.website, p.data.links?.scholar, p.data.links?.orcid].filter(Boolean).join(', ');
      lines.push(`- [${p.data.name}](${url(`/people/${p.id}/`)}): ${p.data.title}${p.data.now ? `; now ${p.data.now}` : ''}${extras ? ` (${extras})` : ''}`);
      if (full) {
        if (p.data.interests.length) lines.push(`  Interests: ${p.data.interests.join(', ')}`);
        const bio = stripFrontmatter(p.body);
        if (bio) lines.push(`  ${bio.replace(/\n+/g, ' ')}`);
      }
    }
    lines.push('');
  }

  lines.push('## Projects');
  lines.push('');
  for (const pr of projects) {
    const team = pr.data.people.map((slug) => people.find((p) => p.id === slug)?.data.name).filter(Boolean).join(', ');
    lines.push(`- [${pr.data.title}](${url(`/projects/${pr.id}/`)}): ${pr.data.summary}${team ? ` Team: ${team}.` : ''}${pr.data.status === 'finished' ? ' (finished)' : ''}`);
    if (full) {
      const body = stripFrontmatter(pr.body);
      if (body) lines.push(`  ${body.replace(/\n+/g, ' ')}`);
    }
  }
  lines.push('');

  lines.push('## Publications');
  lines.push('');
  for (const pub of publications) {
    const d = pub.data;
    const authors = d.authors.map((a) => a.name).join(', ');
    const links = [d.doi ? `doi:${d.doi}` : undefined, d.pdf ? `PDF: ${d.pdf}` : undefined, d.code ? `Code: ${d.code}` : undefined].filter(Boolean).join('; ');
    lines.push(`- ${authors}${d.year ? ` (${d.year})` : ''}. [${d.title}](${url(`/publications/${pub.id}/`)}). ${d.venue}${links ? `. ${links}` : ''}`);
    if (full && d.abstract) lines.push(`  Abstract: ${d.abstract}`);
  }
  lines.push('');

  lines.push('## News');
  lines.push('');
  for (const post of news) {
    lines.push(`- ${post.data.date.toISOString().slice(0, 10)}: [${post.data.title}](${url(`/news/${post.id}/`)}). ${post.data.summary}`);
    if (full) {
      const body = stripFrontmatter(post.body);
      if (body) lines.push(`  ${body.replace(/\n+/g, ' ')}`);
    }
  }
  lines.push('');

  return lines.join('\n');
}
