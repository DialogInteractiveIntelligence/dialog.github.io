import type { APIContext } from 'astro';
import { buildLlmsText } from '../lib/llms';

export async function GET(context: APIContext) {
  return new Response(await buildLlmsText(context.site, true), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
