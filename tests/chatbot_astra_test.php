<?php
// Behavioral regressions from the supplied report, plus multilingual and bounded-dialogue cases.
require __DIR__ . '/../api/chatbot/bootstrap.php';
set_error_handler(static function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});
$started = microtime(true);
$kb = new OneStep\Chat\KnowledgeBase(dirname(__DIR__));
$bot = new OneStep\Chat\Counselor($kb);
$passed = 0; $failed = 0;
function expect($condition, string $label): void {
    global $passed, $failed;
    if ($condition) $passed++; else { $failed++; fwrite(STDERR, "FAIL: $label\n"); }
}
function has(array $r, string $s): bool { return stripos($r['reply'], $s) !== false; }
function uni(array $r, string $id): bool { return ($r['context']['universities'] ?? []) === [$id]; }
function ask(string $q, array $context = []): array { global $bot; return $bot->answer($q, $context); }

// Replay precisely the 81 supplied questions, retaining context only for explicitly marked stories.
$bank = json_decode(preg_replace('/^\s*const testQuestions\s*=\s*|;\s*$/', '', file_get_contents(dirname(__DIR__) . '/bot_test_questions.js')), true, 512, JSON_THROW_ON_ERROR);
$stories = [];
foreach ($bank as $q) $stories[$q['q']] = $q['story'] ?? null;
preg_match_all('/^Q(\d+): (.+)$/m', file_get_contents(__DIR__ . '/CHATBOT_TEST_RESULTS-astra.txt'), $lines, PREG_SET_ORDER);
$answers = []; $context = []; $last = null;
foreach ($lines as $line) {
    $q = trim($line[2]); $story = $stories[$q] ?? null;
    if ($story === null || $story !== $last) $context = [];
    $last = $story;
    $r = ask($q, $context); $context = $r['context']; $answers[(int)$line[1]] = $r;
    expect(is_string($r['reply']) && $r['reply'] !== '' && strlen(json_encode($context, JSON_UNESCAPED_UNICODE)) <= 4096, "Report Q{$line[1]} produces a valid bounded response");
}
expect(count($answers) === 81, 'All supplied report questions replayed');
foreach ([2,4,5,43,44,45] as $n) expect($answers[$n]['status'] !== 'answered' && empty($answers[$n]['matched_q']), "Q$n does not invent an answer for noise/code");
foreach ([3,6,7,22,31,41] as $n) expect($answers[$n]['status'] === 'clarification', "Q$n asks for missing cost scope");
foreach ([8,73] as $n) expect(has($answers[$n], 'UTM') && has($answers[$n], '**UM**') && has($answers[$n], 'No program or fee catalog'), "Q$n answers supported university and reports missing UM data");
foreach ([9,10,19,20] as $n) expect(!has($answers[$n], 'supported filter') && count($answers[$n]['sources']) > 0, "Q$n handles natural request words");
expect(has($answers[20], '**management**') && $answers[20]['status'] === 'partial', 'Unmatched half of engineering/management request is explicit');
foreach ([11,12,13,14] as $n) expect(($answers[$n]['context']['language'] ?? '') === 'bn' && preg_match('/\p{Bengali}/u', $answers[$n]['reply']), "Q$n responds to Banglish in Bengali");
foreach ([15,16,17,18] as $n) expect(has($answers[$n], 'application/searchForm') && has($answers[$n], 'cannot'), "Q$n distinguishes local explanation from live tracking");
expect(has($answers[15], '32%') && has($answers[15], 'Immigration') && !has($answers[15], '70%'), 'Q15 provides sourced stage explanation');
expect(has($answers[26], 'timeline') && !has($answers[26], 'secure your Visa'), 'Narrative gap question avoids approval promises');
expect(has($answers[28], 'specific information') && !has($answers[28], 'monitor your'), 'Pending-document request is explained without invented portal access');
foreach ([30,68] as $n) expect(has($answers[$n], 'Chinese and Indian') && has($answers[$n], '31 December 2026') && has($answers[$n], 'not a universal'), "Q$n preserves good-conduct applicability");
expect(has($answers[33], 'qualification') && !has($answers[33], 'credit card'), 'Vague academic acceptance does not retrieve payment methods');
expect(has($answers[37], '**Fees**') && has($answers[37], 'Scholarships') && has($answers[37], '20 hours') && has($answers[37], 'EMGS fee estimates'), 'Long financial narrative addresses course, funding, visa and work');
expect(has($answers[38], 'automated assistant') && has($answers[39], 'wa.me') && has($answers[40], 'welcome'), 'Bot identity, handoff and farewell understood');
expect(has($answers[42], 'invoice') && !has($answers[42], '**Programs'), 'Medical-payment question is not tuition search');
expect(uni($answers[49], 'taylors') && has($answers[49], '70,014'), 'Taylor story retains institution for master fees');
expect(uni($answers[51], 'ucsi') && strpos($answers[51]['reply'], 'Bachelor') < (strpos($answers[51]['reply'], 'Doctor of') ?: PHP_INT_MAX), 'Engineering overview starts with undergraduate catalog entries');
expect(uni($answers[55], 'cityu') && has($answers[55], 'Computer Science') && !has($answers[55], 'Master of Business'), 'City fee follow-up retains selected CS topic');
expect(has($answers[57], 'not a verified Kuala Lumpur'), 'General living estimate is not presented as a city-specific quote');
expect(empty($answers[62]['context']['levels']) && !has($answers[62], 'matching entries'), 'Completed BBA is academic background, not target program');
expect(!preg_match('/\*\*[^\n]*Bachelor/i', $answers[64]['reply']), 'Accreditation-code MBA fragment cannot turn a bachelor into a master');
expect(has($answers[66], '54,350') && has($answers[66], '38,800'), 'SEGi/APU MBA comparison includes both sourced fee tables');
expect(has($answers[69], 'does not provide a reliable') && has($answers[71], 'not on the supplied'), 'Bangladesh visa/Graduate Pass advice does not manufacture success or eligibility');
expect(!preg_match('/Duration:\*\*\s*(?:Master|Bachelor)\b/i', $answers[74]['reply']), 'Dirty degree labels are not shown as durations');
expect(has($answers[75], 'no monetary fee amount') && !has($answers[75], '**Study Mode:**'), 'Unpriced UTM rows do not become fee quotes');
expect(has($answers[77], 'malaysia-scholarship.html') && has($answers[77], 'does not verify'), 'Government award guidance names the current-data limitation');
expect(has($answers[80], '**UM**') && !has($answers[80], 'UMW'), 'UM hostel query is not redirected to another institution');
expect(has($answers[81], 'partner agreement') && !has($answers[81], 'guarantee transfer'), 'UK transfer needs a verified course agreement');

