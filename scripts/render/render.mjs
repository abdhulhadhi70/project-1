// Renders the demonstration catalogue images into public/images/pieces.
//
//   node scripts/render/render.mjs              all shots
//   node scripts/render/render.mjs hero ring    only shots whose id contains a term
//
// Needs Playwright's Chromium (WebGL runs on SwiftShader, so it is slow but
// identical on any machine) and sharp for the final JPEG/WebP files.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = resolve(import.meta.dirname, '../..');
const outDir = join(root, 'public/images/pieces');
const types = { '.html': 'text/html', '.js': 'text/javascript' };

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.startsWith('/node_modules/') ? join(root, path) : join(root, 'scripts/render', path === '/' ? 'index.html' : path);
  try {
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()));
await page.goto(`http://localhost:${port}/`);
await page.waitForFunction(() => window.ready === true);

const ids = await page.evaluate(() => window.SHOT_IDS);
const fast = process.argv.includes('--fast');
const terms = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const pick = terms.length ? ids.filter((id) => terms.some((t) => id.includes(t))) : ids;
await mkdir(outDir, { recursive: true });

for (const id of pick) {
  const t0 = Date.now();
  const url = await page.evaluate(([id, pr]) => window.renderShot(id, pr), [id, fast ? 1 : 2]);
  const png = Buffer.from(url.split(',')[1], 'base64');
  const img = sharp(png);
  const { width } = await img.metadata();
  const full = Math.round(width / 2);
  // Downsample the 2× render: this is the anti-aliasing for fine chain links.
  // No metadata is written, so there is nothing like a location in the files.
  for (const w of [full, Math.round(full / 2)]) {
    const suffix = w === full ? '' : `-${w}`;
    await sharp(png).resize({ width: w, kernel: 'lanczos3' }).jpeg({ quality: 86, mozjpeg: true }).toFile(join(outDir, `${id}${suffix}.jpg`));
    await sharp(png).resize({ width: w, kernel: 'lanczos3' }).webp({ quality: 82 }).toFile(join(outDir, `${id}${suffix}.webp`));
  }
  console.log(`${id}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

await browser.close();
server.close();
