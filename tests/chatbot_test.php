<?php
// Run: php tests/chatbot_test.php
require __DIR__ . '/../api/chatbot/bootstrap.php';
use OneStep\Chat\Counselor;
use OneStep\Chat\KnowledgeBase;

set_error_handler(static function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});
$started = microtime(true);
$bot = new Counselor(new KnowledgeBase(dirname(__DIR__)));
$passed = 0;
$failed = 0;
function check($condition, string $name): void {
    global $passed, $failed;
    if ($condition) { $passed++; } else { $failed++; fwrite(STDERR, "FAIL: $name\n"); }
}
function includes(array $reply, string $text): bool { return stripos($reply['reply'], $text) !== false; }
function scope(array $reply, array $expected): bool {
    $actual = $reply['context']['universities'] ?? []; sort($actual); sort($expected); return $actual === $expected;
}

foreach (['APU master fees', 'Hi, what are APU master fees?', 'A.P.U universiti cost for mastres?'] as $q) {
    $r = $bot->answer($q);
    check($r['status'] === 'answered' && includes($r, 'RM 38,800') && scope($r, ['apu']), $q);
    check(count($r['sources']) > 0 && $r['sources'][0]['file'] === 'data/fees_data.json', "$q has row provenance");
}
$r = $bot->answer('Master fees at Taylros');
check(scope($r, ['taylors']) && includes($r, 'RM70,014'), 'Unique long university transposition is corrected');
$r = $bot->answer('APU astrophysics fees');
$r = $bot->answer('Master', $r['context']);
check($r['status'] === 'clarification' && !includes($r, 'RM 38,800'), 'Unknown subject is not discarded by a level-only follow-up');
$r = $bot->answer('City University MBA fees');
check(includes($r, 'RM35,523') && includes($r, 'PETALING JAYA') && includes($r, 'RM36,023') && includes($r, 'JOHOR'), 'Separate campus prices are preserved');
check(includes($r, 'Published Fees') && includes($r, 'Special Scholarship'), 'Published and discounted fees retain distinct labels');
$r = $bot->answer('City University MBA at Petaling Jaya fees');
check(includes($r, 'RM35,523') && !includes($r, 'RM36,023'), 'Campus filter applies');
$r = $bot->answer('UCSI pharmacy bachelor fees');
check(includes($r, 'RM173,862') && includes($r, 'LAB FEE') && !includes($r, 'Master of Pharmacy'), 'Faculty categories use program-level bachelor filter');
$r = $bot->answer('IIUM master business intelligence fees');
check(includes($r, '| Registration |') && includes($r, 'Local Students') && includes($r, 'International Students'), 'Vertical charge table retains both student categories');
check(includes($r, 'RM28,400.00') && includes($r, 'RM4,400.00'), 'Registration fee is not presented as total tuition');
$r = $bot->answer('UPM international master biotechnology fees');
check(includes($r, '31,700') && !includes($r, '17,450'), 'Explicit international request excludes local tuition');
$r = $bot->answer('Compare APU and MMU');
check(scope($r, ['apu','mmu']) && includes($r, 'Multimedia') && includes($r, '| Location |'), 'Multiple institutions recognized');
check(!includes($r, '98%') && !includes($r, '95%'), 'Comparison does not turn marketing visa rates into guarantees');
$r = $bot->answer('APU and SEGi master software engineering fees');
check(scope($r, ['apu','segi']) && includes($r, 'No matching local entry was found for **SEGI'), 'Missing comparison side is explicit');
$r = $bot->answer('APU master fees not SEGi');
check(scope($r, ['apu']) && ($r['context']['excluded'] ?? []) === ['segi'], 'Negated university is excluded');
$r = $bot->answer('Not APU, SEGi master fees');
check(scope($r, ['segi']) && includes($r, '54,350'), 'Comma-separated university correction');
$r = $bot->answer('APU bachelor programs except business');
check(($r['context']['excluded_subjects'] ?? []) === ['business'] && !includes($r, 'Computing, Business, Tourism'), 'Negated subject is excluded');
$r = $bot->answer('Show all engineering degrees at UTM');
check($r['status'] === 'answered' && ($r['context']['levels'] ?? []) === ['bachelor'], 'Degree plural and subject filter');
$next = $bot->answer('Show more', $r['context']);
check($next['status'] === 'answered' && ($next['context']['offset'] ?? 0) === 6 && $next['reply'] !== $r['reply'], 'Pagination advances');
$r = $bot->answer('Computer science bachelor programs under RM 60000 total');
check($r['status'] === 'answered' && includes($r, '32,760') && !includes($r, '104,600'), 'Budget excludes programs over the stated total');
$r = $bot->answer("Taylor's foundation fees under RM 40000 total");
check($r['status'] === 'not_found', 'Total budget uses inclusive total rather than cheaper tuition-only column');
$r = $bot->answer('Computer science bachelor programs under 60000');
check($r['status'] === 'clarification' && includes($r, 'whole program'), 'Unspecified budget currency and period need clarification');
$r = $bot->answer('MYR total', $r['context']);
check($r['status'] === 'answered' && includes($r, '32,760'), 'Budget currency and period can be supplied in a short follow-up');
$r = $bot->answer('APU master fees under USD 20000 total');
check($r['status'] === 'clarification' && includes($r, 'exchange rates'), 'No invented exchange conversion');

