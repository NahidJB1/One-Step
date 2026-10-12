// Dependency-free widget contract tests. These do not replace visual browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const script = fs.readFileSync(require('node:path').join(__dirname, '../assets/js/chatbot.js'), 'utf8');

function widget(pathname, options = {}) {
    const byId = new Map();
    class Element {
        constructor(tag) { this.tagName = tag; this.children = []; this.style = {}; this.events = {}; this.value = ''; this.className = ''; this.disabled = false; this._html = ''; }
        set id(id) { this._id = id; byId.set(id, this); }
        get id() { return this._id; }
        set innerHTML(html) {
            this._html = html;
            for (const match of html.matchAll(/id="([^"]+)"/g)) if (!byId.has(match[1])) { const e = new Element('div'); e.id = match[1]; }
        }
        get innerHTML() { return this._html; }
        get classList() { return { add: () => {}, remove: () => {}, toggle: () => {} }; }
        appendChild(child) { child.parent = this; this.children.push(child); return child; }
        addEventListener(name, fn) { this.events[name] = fn; }
        focus() {}
        remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); if (this.id) byId.delete(this.id); }
        querySelector(selector) {
            if (selector.startsWith('.') && this.innerHTML.includes(selector.slice(1))) return new Element('button');
            return this.querySelectorAll(selector)[0] || null;
        }
        querySelectorAll(selector) {
            return this.children.flatMap(c => [...(c.className.split(' ').includes(selector.slice(1)) ? [c] : []), ...c.querySelectorAll(selector)]);
        }
    }
    const storage = new Map(Object.entries(options.storage || {}));
    const requests = [];
    const errors = [];
    const replies = options.replies || [];
    const document = { body: new Element('body'), createElement: tag => new Element(tag), getElementById: id => byId.get(id) || null };
    vm.runInNewContext(script, {
        document, window: { location: { pathname, href: `https://example.test${pathname}`, protocol: 'https:' }, innerWidth: 1000 },
        URL, AbortController, console: { error: (...args) => errors.push(args) },
        localStorage: {
            getItem: key => { if (options.storageBlocked) throw new Error('Blocked'); return storage.get(key) || null; },
            setItem: (key, value) => { if (options.storageBlocked) throw new Error('Blocked'); storage.set(key, value); }
        },
        navigator: { clipboard: { writeText: async () => {} } },
        setTimeout: () => 1, clearTimeout: () => {},
        fetch: async (url, init) => {
            requests.push({ url, body: JSON.parse(init.body) });
            const reply = replies.shift();
            if (reply instanceof Error) throw reply;
            return { ok: true, json: async () => reply };
        }
    });
    return {
        byId, storage, requests, errors,
        async send(message) { byId.get('os-chat-input').value = message; await byId.get('os-chat-send').events.click(); },
        bots() { return byId.get('os-chat-messages').children.filter(c => c.className === 'os-message bot'); }
    };
}

