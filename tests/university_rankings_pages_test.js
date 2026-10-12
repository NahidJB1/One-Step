// Local browser checks. PHP_BINARY can point to a portable PHP executable.
// Optional: RANKINGS_BASELINE points to the pre-update backup for control/script preservation checks.
// Screenshots are written outside the project, under the OS temporary directory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/university_rankings.json'), 'utf8'));
const records = Object.entries(data.universities).filter(([,record]) => record.page);
const selectedIds = (process.env.RANKINGS_PAGE_IDS || '').split(',').filter(Boolean);
const selectedRecords = selectedIds.length ? records.filter(([id]) => selectedIds.includes(id)) : records;
const snapshotDir = path.join(os.tmpdir(), 'onestep-ranking-page-checks');
function originalControls(html) {
    const body = html.slice(html.indexOf('</head>'))
        .replace(/<!-- rankings:content:start -->[\s\S]*?<!-- rankings:content:end -->/g, '')
        .replace(/<div class="container popular-queries-section"[^>]*>[\s\S]*?<\/div>/g, '');
    return {
        controls: body.match(/<(?:button|input|select|textarea|form|iframe|img|script|a)\b[^>]*>/gi),
        scripts: [...body.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)].map(m => m[0])
    };
}
(async () => {
    let checks = 0;
    assert.equal(records.length, 29);
    assert.equal(selectedIds.length ? selectedRecords.length : 29, selectedIds.length || 29, 'Unknown page selection');
    assert.deepEqual(records.map(([,r]) => path.basename(r.page)).sort(), fs.readdirSync(path.join(root,'Universities')).filter(f => f.endsWith('-details.html')).sort()); checks++;
    if (process.env.RANKINGS_BASELINE) {
        for (const [id,record] of selectedRecords) {
            assert.deepEqual(originalControls(fs.readFileSync(path.join(root,record.page),'utf8')),
                originalControls(fs.readFileSync(path.join(process.env.RANKINGS_BASELINE,record.page),'utf8')), `${id}: existing controls and scripts changed`);
            checks++;
        }
    }
    const portProbe = net.createServer();
    await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
    const port = portProbe.address().port;
    await new Promise(resolve => portProbe.close(resolve));
    const server = spawn(process.env.PHP_BINARY || 'php', ['-S', `127.0.0.1:${port}`, '-t', root], {windowsHide:true,stdio:['ignore','ignore','pipe']});
    let serverError, log = '';
    server.on('error', e => { serverError = e; });
    server.stderr.on('data', chunk => { log += chunk; });
    const base = `http://127.0.0.1:${port}/`;
    let browser;
    try {
        let ready = false;
        for (let i=0; i<50; i++) {
            if (serverError) throw serverError;
            try { await fetch(base); ready=true; break; } catch (_) { await new Promise(resolve => setTimeout(resolve,100)); }
        }
        assert(ready, `PHP server failed: ${log}`);
        browser = await chromium.launch({headless:true});
        const context = await browser.newContext({viewport:{width:1440,height:1000}});
        // Never submit applications, feedback, or analytics during a page check.
        await context.route('**/*', route => route.request().method() === 'GET' ? route.continue() : route.abort());
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.setDefaultTimeout(12000);
        for (const [id,record] of selectedRecords) {
            const response = await page.goto(base + record.page, {waitUntil:'load',timeout:30000});
            assert.equal(response.status(),200,id);
            assert.equal(await page.locator('#rankings').count(),1,id);
            assert.equal(await page.locator('head title').count(),1,id);
            const canonical = 'https://www.onestepmy.com/' + record.page.replace(/\.html$/,'');
            assert.equal(await page.locator('link[rel="canonical"]').count(),1,id);
            assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),canonical,id);
            assert.equal(await page.locator('meta[name="description"]').count(),1,id);
            assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),canonical,id);
            const faq = await page.locator('.ranking-faq').evaluateAll(els => els.map(e => ({q:e.querySelector('summary').textContent,a:e.querySelector('p').textContent})));
            const structured = await page.locator('script[type="application/ld+json"]').evaluateAll(els => els.flatMap(e => {const j=JSON.parse(e.textContent);return j['@graph'] || [j];}));
            assert.equal(structured.filter(s => s['@type']==='CollegeOrUniversity').length,1,id);
            assert.equal(structured.find(s => s['@type']==='CollegeOrUniversity').name,record.name,id);
            const faqSchema = structured.filter(s => s['@type']==='FAQPage');
            assert.equal(faqSchema.length,1,id);
            assert.equal(faq.length,4,id);
            assert.deepEqual(faqSchema[0].mainEntity.map(q => ({q:q.name,a:q.acceptedAnswer.text})),faq,`${id}: visible and structured FAQ differ`);
            assert.equal(await page.locator('.ranking-stat').count(),3,id);
            assert.equal(await page.locator('#rankings time').getAttribute('datetime'),data.verified_at,id);
            await page.locator('.ranking-faq summary').first().click();
            assert.equal(await page.locator('.ranking-faq').first().getAttribute('open'),'');
            assert(await page.locator('.ranking-faq p').first().isVisible(),id);
            await page.locator('.ranking-faq summary').first().click();
            const tabs = page.locator('.tab-btn[data-tab]');
            for (let i=0; i<await tabs.count(); i++) {
                const tab = tabs.nth(i), target = await tab.getAttribute('data-tab');
                await tab.click();
                assert(await page.locator('#'+target).isVisible(),`${id}: ${target} tab`);
            }
            checks++;
            console.log(`Verified ${id}: static content, schema, FAQ and existing tabs`);
        }
        assert.deepEqual(errors,[], 'Browser JavaScript exceptions'); checks++;
        fs.mkdirSync(snapshotDir,{recursive:true});
        for (const width of [1440,390]) {
            await page.setViewportSize({width,height:1000});
            for (const id of ['apu','bac','cityu','klust','uow']) {
                await page.goto(base+data.universities[id].page,{waitUntil:'load'});
                await page.locator('#rankings').scrollIntoViewIfNeeded();
                const overflow = await page.locator('#rankings').evaluate(section => {
                    const box=section.getBoundingClientRect();
                    return [...section.querySelectorAll('*')].some(el => {
                        if (!el.getClientRects().length) return false;
                        const r=el.getBoundingClientRect();
                        return r.right>box.right+1 || r.left<box.left-1;
                    });
                });
                assert(!overflow, `${id}: ranking content overflows at ${width}px`);
                assert.equal(await page.locator('.ranking-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length),width<760 ? 1 : 3,id);
                if (id==='apu' || id==='uow') {
                    // Isolated section captures hide fixed navigation/chat overlays only for the capture.
                    await page.locator('#rankings').screenshot({path:path.join(snapshotDir,`${id}-${width}.png`),
                        style:'.main-header, #os-fab-container { display: none !important; }'});
                }
                checks++;
            }
        }
        // Crawlers and browsers without JavaScript receive the full ranking and FAQ text.
        const noJs = await browser.newContext({javaScriptEnabled:false});
        const staticPage = await noJs.newPage();
        await staticPage.goto(base+data.universities.apu.page,{waitUntil:'domcontentloaded'});
        assert.match(await staticPage.locator('#rankings').textContent(),/#=528/);
        await staticPage.locator('.ranking-faq summary').first().focus();
        await staticPage.locator('.ranking-faq summary').first().press('Enter');
        assert(await staticPage.locator('.ranking-faq p').first().isVisible()); checks++;
        console.log(`${checks} page checks passed. Screenshots: ${snapshotDir}`);
    } finally {
        if (browser) await browser.close();
        server.kill();
    }
})().catch(error => { console.error(error); process.exitCode=1; });