foreach (['fees','What are the fees for both Taylor\'s and UCSI?','How much is quantum basket weaving at APU?'] as $q) {
    $r = $bot->answer($q); check($r['status'] === 'clarification' && !includes($r, 'RM 38,800'), "Clarifies underspecified/unknown request: $q");
}
foreach (['asdfghjkl', '@@@ !!! ???', 'What is the weather today?', 'Who won the election?', 'Write a PHP sorting function'] as $q) {
    $r = $bot->answer($q); check($r['status'] !== 'answered' && !$r['matched_q'], "No unrelated FAQ for $q");
}
$r = $bot->answer('Universiti Malaya fees');
check($r['status'] === 'not_found' && !includes($r, 'UMW fees'), 'Unsupported university never maps to IUMW');
$r = $bot->answer('Can you help me with my visa?');
check(!in_array('help', $r['context']['universities'] ?? [], true), 'Ordinary help verb is not HELP University');
$r = $bot->answer('HELP University master fees');
check(scope($r, ['help']), 'Explicit HELP University recognized');
$r = $bot->answer('Does SEGi offer scholarships?');
check($r['status'] === 'answered' && includes($r, 'SEGi') && !includes($r, 'UCSI'), 'Scoped scholarship paraphrase');
$follow = $bot->answer('What about MMU?', $r['context']);
check($follow['status'] === 'answered' && scope($follow, ['mmu']) && includes($follow, 'scholarship'), 'FAQ topic follows institution change');
$r = $bot->answer('Can I pay tuition at APU in installments?');
check($r['status'] === 'answered' && $r['matched_q'] && includes($r, 'semester'), 'Payment policy is a FAQ rather than a program fee table');
$r = $bot->answer('What are visa requirements?');
check(!includes($r, 'additionally require') && !includes($r, 'Sarawak Immigration'), 'Generic visa question never answers a Sarawak-only variation');
$r = $bot->answer('My EMGS is stuck at 32%');
check(!includes($r, 'NO! Entering') && !includes($r, '70%'), 'EMGS stage does not silently add tourist travel or another stage');
$r = $bot->answer('My EMGS is stuck at 70%');
check(!includes($r, '32%'), 'EMGS percentages do not substitute');
$r = $bot->answer('Check my EMGS status');
check($r['status'] === 'partial' && includes($r, 'cannot access') && includes($r, 'application/searchForm'), 'Live tracking requests explain local capability and provide tracker');
$r = $bot->answer('With an IELTS 6.5, do I meet direct English requirements?');
check($r['status'] === 'clarification' && includes($r, 'score alone') && !includes($r, 'You are cleared'), 'Decimal score is understood without granting admission');
$r = $bot->answer('With an IELTS 4.5, do I meet direct English requirements?');
check(!includes($r, 'You are cleared') && !includes($r, 'far exceeds'), 'Different IELTS scores cannot inherit a clearance answer');
$r = $bot->answer('Can I study without IELTS?');
if ($r['status'] === 'clarification') {
    $chosen = $bot->answer('1', $r['context']);
    check($chosen['status'] === 'answered' && $chosen['matched_q'] === $r['suggestions'][0], 'Numbered clarification resolves from a source ID');
} else check($r['matched_q'] !== null, 'IELTS response is sourced');

