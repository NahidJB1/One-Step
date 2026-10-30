'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const ids = ['bac', 'alfa', 'inti', 'klust', 'cityu', 'cyberjaya', 'genovasi', 'segi', 'kings', 'taylors', 'unirazak', 'amu', 'apu', 'help', 'icms', 'limkokwing', 'lincoln', 'mmu', 'ucsi', 'unikl', 'umw', 'iium', 'uow', 'upm', 'utem', 'utm'];
const cardIds = ids.filter(id => !['genovasi'].includes(id));
const articleData = JSON.parse(fs.readFileSync(path.join(root, 'data/university_articles.json'), 'utf8'));
const articleIds = new Set(Object.keys(articleData));
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
        const hero = await page.locator('.combined-hero').evaluate(element => {
          const heading = element.querySelector('h1');
          const headingRect = heading.getBoundingClientRect();
          const styles = getComputedStyle(element);
          return { background:styles.backgroundImage, headingTransform:getComputedStyle(heading).textTransform, headingLeft:headingRect.left, headingRight:headingRect.right };
        });
        assert.ok(hero.background.includes('/assets/images/universities/'), `${id} at ${width}px: campus photo is missing`);
        assert.equal(hero.headingTransform, 'none', `${id} at ${width}px: hero heading style was overridden`);
        assert.ok(hero.headingLeft >= 0 && hero.headingRight <= width + 1, `${id} at ${width}px: hero heading clips`);
        assert.equal(await page.locator('.combined-hero-actions a').count(), 2, `${id} at ${width}px: hero actions are missing`);
        assert.equal(await page.locator('#courses-fees').count(), 1, `${id} at ${width}px: missing fee section`);
        assert.ok(await page.locator('#faq details').count() >= 5, `${id} at ${width}px: FAQ list is incomplete`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(overflow <= 1, `${id} at ${width}px: page overflows by ${overflow}px`);
        await page.locator('.combined-tabs a[href="#courses"]').click();
        await page.locator('#courses').waitFor({state:'visible'});
        assert.equal(await page.locator('#overview').isVisible(), false, `${id}: Overview stays visible in Courses tab`);
        assert.ok(await page.locator('.course-card').count() > 0, `${id}: missing course cards`);
        const courseOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(courseOverflow <= 1, `${id} courses at ${width}px: page overflows by ${courseOverflow}px`);
        if (articleIds.has(id)) {
          await page.locator('.combined-tabs a[href="#articles"]').click();
          await page.locator('#articles').waitFor({state:'visible'});
          assert.equal(await page.locator('#overview').isVisible(), false, `${id}: Overview stays visible in Articles tab`);
          assert.equal(await page.locator('#courses').isVisible(), false, `${id}: Courses stays visible in Articles tab`);
          assert.equal(await page.locator('.article-photo img').count(), articleData[id].images.length, `${id}: article photo grid is incomplete`);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${id}: Articles overflows at ${width}`);
        }
        if (await page.locator('.combined-tabs a[href="#accommodation"]').count()) {
          await page.locator('.combined-tabs a[href="#accommodation"]').click();
          await page.locator('#accommodation').waitFor({state:'visible'});
          assert.equal(await page.locator('#overview').isVisible(), false, `${id}: Overview hidden in Accommodation`);
          assert.equal(await page.locator('#courses').isVisible(), false, `${id}: Courses hidden in Accommodation`);
          assert.equal(await page.locator('.accommodation-card').count(), 3, `${id}: three supplied properties`);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${id}: Accommodation overflows at ${width}`);
        }
      }
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await page.route('**/*', route => route.request().url().startsWith(`http://127.0.0.1:${port}/`) ? route.continue() : route.abort());
    await page.goto(`http://127.0.0.1:${port}/Universities/inti-university`, { waitUntil: 'domcontentloaded' });
    await page.locator('#os-fab-container').waitFor();
    assert.equal(await page.locator('#os-fab-container').count(), 1, 'Chatbot loads more than once');
    assert.ok(await page.locator('.combined-tabs-more').isVisible(), 'Mobile tabs need a visible overflow cue');
    await page.locator('.combined-tabs-more').click();
    await page.waitForFunction(() => document.querySelector('.combined-tabs').scrollLeft > 0);
    await page.locator('.combined-tabs a[href="#courses"]').click();
    await page.locator('#courses').waitFor({state:'visible'});
    const firstCourse = page.locator('.course-card').first();
    const apply = new URL(await firstCourse.locator('.course-apply').getAttribute('href'), 'http://example.test');
    assert.equal(apply.searchParams.get('university'), 'inti');
    assert.ok(apply.searchParams.get('course'));
    const whatsapp = new URL(await firstCourse.locator('.course-ask').getAttribute('href'));
    assert.equal(whatsapp.hostname, 'wa.me');
    assert.ok(whatsapp.searchParams.get('text').includes(apply.searchParams.get('course')));
    await page.locator('#course-search').fill('zzzz-no-course-found');
    assert.equal(await page.locator('.course-card:visible').count(), 0);
    assert.ok(await page.locator('.course-empty').isVisible());
    await page.locator('#course-search').fill('');
    assert.ok(await page.locator('.course-card:visible').count() > 0);
    await page.locator('.combined-tabs a[href="#overview"]').click();
    await page.locator('.campus-gallery .gallery-item').first().click();
    assert.equal(await page.locator('#lightbox').evaluate(node => getComputedStyle(node).display), 'flex', 'gallery lightbox did not open');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#lightbox').evaluate(node => getComputedStyle(node).display), 'none', 'gallery lightbox did not close');
    await page.goto(`http://127.0.0.1:${port}/Universities/cityu-university`, { waitUntil: 'domcontentloaded' });
    const cityLogo = page.locator('.combined-hero-identity img');
    assert.match(await cityLogo.getAttribute('src'), /cityu\/cityu-logo\.png$/);
    assert.ok(await cityLogo.evaluate(image => image.complete && image.naturalWidth > 0), 'City University logo did not load');
    for (const route of ['/', '/explore-universities']) {
      await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'domcontentloaded' });
      await page.locator('.university-card').first().waitFor();
      const cards = await page.locator('.university-card').evaluateAll(elements => elements.map(card => ({
        image:card.querySelector('.university-image-link')?.getAttribute('href'),
        name:card.querySelector('.university-name-link')?.getAttribute('href'),
        details:card.querySelector('.card-btn.details')?.getAttribute('href'),
        apply:card.querySelector('.card-btn.apply')?.getAttribute('href'),
        buttons:card.querySelectorAll('.card-btn').length
      })));
      assert.equal(cards.length, cardIds.length, `${route}: card count differs from the published card set`);
      for (const card of cards) {
        assert.equal(card.image, card.details);
        assert.equal(card.name, card.details);
        assert.match(card.details, /^\/Universities\/[a-z]+-university$/);
        assert.equal(card.apply, `/apply?university=${card.details.split('/').pop().replace('-university', '')}`);
        assert.equal(card.buttons, 2);
      }
    }
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
