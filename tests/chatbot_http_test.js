/* Run with PHP_BINARY=/path/to/php node tests/chatbot_http_test.js.
 * Starts an isolated loopback PHP server; does not contact the deployed site. */
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const path = require('node:path');
const net = require('node:net');

async function freePort() {
    const server = net.createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    await new Promise(resolve => server.close(resolve));
    return port;
}
(async () => {
    const port = await freePort();
    const php = process.env.PHP_BINARY || 'php';
    const server = spawn(php, ['-S', `127.0.0.1:${port}`, '-t', '.'], {
        cwd: path.resolve(__dirname, '..'), windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']
    });
    let serverError;
    server.on('error', error => { serverError = error; });
    let log = '';
    server.stderr.on('data', chunk => { log += chunk; });
    const url = `http://127.0.0.1:${port}/api/chat.php`;
    const post = data => fetch(url, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    let checks = 0;
    try {
        let ready = false;
        for (let i = 0; i < 50; i++) {
            if (serverError) throw serverError;
            try { await fetch(url); ready = true; break; } catch (_) { await new Promise(resolve => setTimeout(resolve, 100)); }
        }
        assert(ready, `PHP did not start: ${log}`);
        const bad = [
            [undefined, 400], [[], 400], [{}, 400], [{ message: [] }, 400],
            [{ message: '  ' }, 400], [{ message: 'x'.repeat(2001) }, 422],
            [{ message: 'hi', context: 'oops' }, 400], [{ message: 'hi', history: 9 }, 400],
            [{ message: 'hi', excess: 'x'.repeat(33000) }, 413]
        ];
        for (const [body, status] of bad) {
            const r = await post(body);
            assert.equal(r.status, status);
            assert.equal(typeof (await r.json()).error, 'string'); checks++;
        }
        let r = await fetch(url, { method: 'POST', body: '{broken' });
        assert.equal(r.status, 400); await r.json(); checks++;
        r = await fetch(url);
        assert.equal(r.status, 405); assert.equal(r.headers.get('allow'), 'POST, OPTIONS'); checks++;
        r = await fetch(url, { method: 'OPTIONS' });
        assert.equal(r.status, 204); assert.equal(await r.text(), ''); checks++;
        r = await post({ message: 'APU master fees' });
        assert.equal(r.status, 200);
        assert.match(r.headers.get('content-type'), /application\/json.*utf-8/);
        assert.equal(r.headers.get('cache-control'), 'no-store');
        const answer = await r.json();
        assert.match(answer.reply, /38,800/); assert.equal(answer.status, 'answered');
        assert.equal(answer.sources[0].file, 'data/fees_data.json'); checks++;
        r = await post({ message: 'What about SEGi?', context: answer.context });
        const follow = await r.json(); assert.equal(r.status, 200); assert.match(follow.reply, /54,350/); checks++;
        r = await post({ message: 'আমার প্রশ্ন', context: { universities: [{ bad: true }], last_faq: [], subject_groups: [[{}]] } });
        assert.equal(r.status, 200); assert.equal((await r.json()).isFallback, true); checks++;
        r = await post({ message: 'সিটি ইউনিভার্সিটি তে মাস্টারস পড়তে কেমন খরচ হবে?' });
        const bengali = await r.json();
        assert.equal(r.status, 200); assert.equal(bengali.context.language, 'bn'); assert.match(bengali.reply, /RM35,523/); checks++;
        r = await post({ message: 'SEGi MBA fees' });
        const mba = await r.json();
        r = await post({ message: 'How much would it cost for one year?', context: mba.context });
        const annual = await r.json();
        assert.equal(r.status, 200); assert.match(annual.reply, /51,200/); assert(!annual.reply.includes('54,350')); checks++;
        r = await post({ message: 'emgs track' });
        const tracker = await r.json();
        assert.equal(r.status, 200); assert.match(tracker.reply, /cannot access/); assert.match(tracker.reply, /application\/searchForm/); checks++;
        r = await post({ message: 'hi', context: { transcript: 'x'.repeat(5000) } });
        const reset = await r.json();
        assert.equal(r.status, 200); assert.equal(reset.status, 'clarification'); assert(JSON.stringify(reset.context).length < 4096); checks++;
        r = await post({ message: 'APU QS ranking' });
        const ranking = await r.json();
        assert.equal(r.status, 200); assert.match(ranking.reply, /#=528/);
        assert.equal(ranking.context.intent, 'rankings');
        assert(ranking.sources.some(s => s.file === 'data/university_rankings.json')); checks++;
        r = await post({ message: 'Asia?', context: ranking.context });
        const asia = await r.json();
        assert.equal(r.status, 200); assert.match(asia.reply, /#147/); assert(!asia.reply.includes('#=528'));
        assert.deepEqual(asia.context.universities,['apu']); checks++;
        r = await post({ message: 'সিটি ইউনিভার্সিটি এশিয়ায় র‍্যাংকিং কত?' });
        const cityRanking = await r.json();
        assert.equal(r.status, 200); assert.match(cityRanking.reply, /#=558/); assert.equal(cityRanking.context.language,'bn'); checks++;
        r = await post({ message: 'APU ranking and MBA fees' });
        const combined = await r.json();
        assert.equal(r.status, 200); assert.match(combined.reply, /#=528/); assert.match(combined.reply, /38,800/); checks++;
        assert(!/PHP (?:Warning|Fatal|Notice|Deprecated)/.test(log), log);
        console.log(`${checks} HTTP checks passed`);
    } finally {
        server.kill();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