$r = ask('সিটি ইউনিভার্সিটি তে মাস্টারস পড়তে কেমন খরচ হবে?');
expect(uni($r,'cityu') && ($r['context']['levels'] ?? []) === ['master'] && has($r,'RM35,523') && preg_match('/\p{Bengali}/u',$r['reply']), 'Requested Bengali City masters example');
foreach (['CITYU BBA fees','CityU IT bachelor fees','CITYU BoHM fees','BAC BBA fees','A.P.U mastres fes','APU enginering bachelor fees'] as $q) {
    $r = ask($q); expect($r['status'] === 'answered' && count($r['sources']) > 0, "Abbreviation/typo: $q");
}
$r = ask('APU IT master fees');
expect(has($r,'38,800') && !empty($r['sources']), 'IT abbreviation works inside a grouped program record');
$r = ask('SEGi MBA fees');
$r = ask('How much would IT cost for one year?',$r['context']);
expect(has($r,'51,200') && ($r['context']['subjects'] ?? []) === ['businessadministration'], 'Capitalised IT pronoun does not change the program');
$r = ask('malisia te BBA porte chai');
expect(($r['context']['levels'] ?? []) === ['bachelor'] && !empty($r['sources']), 'Banglish plus Malaysia spelling mistake');
$r = ask('APU master fees in malisia');
expect(($r['context']['language'] ?? '') === 'en' && has($r,'38,800'), 'An English geography typo does not switch the response language');
$r = ask('malaysia te best university kunta?');
expect($r['status'] === 'clarification' && has($r,'BBA') && empty($r['context']['choices']), 'Best university asks relevant study criteria rather than unrelated FAQs');
$r = ask('BBA',$r['context']);
expect(count($r['context']['candidates'] ?? []) === 3 && has($r,'Business Administration'), 'Recommendation criteria produce actual program shortlist');
$shortlist = $r;
$r = ask('How much would it cost for one year?',$shortlist['context']);
expect($r['status'] === 'clarification' && empty($r['sources']), 'Multiple recommendations are clarified before choosing a fee');
$r = ask('1',$shortlist['context']);
expect(uni($r,'cityu') && empty($r['context']['candidates']), 'Numbered university selection establishes focus');
$r = ask('ওটার এক বছরের খরচ কত?',$r['context']);
expect(uni($r,'cityu') && has($r,'RM23,190') && ($r['context']['fee_period'] ?? '') === 'first_year', 'Bengali pronoun and first-year follow-up retain selected BBA');
$r = ask('SEGi MBA fees');
$r = ask('How much would it cost for one year?',$r['context']);
expect(uni($r,'segi') && has($r,'51,200') && !has($r,'54,350'), 'SEGi MBA first-year figure is looked up, not divided or substituted with total');
$r = ask('What about the second year?',$r['context']);
expect(has($r,'Year 2 fees are not recorded') && !has($r,'51,200'), 'A missing second-year amount is not first-year or zero');
$r = ask('CityU BoHM fees');
$r = ask('What about year 2?',$r['context']);
expect(has($r,'RM17,278') && !has($r,'RM23,190'), 'Recorded second-year amount can be selected');
$r = ask('APU MBA fees');
$r = ask('What does it cost for one year?',$r['context']);
expect($r['status'] === 'partial' && has($r,'not an annual quote') && !has($r,'38,800'), 'Missing annual APU breakdown does not invent annual fees');
$r = ask('SEGi BBA fees');
expect($r['status'] === 'clarification' && has($r,'different program title') && !has($r,'38,660'), 'Related SEGi Business Management is not silently renamed BBA');
$r = ask('Bachelor of Business Management',$r['context']);
$r = ask('How much would it cost for one year?',$r['context']);
expect(uni($r,'segi') && has($r,'38,660'), 'Confirmed related program supports the SEGi yearly-cost flow');
$r = ask('APU master fees at Kuala Lumpur under RM50000 total');
$r = ask('সিটি ইউনিভার্সিটি তে মাস্টারস পড়তে কেমন খরচ হবে?',$r['context']);
expect(uni($r,'cityu') && empty($r['context']['campus']) && empty($r['context']['budget']) && has($r,'RM35,523'), 'New explicit university query clears stale campus and budget');
$r = ask('APU master fees');
foreach (['asdfghjkl','Are you a human or a bot?','Goodbye, thanks for the help.'] as $q) {
    $next = ask($q,$r['context']); expect(!has($next,'38,800'), "No stale fee answer to $q");
}
$r = ask('APU master fees under RM50000 total');
$r = ask('Start over',$r['context']);
expect(empty($r['context']['universities']) && empty($r['context']['budget']), 'Reset clears all previous filters');
$r = ask('APU মাস্টার্স শুধু শুক্রবার ক্লাসের ফি');
expect($r['status'] === 'clarification' && !has($r,'38,800'), 'Unknown Bengali restriction is clarified, not ignored');

