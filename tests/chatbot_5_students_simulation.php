<?php
// Simulates five fictional Bangladeshi students, 20 contextual turns each.
// Run: php tests/chatbot_5_students_simulation.php
require __DIR__ . '/../api/chatbot/bootstrap.php';

use OneStep\Chat\KnowledgeBase;
use OneStep\Chat\Counselor;

date_default_timezone_set('Asia/Kuala_Lumpur');

set_error_handler(static function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

/*
 * Expectations deliberately test meaning rather than a complete fixed reply.
 * must: every fragment must appear; any: at least one fragment must appear;
 * avoid: no fragment may appear; statuses/uni/language validate routing/state.
 */
$students = [
    [
        'id' => 'student-a',
        'name' => 'Student A — Tanvir (fictional)',
        'profile' => 'Bangladesh HSC Science, GPA 5.0; wants a Computer Science bachelor; budget RM40,000/year; initially interested in APU and MMU; no IELTS yet.',
        'turns' => [
            ['q'=>'Hi, I completed HSC in science in Bangladesh with GPA 5. I want to study computer science in Malaysia.', 'any'=>['university','program','Bachelor','qualification'], 'avoid'=>['guarantee admission']],
            ['q'=>"Does APU have a bachelor's in computer science?", 'must'=>['APU','Bachelor'], 'any'=>['Computer','Computing'], 'uni'=>'apu', 'sources'=>true],
            ['q'=>'How much will it cost for one year?', 'must'=>['first-year','annual'], 'uni'=>'apu'],
            ['q'=>'Then what is the published total tuition fee?', 'must'=>['APU','RM'], 'uni'=>'apu', 'sources'=>true],
            ['q'=>'Is that amount for international students?', 'any'=>['international','student','published'], 'uni'=>'apu'],
            ['q'=>"What is APU's QS World ranking?", 'must'=>['#=528','2027'], 'avoid'=>['#597'], 'uni'=>'apu', 'sources'=>true],
            ['q'=>'What about the Asia ranking?', 'must'=>['#147','2026'], 'avoid'=>['#=528'], 'uni'=>'apu', 'sources'=>true],
            ['q'=>'Compare APU and MMU in the QS World ranking.', 'must'=>['#=528','771–780','APU has the higher'], 'sources'=>true],
            ['q'=>"Does MMU have a bachelor's in computer science?", 'must'=>['MMU','Bachelor','Computer'], 'uni'=>'mmu', 'sources'=>true],
            ['q'=>'How much is its first-year fee?', 'must'=>['MMU','RM'], 'uni'=>'mmu', 'sources'=>true],
            ['q'=>'Across all universities, my budget is RM40,000 per year. Show matching IT bachelor options.', 'any'=>['matching','Bachelor','Information Technology','Computer'], 'avoid'=>['APU is ranked'], 'sources'=>true],
            ['q'=>'Which of those is the cheapest?', 'any'=>['university','option','choose','cannot','budget'], 'avoid'=>['guaranteed cheapest']],
            ['q'=>'I do not have IELTS. Can I still apply?', 'must'=>['IELTS','EMGS'], 'avoid'=>['guaranteed','definitely'], 'sources'=>true],
            ['q'=>'What documents do I need for a new student pass?', 'must'=>['passport','offer letter','English','18 months'], 'sources'=>true],
            ['q'=>'I am Bangladeshi. Do I need an SEV?', 'must'=>['Bangladesh','SEV','eVAL'], 'avoid'=>['prepare a recent white-background photo'], 'sources'=>true],
            ['q'=>'How long must my passport be valid?', 'must'=>['18 months','new Student Pass'], 'sources'=>true],
            ['q'=>'Which passport pages should I upload?', 'must'=>['bio-data','visa','observation'], 'avoid'=>['Bangladesh**: submit **all pages'], 'sources'=>true],
            ['q'=>'Can I work part-time during classes?', 'must'=>['20 hours','semester breaks','Immigration approval'], 'avoid'=>['during classes you can'], 'sources'=>true],
            ['q'=>'My EMGS tracker shows 32%. What does that mean?', 'must'=>['32%','Immigration','not final visa approval'], 'sources'=>true],
            ['q'=>'Can you check my live EMGS status?', 'must'=>['cannot access','official EMGS application tracker'], 'avoid'=>['your application is'], 'sources'=>true],
        ],
    ],
    [
        'id' => 'student-b',
        'name' => 'Student B — Nusrat (fictional)',
        'profile' => 'Bangladesh BBA graduate, CGPA 3.1 and IELTS 6.0; wants an MBA; compares SEGi and CityU; three-year study gap; married; mostly asks in Banglish/Bangla.',
        'turns' => [
            ['q'=>'Ami Bangladesh e BBA complete korechi, ekhon Malaysia te MBA korte chai.', 'must'=>['MBA'], 'any'=>['বিশ্ববিদ্যালয়','প্রোগ্রাম','CGPA'], 'language'=>'bn', 'levels'=>['master'], 'subjects'=>['businessadministration'], 'avoid'=>['could not match'], 'statuses'=>['answered']],
            ['q'=>'SEGi MBA fees koto?', 'must'=>['SEGi','RM54,350'], 'uni'=>'segi', 'language'=>'bn', 'sources'=>true],
            ['q'=>'Is that the full-course total?', 'must'=>['RM54,350'], 'any'=>['Total Fee','মোট ফি'], 'uni'=>'segi'],
            ['q'=>'How much for the first year?', 'must'=>['RM51,200'], 'avoid'=>['RM54,350'], 'uni'=>'segi'],
            ['q'=>'What about year 2?', 'must'=>['Year 2 fees are not recorded'], 'avoid'=>['RM51,200'], 'uni'=>'segi'],
            ['q'=>'CITYU te MBA total fee koto?', 'must'=>['City','RM35,523'], 'uni'=>'cityu', 'language'=>'bn', 'sources'=>true],
            ['q'=>'Compare SEGi and CityU MBA fees.', 'must'=>['SEGi','City','RM54,350','RM35,523'], 'sources'=>true],
            ['q'=>'Which one is cheaper based on the published totals?', 'any'=>['City','35,523','lower','cheaper'], 'avoid'=>['guaranteed'], 'sources'=>true],
            ['q'=>'Compare their QS World rankings.', 'must'=>['SEGi','City','701–710','no institution entry'], 'sources'=>true],
            ['q'=>'SEGi Asia ranking koto?', 'must'=>['#350','2026'], 'uni'=>'segi', 'language'=>'bn', 'sources'=>true],
            ['q'=>'Does a three-year study gap reduce my visa chance?', 'must'=>['study gap','guarantee'], 'avoid'=>['% success'], 'sources'=>true],
            ['q'=>'I have IELTS 6.0 and CGPA 3.1. Am I guaranteed admission?', 'must'=>['cannot confirm','university','program'], 'avoid'=>['guaranteed admission']],
            ['q'=>'MBA scholarship ache?', 'must'=>['scholarship'], 'any'=>['fully funded','যাচাই'], 'language'=>'bn', 'avoid'=>['you are guaranteed'], 'sources'=>true],
            ['q'=>'What is the application or registration fee?', 'must'=>['application','registration','university','program'], 'avoid'=>['the fee is a single admission fee'], 'sources'=>true],
            ['q'=>'Kuala Lumpur e monthly living cost koto?', 'must'=>['RM1,500','RM2,500','Kuala Lumpur'], 'any'=>['not a verified','নিশ্চিত quote নয়'], 'language'=>'bn', 'sources'=>true],
            ['q'=>'I am married. Can my husband come as a dependent?', 'must'=>['Dependent','Student Pass','international office'], 'avoid'=>['definitely'], 'sources'=>true],
            ['q'=>'What documents would he need?', 'any'=>['passport','pass','insurance','exact program','international office'], 'avoid'=>['guaranteed dependent']],
            ['q'=>'For our new Student Pass, is 12 months passport validity enough?', 'must'=>['18 months'], 'avoid'=>['12 months is enough'], 'sources'=>true],
            ['q'=>'Bangladeshi student der personal bond koto?', 'must'=>['Bangladesh','RM750'], 'language'=>'bn', 'sources'=>true],
            ['q'=>'Can I speak to a counselor?', 'must'=>['wa.me/601119359497'], 'avoid'=>['cannot'], 'statuses'=>['answered']],
        ],
    ],
    [
        'id' => 'student-c',
        'name' => 'Student C — Arif (fictional)',
        'profile' => 'Diploma in IT, CGPA 2.8, completed in 2021; wants bachelor credit transfer to APU or UCSI; four-year gap; no current English test.',
        'turns' => [
            ['q'=>'I completed a Diploma in IT in 2021 with CGPA 2.8 and have a four-year gap.', 'any'=>['academic','qualification','gap','program'], 'avoid'=>['admission confirmed']],
            ['q'=>'Can I enter an APU computer science degree with credit transfer?', 'any'=>['APU','credit','transfer','institution'], 'uni'=>'apu', 'avoid'=>['guarantee transfer']],
            ['q'=>'Is credit transfer guaranteed?', 'must'=>['not','guarantee'], 'avoid'=>['is guaranteed']],
            ['q'=>'Which APU bachelor computing programs are in your data?', 'must'=>['APU','Bachelor'], 'any'=>['Computer','Computing','Information Technology'], 'uni'=>'apu', 'sources'=>true],
            ['q'=>'What is the published total fee for the IT degree?', 'must'=>['APU','RM'], 'uni'=>'apu', 'sources'=>true],
            ['q'=>'Do you have a first-year breakdown?', 'must'=>['first-year','not recorded'], 'uni'=>'apu'],
            ['q'=>'What about UCSI?', 'must'=>['UCSI'], 'uni'=>'ucsi'],
            ['q'=>'Show UCSI bachelor computing programs.', 'must'=>['UCSI','Bachelor'], 'any'=>['Computer','Information Technology'], 'uni'=>'ucsi', 'sources'=>true],
            ['q'=>'How much are their published fees?', 'must'=>['UCSI','RM'], 'uni'=>'ucsi', 'sources'=>true],
            ['q'=>'Compare APU and UCSI overall QS World ranking.', 'must'=>['#=528','#282','UCSI University','has the higher position'], 'sources'=>true],
            ['q'=>'Which has the higher rank?', 'must'=>['UCSI University','has the higher position'], 'sources'=>true],
            ['q'=>'Is either one ranked for IT specifically?', 'must'=>['subject','overall'], 'avoid'=>['IT is ranked #'], 'statuses'=>['partial']],
            ['q'=>'Can I apply without IELTS if my diploma was in English?', 'must'=>['IELTS','EMGS','institution'], 'avoid'=>['automatic exemption'], 'sources'=>true],
            ['q'=>'Will my four-year gap cause visa rejection?', 'must'=>['gap','guarantee'], 'avoid'=>['will be rejected'], 'sources'=>true],
            ['q'=>'What visa success percentage do Bangladeshi students get?', 'must'=>['does not provide','percentage','guarantee visa approval'], 'avoid'=>['95%','status wording alongside'], 'sources'=>true],
            ['q'=>'What photo size does EMGS need?', 'must'=>['35 mm','45 mm'], 'sources'=>true],
            ['q'=>'Does Bangladesh require a yellow-fever certificate?', 'must'=>['conditional','travel-history'], 'avoid'=>['every Bangladeshi'], 'sources'=>true],
            ['q'=>'Do I have to upload every passport page?', 'must'=>['Blank pages','unnecessary'], 'avoid'=>['Bangladesh must submit all'], 'sources'=>true],
            ['q'=>'When must I do the medical screening after arrival?', 'must'=>['7 working days','arrival'], 'sources'=>true],
            ['q'=>'If my visa is rejected, which EMGS fees can be refunded?', 'must'=>['refund','processing'], 'avoid'=>['fully refundable'], 'sources'=>true],
        ],
    ],
    [
        'id' => 'student-d',
        'name' => 'Student D — Jannat (fictional)',
        'profile' => 'Bangladesh HSC Commerce; wants a hospitality bachelor; budget RM30,000/year; compares CityU and Taylor’s; communicates mostly in Bangla/Banglish.',
        'turns' => [
            ['q'=>'malaysia te best university kunta? amar HSC commerce.', 'must'=>['BBA'], 'language'=>'bn', 'statuses'=>['clarification','partial']],
            ['q'=>'Ami hospitality bachelor porte chai.', 'any'=>['Hospitality','বিশ্ববিদ্যালয়','option'], 'language'=>'bn', 'sources'=>true],
            ['q'=>'Budget RM30000 per year.', 'any'=>['RM30,000','matching','budget','program'], 'language'=>'bn', 'statuses'=>['answered'], 'sources'=>true],
            ['q'=>'CITYU BoHM fees koto?', 'must'=>['City','Hospitality','RM'], 'uni'=>'cityu', 'language'=>'bn', 'sources'=>true],
            ['q'=>'ওটার প্রথম বছরের খরচ কত?', 'must'=>['RM23,190'], 'uni'=>'cityu', 'language'=>'bn'],
            ['q'=>'দ্বিতীয় বছরের ফি কত?', 'must'=>['RM17,278'], 'avoid'=>['RM23,190'], 'uni'=>'cityu', 'language'=>'bn'],
            ['q'=>'তৃতীয় বছরে কত?', 'any'=>['তৃতীয়','Year 3','recorded','RM'], 'uni'=>'cityu', 'language'=>'bn'],
            ['q'=>'মোট ফি কত?', 'must'=>['RM'], 'uni'=>'cityu', 'language'=>'bn', 'sources'=>true],
            ['q'=>"Taylor's hospitality bachelor fee koto?", 'must'=>["Taylor's",'catalog'], 'uni'=>'taylors', 'language'=>'bn', 'statuses'=>['not_found']],
            ['q'=>"Compare CityU and Taylor's hospitality cost.", 'must'=>['City',"Taylor's",'RM'], 'sources'=>true],
            ['q'=>'Which is cheaper for me?', 'any'=>['City',"Taylor's",'compare','published'], 'avoid'=>['guaranteed cheapest']],
            ['q'=>'CityU er QS Asia ranking koto?', 'must'=>['#=558','2026'], 'uni'=>'cityu', 'language'=>'bn', 'sources'=>true],
            ['q'=>"Taylor's er Asia rank?", 'must'=>['#27','2026'], 'uni'=>'taylors', 'language'=>'bn', 'sources'=>true],
            ['q'=>'Ranking diye ki hospitality program best bola jabe?', 'must'=>['subject','QS ranking'], 'language'=>'bn', 'avoid'=>['best hospitality program'], 'statuses'=>['partial']],
            ['q'=>'কম খরচের scholarship ache?', 'must'=>['scholarship'], 'language'=>'bn', 'avoid'=>['guaranteed'], 'sources'=>true],
            ['q'=>'Part-time job kore tuition pay korte parbo?', 'must'=>['semester break'], 'any'=>['20 hours','২০ ঘণ্টা'], 'language'=>'bn', 'avoid'=>['pay all tuition'], 'sources'=>true],
            ['q'=>'Student ra weekly koto hours kaj korte pare?', 'must'=>['semester break'], 'any'=>['20 hours','২০ ঘণ্টা'], 'language'=>'bn', 'sources'=>true],
            ['q'=>'Hostel and living cost per month koto?', 'must'=>['RM1,500','RM2,500'], 'language'=>'bn', 'sources'=>true],
            ['q'=>'IELTS chara admission hobe?', 'must'=>['IELTS','EMGS'], 'language'=>'bn', 'avoid'=>['admission confirmed'], 'sources'=>true],
            ['q'=>'Apply korte counselor er sathe kotha bolbo.', 'must'=>['wa.me/601119359497'], 'language'=>'bn', 'statuses'=>['answered']],
        ],
    ],
    [
        'id' => 'student-e',
        'name' => 'Student E — Shakib (fictional)',
        'profile' => 'Bangladesh BSc Civil Engineering, CGPA 3.2, IELTS 6.5, graduated five years ago; wants a research master’s at UTM or UPM; plans to bring spouse.',
        'turns' => [
            ['q'=>'I have a BSc in Civil Engineering, CGPA 3.2, graduated five years ago.', 'any'=>['qualification','program','gap','academic'], 'avoid'=>['eligible for admission']],
            ['q'=>'I want a research master’s in Malaysia. Does UTM have civil engineering?', 'must'=>['UTM','Master'], 'any'=>['Civil','Engineering','research'], 'uni'=>'utm', 'sources'=>true],
            ['q'=>'What UTM master’s programs match engineering?', 'must'=>['UTM','Master'], 'any'=>['Engineering','Civil'], 'uni'=>'utm', 'sources'=>true],
            ['q'=>'What are the fees?', 'must'=>['UTM'], 'any'=>['no monetary','not recorded','RM'], 'uni'=>'utm'],
            ['q'=>'Are those amounts actually recorded?', 'any'=>['not recorded','no monetary','published','cannot'], 'avoid'=>['estimated total'], 'uni'=>'utm'],
            ['q'=>'What about UPM engineering master’s programs?', 'must'=>['UPM','Master'], 'any'=>['Engineering','program'], 'uni'=>'upm', 'sources'=>true],
            ['q'=>'Show the published UPM fees.', 'must'=>['UPM'], 'any'=>['RM','fee'], 'uni'=>'upm', 'sources'=>true],
            ['q'=>'Compare UTM and UPM QS World rankings.', 'must'=>['#=158','#138','UPM has the higher'], 'sources'=>true],
            ['q'=>'Which is higher in Malaysia?', 'must'=>['UPM has the higher','Malaysia'], 'sources'=>true],
            ['q'=>'Do these overall ranks prove the civil engineering program is better?', 'must'=>['overall','subject'], 'avoid'=>['prove'], 'statuses'=>['partial']],
            ['q'=>'Can you confirm admission with CGPA 3.2 and IELTS 6.5?', 'must'=>['cannot confirm','program','university'], 'avoid'=>['admission confirmed']],
            ['q'=>'Will my five-year gap cause a visa problem?', 'must'=>['gap','guarantee'], 'avoid'=>['visa rejected'], 'sources'=>true],
            ['q'=>'I will bring my wife. Can she get a dependent pass?', 'must'=>['dependent','Student Pass','international office'], 'avoid'=>['definitely'], 'sources'=>true],
            ['q'=>'What dependent documents are required?', 'any'=>['passport','pass','insurance','international office'], 'avoid'=>['guaranteed'], 'sources'=>true],
            ['q'=>'What does 70% EMGS status mean?', 'must'=>['70%'], 'any'=>['tracker','Immigration','approval','status'], 'avoid'=>['final approval'], 'sources'=>true],
            ['q'=>'The tracker says pending additional documents. Am I rejected?', 'must'=>['additional documents'], 'avoid'=>['you are rejected','automatic rejection'], 'sources'=>true],
            ['q'=>'When is medical screening done?', 'must'=>['7 working days','arrival'], 'sources'=>true],
            ['q'=>'Do I need local health insurance?', 'any'=>['insurance','Student Pass','institution','EMGS'], 'avoid'=>['not required'], 'sources'=>true],
            ['q'=>'Can a Bangladeshi master’s graduate get the Graduate Pass?', 'must'=>['Bangladesh','not on','eligible'], 'avoid'=>['Bangladesh is eligible'], 'sources'=>true],
            ['q'=>'Can I work full-time on that pass?', 'must'=>['part-time','not','full-time'], 'avoid'=>['permits unrestricted full-time'], 'sources'=>true],
        ],
    ],
];

$root = dirname(__DIR__);
$bot = new Counselor(new KnowledgeBase($root));
$allowedStatuses = ['answered','clarification','partial','not_found'];
$allResults = [];
$totalChecks = 0;
$failedChecks = 0;
$statusCounts = [];
$markdown = "# Five fictional Bangladeshi student chatbot simulation\n\n";
$markdown .= "Generated: " . date('Y-m-d H:i:s T') . "  \n";
$markdown .= "Five isolated conversations; each student has 20 sequential turns. The real local PHP chatbot receives only the current question and its returned compact context. Names and profiles are fictional.\n\n";

foreach ($students as $student) {
    $context = [];
    $studentPass = 0;
    $maxContextBytes = 0;
    $markdown .= "## {$student['name']}\n\n**Profile:** {$student['profile']}\n\n";
    $turnResults = [];
    foreach ($student['turns'] as $index => $turn) {
        $number = $index + 1;
        $response = $bot->answer($turn['q'], $context);
        $context = $response['context'];
        $contextBytes = strlen(json_encode($context, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE));
        $maxContextBytes = max($maxContextBytes, $contextBytes);
        $statusCounts[$response['status']] = ($statusCounts[$response['status']] ?? 0) + 1;
        $failures = [];
        $checks = 0;
        $check = static function (bool $ok, string $label) use (&$checks, &$totalChecks, &$failedChecks, &$failures): void {
            $checks++; $totalChecks++;
            if (!$ok) { $failedChecks++; $failures[] = $label; }
        };
        $reply = $response['reply'] ?? '';
        $check(is_string($reply) && trim($reply) !== '', 'empty reply');
        $check(in_array($response['status'] ?? '', $allowedStatuses, true), 'invalid status');
        $check($contextBytes <= 4096, "context exceeds 4 KiB ($contextBytes bytes)");
        $check(!array_intersect(['history','transcript','message','reply'], array_keys($context)), 'context contains transcript/answer data');
        $check(($response['engine'] ?? '') === 'local-retrieval-v3', 'wrong response engine');
        foreach ($turn['must'] ?? [] as $fragment) $check(stripos($reply, $fragment) !== false, "missing: $fragment");
        if (!empty($turn['any'])) {
            $found = false;
            foreach ($turn['any'] as $fragment) if (stripos($reply, $fragment) !== false) { $found = true; break; }
            $check($found, 'missing all alternatives: ' . implode(' / ', $turn['any']));
        }
        foreach ($turn['avoid'] ?? [] as $fragment) $check(stripos($reply, $fragment) === false, "unsafe/unwanted: $fragment");
        if (!empty($turn['statuses'])) $check(in_array($response['status'], $turn['statuses'], true), 'expected status ' . implode('/', $turn['statuses']) . ', got ' . $response['status']);
        if (isset($turn['uni'])) $check(($context['universities'] ?? []) === [$turn['uni']], 'expected university context ' . $turn['uni']);
        if (isset($turn['levels'])) $check(($context['levels'] ?? []) === $turn['levels'], 'unexpected study-level context');
        if (isset($turn['subjects'])) $check(($context['subjects'] ?? []) === $turn['subjects'], 'unexpected subject context');
        if (isset($turn['language'])) $check(($context['language'] ?? '') === $turn['language'], 'expected language ' . $turn['language']);
        if (!empty($turn['sources'])) $check(!empty($response['sources']), 'expected at least one source');
        foreach ($response['sources'] ?? [] as $source) {
            $check(is_string($source['title'] ?? null) && trim($source['title']) !== '', 'source has no title');
            if (isset($source['url'])) {
                $url = $source['url'];
                $safeUrl = is_string($url) && $url !== '' && !preg_match('/[\x00-\x1F\x7F<>"`\\\\]/u', $url);
                if ($safeUrl && preg_match('#^https?://#i', $url)) {
                    $parts = parse_url($url);
                    $safeUrl = is_array($parts) && in_array(strtolower($parts['scheme'] ?? ''), ['http','https'], true) && !empty($parts['host']);
                } elseif ($safeUrl) {
                    $safeUrl = (bool)preg_match('#^(?!/)(?!.*(?:^|/)\.\.(?:/|$))[A-Za-z0-9_./-]+(?:\#[A-Za-z0-9_-]+)?$#', $url);
                }
                $check($safeUrl, 'unsafe source URL');
            }
            if (isset($source['file'])) foreach (preg_split('/\s+\/\s+/', $source['file']) as $sourceFile) {
                $check(is_file($root . '/' . $sourceFile), 'source file does not exist: ' . $sourceFile);
            }
        }
        if (!$failures) $studentPass++;
        $sourceTitles = array_values(array_unique(array_map(static function ($s) { return $s['title'] ?? $s['file'] ?? 'Source'; }, $response['sources'] ?? [])));
        $markdown .= "### {$number}. " . str_replace("\n", ' ', $turn['q']) . "\n\n";
        $markdown .= "**Result:** " . ($failures ? 'NEEDS REVIEW — ' . implode('; ', $failures) : 'PASS') . "  \n";
        $markdown .= "**Status:** {$response['status']} · **Context:** {$contextBytes} bytes" . ($sourceTitles ? ' · **Sources:** ' . implode('; ', $sourceTitles) : '') . "\n\n";
        $markdown .= $reply . "\n\n";
        $turnResults[] = ['turn'=>$number, 'question'=>$turn['q'], 'result'=>$failures ? 'needs_review' : 'pass', 'failures'=>$failures,
            'context_bytes'=>$contextBytes] + $response;
    }
    $markdown .= "**Student result:** {$studentPass}/20 turns passed the automated semantic checks. Maximum compact context: {$maxContextBytes} bytes.\n\n";
    $allResults[] = ['id'=>$student['id'], 'name'=>$student['name'], 'profile'=>$student['profile'], 'passed_turns'=>$studentPass,
        'max_context_bytes'=>$maxContextBytes, 'turns'=>$turnResults];
}

$passedTurns = 0;
foreach ($allResults as $student) $passedTurns += $student['passed_turns'];
$summary = ['students'=>count($students), 'turns'=>count($students) * 20, 'passed_turns'=>$passedTurns,
    'needs_review_turns'=>count($students) * 20 - $passedTurns, 'checks'=>$totalChecks, 'failed_checks'=>$failedChecks,
    'statuses'=>$statusCounts, 'generated_at'=>date(DATE_ATOM)];
$markdown = "# Summary\n\n" .
    "- Students: **{$summary['students']}**\n- Contextual turns: **{$summary['turns']}**\n- Turns passing semantic checks: **{$summary['passed_turns']}**\n" .
    "- Turns needing review: **{$summary['needs_review_turns']}**\n- Assertions: **{$summary['checks']}**; failed: **{$summary['failed_checks']}**\n" .
    "- Response statuses: **" . implode('**, **', array_map(static function ($k,$v) { return "$k $v"; }, array_keys($statusCounts), $statusCounts)) . "**\n\n" .
    "A PASS means the response met the turn-specific safety/fact/context assertions. It is not a general accuracy percentage and does not replace review of source data or real-user evaluation.\n\n" . $markdown;

file_put_contents(__DIR__ . '/CHATBOT_5_STUDENTS_SIMULATION.md', $markdown);
file_put_contents(__DIR__ . '/chatbot_5_students_simulation.json', json_encode(['summary'=>$summary,'students'=>$allResults], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo json_encode($summary, JSON_UNESCAPED_SLASHES) . "\n";
foreach ($allResults as $student) echo $student['name'] . ': ' . $student['passed_turns'] . "/20, max context " . $student['max_context_bytes'] . " bytes\n";
exit($failedChecks ? 1 : 0);
