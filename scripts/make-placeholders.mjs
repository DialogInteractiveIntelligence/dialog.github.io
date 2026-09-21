/**
 * Generates placeholder images so the site builds before real photos exist.
 * Run with `node scripts/make-placeholders.mjs`. Existing files are not overwritten,
 * so you can replace any of them with real images and re-run safely.
 */
import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const accent = '#416a66';
const paper = '#e9e5dc';

const images = [
  ['src/assets/group.jpg', 2400, 1200, 'Group photo', accent],
  ['src/assets/people/jane-doe.jpg', 800, 800, 'JD', '#5b7f7a'],
  ['src/assets/people/maria-santos.jpg', 800, 800, 'MS', '#6f8f8a'],
  ['src/assets/people/ruben-weijers.jpg', 800, 800, 'RW', '#4a716c'],
  ['src/assets/projects/dialogue-grounding.jpg', 1200, 800, 'Project', '#7c9e99'],
  ['src/assets/projects/adaptive-assistants.jpg', 1200, 800, 'Project', '#5e847f'],
  ['src/assets/publications/doe2026grounding.jpg', 800, 600, 'ACL 2026', paper],
  ['src/assets/publications/santos2025adaptive.jpg', 800, 600, 'TiiS 2025', paper],
  ['src/assets/news/acl-2026.jpg', 1200, 800, 'News', '#8fb0ab'],
];

function svg(w, h, label, bg) {
  const dark = bg !== paper;
  const fg = dark ? 'rgba(255,255,255,0.85)' : '#416a66';
  const size = Math.round(Math.min(w, h) / 6);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Georgia, serif" font-size="${size}" fill="${fg}">${label}</text>
</svg>`;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

for (const [rel, w, h, label, bg] of images) {
  const out = path.join(root, rel);
  if (await exists(out)) {
    console.log(`skip   ${rel} (exists)`);
    continue;
  }
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg(w, h, label, bg))).jpeg({ quality: 82 }).toFile(out);
  console.log(`create ${rel}`);
}

// Apple touch icon from the favicon
const icon = path.join(root, 'public/apple-touch-icon.png');
if (!(await exists(icon))) {
  const fav = path.join(root, 'public/favicon.svg');
  await sharp(fav).resize(180, 180).png().toFile(icon);
  console.log('create public/apple-touch-icon.png');
}