// Source applicability and conflicting data.
$cases = [
 ['What documents do I need for a new student visa?',['offer letter','18 months'],['Sarawak Immigration']],
 ['Passport pages for Iran',['all pages, including blank pages'],[]],
 ['Passport pages for Bangladesh',['not on the supplied all-pages exception list'],[]],
 ['How long should my passport be valid for a renewal?',['12 months','18 months'],[]],
 ['Student pass renewal CGPA 1.9 attendance 75%',['2.0','80%','explanation letter'],['automatically rejected']],
 ['Who needs a NOC?',['Sudanese students only'],[]],
 ['Who needs a LOE?',['Iranian students only'],[]],
 ['Do I need yellow fever vaccination?',['conditional','risk'],[]],
 ['What is the EMGS photo size?',['35 × 45','50 mm','conflict'],[]],
 ['Can I use a selfie for EMGS?',['No selfies'],[]],
 ['Personal bond for Bangladesh',['RM750','refundable'],[]],
 ['Personal bond for India and Bangladesh',['**India','**Bangladesh','RM750'],[]],
 ['Can Indian students apply for the Graduate Pass?',['31 December 2026','good-conduct'],[]],
 ['Can Bangladeshi students get a Graduate Pass?',['not on the supplied','12-month'],['Bangladesh** is on']],
 ['Compare Graduate Pass eligibility for Bangladesh and India',['**Bangladesh','**India','not on the supplied'],[]],
 ['Graduate Pass eligible countries',['Australia','Vietnam','United Kingdom'],[]],
 ['Graduate Pass sponsor requirements',['RM1,500','three months','NRIC'],[]],
 ['Can I get a Graduate Pass after my Student Pass expired?',['must be valid','Check Out Memo'],[]],
 ['What are Graduate Pass documents?',['217 × 280','insurance','passport'],[]],
 ['SEV for Bangladesh',['on the supplied SEV-required list'],[]],
 ['EMGS English certificate requirements',['MUET','OET','Linguaskill'],[]],
 ['Refund of medical screening and insurance',['RM50','RM100','90-day'],[]],
 ['Refund for iKad and courier after expiry',['RM10','RM2'],[]],
 ['Refund of service tax and convenience fees',['non-refundable'],[]],
 ['Refund application not approved by institution',['self-created','90 days'],[]],
 ['Refund bank account paid by credit card',['own bank account','institution'],[]],
 ['Refund because of processing delay',['delay alone','not'],[]],
 ['What is the EMGS fee for SEGi?',['RM3,860','estimates','different Visa Fee'],[]],
 ['What is the EMGS fee for UCSI engineering?',['RM3,750'],[]],
 ['What is the visa cost for BAC?',['RM4,800','RM3,000 first'],[]],
 ['Can I work part time during classes?',['20 hours','only during semester breaks','prior Immigration approval'],[]],
 ['My EMGS is at 32%',['32%','Immigration','cannot'],['70%']],
 ['My EMGS is at 70%',['percentage','cannot'],['32%']],
 ['Do I need a letter of good conduct?',['Chinese and Indian','not a universal'],[]],
];
foreach ($cases as [$q,$yes,$no]) {
    $r = ask($q);
    expect(!empty($r['sources']), "$q has a reference");
    foreach ($yes as $s) expect(has($r,$s), "$q includes $s");
    foreach ($no as $s) expect(!has($r,$s), "$q excludes $s");
    foreach ($r['sources'] as $source) if (isset($source['pointer'])) {
        $node = json_decode(file_get_contents(dirname(__DIR__) . '/' . $source['file']),true,512,JSON_THROW_ON_ERROR);
        foreach (explode('/',ltrim($source['pointer'],'/')) as $key) $node = $node[str_replace(['~1','~0'],['/','~'],$key)] ?? null;
        expect($node !== null, "$q source pointer resolves to its actual local record");
    }
}
$r = ask('Tell me about Graduate Pass');
$r = ask('Bangladesh',$r['context']);
expect(has($r,'not on the supplied'), 'Nationality-only follow-up retains Graduate Pass topic');
$r = ask('I am not Bangladeshi, I am Indian. Can I apply for a Graduate Pass?');
expect(($r['context']['nationality'] ?? '') === 'India' && !has($r,'**Bangladesh**'), 'Negated nationality cannot control eligibility');
$r = ask('আমি বাংলাদেশি আমার পার্সোনাল বন্ড কত?');
expect(has($r,'RM750') && preg_match('/\p{Bengali}/u',$r['reply']), 'Bangla personal-bond question uses nationality and local table');
$r = ask('ইএমজিএস ৩২% আটকে আছে');
expect(has($r,'৩২%') && has($r,'Immigration') && ($r['context']['language'] ?? '') === 'bn', 'Bengali digits and EMGS stage');

