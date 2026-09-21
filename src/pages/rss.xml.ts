import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../site.config';
import { absolute } from '../lib/url';

export async function GET(context: APIContext) {
  const posts = (await getCollection('news', ({ data }) => !data.draft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    title: `${site.name} — News`,
    description: site.tagline,
    // Include the base path so the channel link points at the site root, not the domain root.
    site: absolute('/', context.site),
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: absolute(`/news/${post.id}/`, context.site),
      categories: post.data.tags,
    })),
    customData: `<language>${site.locale}</language>`,
  });
}