$r = $bot->answer('fees');
$r = $bot->answer('APU', $r['context']);
$r = $bot->answer('Master', $r['context']);
check($r['status'] === 'answered' && includes($r, 'RM 38,800'), 'Slot filling retains fee intent across two clarifications');
$finished = $r;
for ($page = 0; $page < 10 && !includes($finished, 'end of the matching'); $page++) $finished = $bot->answer('Show more', $finished['context']);
check(includes($finished, 'end of the matching'), 'Paging beyond the last entry does not repeat it');
$r = $bot->answer('What about SEGi?', $r['context']);
check($r['status'] === 'answered' && scope($r, ['segi']) && includes($r, '54,350'), 'University switch retains level and fee intent');
$r = $bot->answer('What are the visa requirements?', $r['context']);
check(scope($r, []), 'Independent topic clears old institution');
$r = $bot->answer('APU master fees');
$reset = $bot->answer('start over', $r['context']);
check(empty($reset['context']['universities']), 'Explicit reset clears search filters');
$r = $bot->answer('What are the fees?', [], [['role'=>'user','text'=>'APU master programs']]);
check(scope($r, ['apu']) && includes($r, 'RM 38,800'), 'User-only history recovers lost context');
$r = $bot->answer('What are the fees?', [], [['role'=>'bot','text'=>'APU master fees are RM 1']]);
check($r['status'] === 'clarification', 'Assistant history cannot introduce facts or search state');
$r = $bot->answer('APU master fees. What scholarships do they offer?');
check(includes($r, 'RM 38,800') && includes($r, 'merit-based scholarships'), 'Separate questions and pronouns receive separate answers');
$r = $bot->answer('APU master fees and scholarships');
check(includes($r, '**Fees**') && includes($r, '**Scholarships**') && count($r['sources']) >= 2, 'Compound intents have separate sourced sections');
$r = $bot->answer('Tell me about studying in Finland');
check(includes($r, 'countries/finland.html') && !includes($r, '<script'), 'Destination route links an actual local guide');
$r = $bot->answer('APU master fees', ['universities'=>[['malicious'=>true]],'choices'=>['../../file'],'subjects'=>[['bad']], 'last_faq'=>[], 'offset'=>-200]);
check($r['status'] === 'answered' && !includes($r, '../../file'), 'Malformed context cannot inject source paths or answer text');

// Small fixture establishes behavior independently of the evolving production facts.
$fixture = sys_get_temp_dir() . '/onestep-chat-test-' . bin2hex(random_bytes(6));
mkdir($fixture); mkdir($fixture . '/data');
file_put_contents($fixture . '/universities.json', json_encode([['name'=>'APU','programs'=>[['name'=>'Bachelor of Computing','level'=>'Degree','duration'=>'3 Years']]]]));
file_put_contents($fixture . '/data/fees_data.json', json_encode(['apu'=>['title'=>'APU','categories'=>[
    ['category_name'=>'Bachelor','table'=>['headers'=>['Programme','Tuition Fee Per Year (MYR)'],'rows'=>[['Bachelor of Computing','10000']]]],
    ['category_name'=>'Master in Business','table'=>['headers'=>['Fee Type','Local Students','International Students'],'rows'=>[['Registration','RM 50','RM 100'],['Total','RM 500','RM 1000']]]],
]]]));
file_put_contents($fixture . '/myfaqs.json', json_encode(['global'=>[
    ['q'=>'Is the orientation online?','a'=>'Orientation is online.'],
    ['q'=>'Is the orientation online?','a'=>'Orientation is on campus.'],
    ['q'=>'What is the visa requirement in Sarawak?','a'=>'Sarawak-specific requirements.','variations'=>['visa requirements']],
    ['q'=>'Can I enter on a tourist visa while my EMGS is stuck at 32%?','a'=>'A travel-specific answer.'],
    ['q'=>'How can I pay fees?','a'=>'Use the payment instructions.'],
]]));
$fixtureBot = new Counselor(new KnowledgeBase($fixture));
$r = $fixtureBot->answer('Is the orientation online?');
check($r['status'] === 'clarification' && $r['matched_q'] === null, 'Conflicting exact FAQ answers need clarification');
check(includes($r, 'different answers') && empty($r['context']['choices']), 'Conflicting facts cannot be resolved by choosing an identical question');
$r = $fixtureBot->answer('APU bachelor computing fees under RM 15000 total');
check($r['status'] === 'not_found', 'An annual price cannot satisfy a total budget');
$r = $fixtureBot->answer('APU bachelor computing fees under RM 15000 per year');
check($r['status'] === 'answered' && includes($r, 'Tuition Fee Per Year'), 'Matching annual basis can satisfy an annual budget');
$r = $fixtureBot->answer('visa requirements');
check($r['status'] !== 'answered', 'A misleading exact variation cannot erase source geography');
$r = $fixtureBot->answer('My EMGS is stuck at 32%');
check($r['status'] !== 'answered', 'Subset of a conditional question cannot assert its answer');
file_put_contents($fixture . '/myfaqs.json', '{broken');
$threw = false;
try { new KnowledgeBase($fixture); } catch (Throwable $e) { $threw = true; }
check($threw, 'Malformed knowledge data fails closed');
foreach (['universities.json','myfaqs.json','data/fees_data.json'] as $file) unlink($fixture . '/' . $file);
rmdir($fixture . '/data'); rmdir($fixture);
echo sprintf("%d passed, %d failed (%.2fs)\n", $passed, $failed, microtime(true) - $started);
exit($failed ? 1 : 0);