(async () => {
    const context = { version: 2, universities: ['apu'], levels: ['master'], intent: 'fees' };
    const reply = {
        reply: '| University | Fee |\n|---|---|\n| APU | RM 38,800 |', context, matched_q: null,
        buttons: [{ label: '<img src=x onerror=alert(1)>', url: 'Fees_Chart/apu-fees.html', class: 'evil" onclick="alert(1)' }],
        sources: [{ title: 'APU fees', url: 'Fees_Chart/apu-fees.html' }], suggestions: ['What about SEGi?']
    };
    let w = widget('/project/Universities/apu-details.html', { replies: [reply, { reply: 'SEGi fees', context: { universities: ['segi'] }, suggestions: [] }] });
    await w.send('APU master fees');
    assert.equal(w.requests[0].url, '../api/chat.php');
    assert.deepEqual(JSON.parse(w.storage.get('os_chat_context')), context);
    const bot = w.bots().at(-1);
    assert(bot.innerHTML.endsWith('</table></div>'), 'Trailing markdown table must close');
    const button = bot.children.find(c => c.className === 'os-bot-buttons').children[0];
    assert.equal(button.href, 'https://example.test/project/Fees_Chart/apu-fees');
    assert.equal(button.textContent, '<img src=x onerror=alert(1)>');
    assert.equal(button.innerHTML, '');
    assert.equal(button.rel, 'noopener noreferrer');
    assert.equal(button.className, 'os-details-btn');
    const source = bot.children.find(c => c.className === 'os-chat-sources').children.find(c => c.tagName === 'a');
    assert.equal(source.href, 'https://example.test/project/Fees_Chart/apu-fees');
    await w.send('What about SEGi?');
    assert.deepEqual(w.requests[1].body.context, context);
    assert.equal(Object.hasOwn(w.requests[1].body, 'history'), false, 'Requests contain compact context, never conversation history');
    assert(!w.byId.get('os-chat-input').disabled && !w.byId.get('os-chat-send').disabled);
    assert.equal(w.errors.length, 0);

    w = widget('/Universities/apu-details', { replies: [{
        reply: '[CityU](Fees_Chart/city-university-fees.html?q=business%20management#fee-category-0) [External](https://official.example/course.html)',
        buttons: [{label:'Profile',url:'Universities/cityu-details.html'},{label:'Download',url:'assets/documents/fees/cityu-fees.pdf'}],
        sources: [{title:'Country',url:'countries/china.html'},{title:'Hub',url:'explore-universities.html'}]
    }] });
    await w.send('links');
    const cleanBot = w.bots().at(-1);
    assert(cleanBot.innerHTML.includes('href="https://example.test/Fees_Chart/cityu-fees?q=business%20management#fee-category-0"'));
    assert(cleanBot.innerHTML.includes('href="https://official.example/course.html"'));
    assert.deepEqual(cleanBot.children.find(c=>c.className==='os-bot-buttons').children.map(c=>c.href),[
        'https://example.test/Universities/cityu-details','https://example.test/assets/documents/fees/cityu-fees.pdf'
    ]);
    assert.deepEqual(cleanBot.children.find(c=>c.className==='os-chat-sources').children.filter(c=>c.tagName==='a').map(c=>c.href),[
        'https://example.test/countries/china','https://example.test/explore-universities'
    ]);

    w = widget('/index.html', { replies: [{ reply: '[Bad](javascript:alert) [Good](https://example.com) **Hello** <script>alert(1)</script>', buttons: [{url:'javascript:alert(1)', label:'bad'}], sources: [] }] });
    await w.send('test');
    const html = w.bots().at(-1).innerHTML;
    assert(!html.includes('href="javascript:') && !html.includes('<script>'));
    assert(html.includes('<strong>Hello</strong>') && html.includes('href="https://example.com/"'));

    w = widget('/index.html', { storageBlocked: true, replies: [{ reply: 'Works without storage', context: {} }] });
    await w.send('hello');
    assert.equal(w.errors.length, 0);
    assert(w.bots().at(-1).innerHTML.includes('Works without storage'));
    w = widget('/index.html', { replies: [new Error('Network down')] });
    await w.send('hello');
    assert(!w.byId.get('os-chat-input').disabled && !w.byId.get('os-chat-send').disabled);
    assert(!w.byId.get('os-typing'));
    const compact = { version: 3, universities: ['segi'], levels: ['master'], subjects: ['businessadministration'], intent: 'fees', knowledge_version: 'test-version' };
    w = widget('/index.html', { replies: Array.from({length: 300}, () => ({reply: 'Recorded fee', context: compact, sources: [], suggestions: []})) });
    for (let i = 0; i < 300; i++) await w.send('How much would it cost for one year?');
    const bodies = w.requests.slice(1).map(r => JSON.stringify(r.body));
    assert(bodies.every(body => body.length === bodies[0].length && body.length < 4096), 'Requests stay the same size after 300 widget turns');
    assert(w.requests.every(r => Object.keys(r.body).sort().join(',') === 'context,message'), 'Only the current question and compact state are sent');
    assert(JSON.parse(w.storage.get('os_chat_history')).length <= 40, 'UI history remains capped in browser storage');
    assert.equal(w.errors.length, 0);
    console.log('Widget contract checks passed (context, sources, nested paths, rendering, safe links, storage and network failures)');
})().catch(error => { console.error(error); process.exitCode = 1; });