// Hundreds of turns must not enlarge memory or introduce a transcript.
$r = ask('SEGi MBA fees'); $maxBytes = 0; $validLongDialogue = true;
for ($i=0; $i<500; $i++) {
    $r = ask($i % 2 ? 'What is the total fee?' : 'How much would it cost for one year?', $r['context']);
    $bytes = strlen(json_encode(['message'=>'How much would it cost for one year?', 'context'=>$r['context']], JSON_UNESCAPED_UNICODE));
    $maxBytes = max($maxBytes,$bytes);
    $validLongDialogue = $validLongDialogue && uni($r,'segi') && has($r,$i%2 ? '54,350':'51,200') && $bytes < 4096;
}
expect($validLongDialogue, '500 follow-ups retain the exact university/program with bounded requests');
expect(!isset($r['context']['history']) && !isset($r['context']['reply']) && !isset($r['context']['message']), 'Conversation memory never contains the transcript or answer text');
$r = ask('hi',['history'=>str_repeat('private transcript ',500)]);
expect($r['status'] === 'clarification' && strlen(json_encode($r['context'])) < 4096 && !has($r,'private transcript'), 'Oversized/tampered context recovers without PHP/server error or transcript echo');
$r = ask('What are the fees?',['knowledge_version'=>'outdated','universities'=>['segi'],'levels'=>['master'],'intent'=>'fees']);
expect($r['status'] === 'clarification' && !has($r,'54,350'), 'Stale knowledge-version state is re-clarified');
echo sprintf("%d passed, %d failed; 500-turn max request %d bytes; %.2fs; peak %.1f MiB\n",$passed,$failed,$maxBytes,microtime(true)-$started,memory_get_peak_usage(true)/1048576);
exit($failed ? 1 : 0);
