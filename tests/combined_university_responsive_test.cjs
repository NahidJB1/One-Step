'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const ids = ['bac', 'alfa', 'inti', 'klust', 'cityu', 'cyberjaya'];
const widths = [320, 390, 768, 1024, 1440];
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml' };

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  let relative = pathname.replace(/^\/+/, '') || 'index.html';
  if (!path.extname(relative)) relative += '.html';
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(response);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.route('**/*', route => route.request().url().startsWith(`http://127.0.0.1:${port}/`) ? route.continue() : route.abort());
      for (const id of ids) {
        await page.goto(`http://127.0.0.1:${port}/Universities/${id}-university`, { waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('h1').count(), 1, `${id} at ${width}px: expected one H1`);
        assert.equal(await page.locator('#courses-fees').count(), 1, `${id} at ${width}px: missing fee section`);
        assert.ok(await page.locator('#faq details').count() >= 5, `${id} at ${width}px: FAQ list is incomplete`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(overflow <= 1, `${id} at ${width}px: page overflows by ${overflow}px`);
      }
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await page.route('**/*', route => route.request().url().startsWith(`http://127.0.0.1:${port}/`) ? route.continue() : route.abort());
    await page.goto(`http://127.0.0.1:${port}/Universities/inti-university`, { waitUntil: 'domcontentloaded' });
    await page.locator('.campus-gallery .gallery-item').first().click();
    assert.equal(await page.locator('#lightbox').evaluate(node => getComputedStyle(node).display), 'flex', 'gallery lightbox did not open');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#lightbox').evaluate(node => getComputedStyle(node).display), 'none', 'gallery lightbox did not close');
    await page.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(`Validated ${ids.length} combined pages at ${widths.join(', ')}px plus gallery interaction.`);
})().catch(error => {
  server.close();
  console.error(error);
  process.exit(1);
});
