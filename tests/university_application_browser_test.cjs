'use strict';
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.request().url().startsWith('http://localhost:4180/') ? route.continue() : route.abort());
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto('http://localhost:4180/apply?university=inti&course=Computer%20Science', {waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('#university').inputValue(),'inti');
      assert.equal(await page.locator('#course').inputValue(),'Computer Science');
      assert.equal(await page.locator('#passportNumber').getAttribute('required'),null);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), `Overflow at ${width}`);
    }
    await page.locator('#email').fill('invalid-email');
    assert.equal(await page.locator('#email').evaluate(node=>node.validity.valid),false);
    const token = await page.locator('input[name=token]').inputValue();
    const invalid = await page.request.post('http://localhost:4180/apply',{form:{token,university:'inti',fullName:'Test Student',phone:'+8801712345678',email:'invalid',nationality:'Bangladeshi'}});
    assert.equal(invalid.status(),422);
    assert.ok((await invalid.text()).includes('Please enter a valid email address.'));
    const csrf = await page.request.post('http://localhost:4180/apply',{form:{token:'invalid',university:'inti',fullName:'Test Student',phone:'+8801712345678',email:'test@example.com',nationality:'Bangladeshi'}});
    assert.equal(csrf.status(),422);
    assert.ok((await csrf.text()).includes('Your form expired.'));
    const forgedSuccess = await page.request.get('http://localhost:4180/apply?submitted=1');
    assert.ok(!(await forgedSuccess.text()).includes('<h2>Application submitted</h2>'));
    console.log('Application preselection, optional passport, five responsive widths, email validation, CSRF and success-state checks passed. No database writes performed.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
