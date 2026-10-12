<?php
// Behavioral tests: php tests/chatbot_rankings_test.php
require __DIR__ . '/../api/chatbot/bootstrap.php';
use OneStep\Chat\{KnowledgeBase, Counselor, Rankings};
set_error_handler(static function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});
$kb = new KnowledgeBase(dirname(__DIR__));
$bot = new Counselor($kb);
$rankings = new Rankings($kb->rankings, $kb);
$passed = 0; $failed = 0;
function expect($ok, string $label): void {
    global $passed, $failed;
    if ($ok) $passed++; else { $failed++; fwrite(STDERR, "FAIL: $label\n"); }
}
function ask(string $q, array $context = []): array { global $bot; return $bot->answer($q, $context); }
function has(array $r, string $s): bool { return stripos($r['reply'], $s) !== false; }
function uni(array $r, string $id): bool { return ($r['context']['universities'] ?? []) === [$id]; }

// Independent, reviewed facts: changes require a newly verified edition, not just a rebuild.
foreach ([['apu','world','=528'],['apu','asia','147'],['apu','malaysia','12'],
    ['upm','world','138'],['upm','asia','22'],['upm','malaysia','4'],
    ['segi','world','701-710'],['segi','malaysia','18-20'],['lincoln','asia','196'],
    ['cyberjaya','malaysia','24-25'],['unikl','malaysia','31-32'],['cityu','asia','=558'],
    ['help','asia','761-770'],['um','world','56'],['taylors','world','272']] as [$id,$scope,$value]) {
    expect(($rankings->metric($id,$scope)['rank'] ?? null) === $value, "$id $scope reviewed value");
}
expect(count($rankings->records()) === 30, 'All detail pages plus UM covered');
expect(count($kb->rankings['malaysia_basis']['institutions']) === 32, 'Complete Malaysia World 2027 population');
foreach ($rankings->records() as $id=>$record) {
    foreach (['world','asia','malaysia'] as $scope) {
        $metric = $rankings->metric($id,$scope);
        expect(in_array($metric['status'], ['ranked','not_listed','unverified','contributor'],true), "$id $scope status is explicit");
        if ($metric['status'] === 'ranked') expect(Rankings::bounds($metric['rank'])[0] !== PHP_INT_MAX && count($metric['sources']) > 0, "$id $scope has rank and evidence");
        foreach ($metric['sources'] as $source) expect(isset($kb->rankings['sources'][$source]), "$id $scope source resolves");
    }
}
foreach ($kb->rankings['sources'] as $source) expect(filter_var($source['url'], FILTER_VALIDATE_URL) && strpos($source['url'],'https://') === 0, 'Valid HTTPS source: ' . $source['title']);

foreach (['APU QS ranking','APU world rnk','A.P.U rankng','What is the world ranking of APU?','WHAT IS THE QS WORLD RANKING OF APU?'] as $q) {
    $r = ask($q);
    expect(uni($r,'apu') && has($r,'#=528') && has($r,'2027') && !has($r,'#597') && count($r['sources']) > 0, $q);
}
$r = ask('HELP ranking');
expect(uni($r,'help') && has($r,'761–770'), 'HELP acronym is recognized for ranking');
expect($kb->entities('I need a lot of help with fees') === [], 'Ordinary of help phrase is not an institution');
$r = ask('What is the QS Asia rank of CityU?');
expect(uni($r,'cityu') && has($r,'#=558') && !has($r,'World University Rankings'), 'Explicit Asia request has only that edition');
$r = ask('CityU world ranking');
expect(has($r,'no institution entry') && !has($r,'#=558'), 'Missing World entry is not its Asia position');
$r = ask('KLUST QS Asia ranking');
expect(has($r,'QS Contributor') && has($r,'no numerical rank') && !preg_match('/#=?\d/',$r['reply']), 'Contributor is not a rank');
$r = ask('BAC QS ranking');
expect(has($r,'no institution entry') && has($r,'not been verified') && !preg_match('/ranked #\d/',$r['reply']), 'BAC does not inherit partner ranks');
$r = ask('UOW Malaysia QS ranking');
expect(uni($r,'uow') && has($r,'#195') && has($r,'parent institution') && has($r,'no separate Malaysia position'), 'Australian parent scope is explicit');
$r = ask("What is the global ranking of UM compared to Taylor's?");
expect(has($r,'#56') && has($r,'#272') && has($r,'Universiti Malaya (UM) has the higher position'), 'World comparison uses the same edition');
$r = ask('Compare SEGi and Lincoln QS world ranking');
expect(has($r,'tie or overlap') && !has($r,'has the higher position'), 'Same rank band does not invent a winner');
$r = ask('Compare APU and UOW Malaysia QS ranking');
expect(!has($r,'has the higher position') && has($r,'parent institution'), 'No Malaysian campus comparison using Australian parent');

$r = ask('APU QS ranking');
$r = ask('Asia?', $r['context']);
expect(uni($r,'apu') && has($r,'#147') && !has($r,'#=528'), 'Scope follow-up retains university');
$r = ask('What about SEGi?', $r['context']);
expect(uni($r,'segi') && has($r,'#350') && !has($r,'#147'), 'New university retains scope');
$r = ask('Tell me about UTM', $r['context']);
expect(uni($r,'utm') && ($r['context']['intent'] ?? '') !== 'rankings', 'Explicit overview leaves ranking intent');
$r = ask('SEGi MBA fees');
$r = ask('What is its QS ranking?', $r['context']);
expect(uni($r,'segi') && has($r,'701–710') && ($r['context']['subjects'] ?? []) === ['businessadministration'], 'Ranking interlude preserves selected fee program');
$r = ask('How much would it cost for one year?', $r['context']);
expect(uni($r,'segi') && has($r,'51,200') && !has($r,'54,350'), 'Fee follow-up after rank uses actual first-year fee');
foreach (['APU ranking and MBA fees', 'APU MBA fees and QS ranking', 'QS ranking and MBA fees of APU'] as $q) {
    $r = ask($q);
    expect(has($r,'#=528') && has($r,'38,800') && count(array_unique(array_column($r['sources'],'type'))) > 1, 'Both ranking and fee clauses: ' . $q);
}
$apu = ask('APU ranking');
foreach (['Harvard QS ranking','City University Hong Kong ranking','Lincoln University New Zealand QS rank','Ritsumeikan APU ranking'] as $q) {
    $r = ask($q,$apu['context']);
    expect($r['status'] === 'clarification' && !has($r,'#=528') && !has($r,'#=558') && empty($r['context']['universities']), 'No stale or foreign institution rank: ' . $q);
}
foreach (['APU QS World ranking 2026','APU world ranking in 2028'] as $q) {
    $r = ask($q);
    expect($r['status'] === 'partial' && has($r,'not been verified') && !has($r,'#=528'), 'No substitution for missing edition: ' . $q);
}
$r = ask('APU QS World ranking 2026');
$r = ask('Latest?', $r['context']);
expect(has($r,'#=528') && empty($r['context']['ranking_year']), 'Latest resets unsupported historical edition');
foreach (['APU THE world ranking','APU Times Higher Education ranking','APU BBA QS ranking','APU IT ranking','APU MBA ranking','CityU BoHM ranking'] as $q) {
    $r = ask($q);
    expect($r['status'] === 'partial' && !has($r,'#=528') && !has($r,'#=558'), 'No overall QS substitution: ' . $q);
}
$r = ask('Does QS 5 stars mean ranking fifth?');
expect(has($r,'does not mean fifth') && !has($r,'#5'), 'Ratings are not league table ranks');
$r = ask('Top QS ranking universities in Malaysia', $apu['context']);
expect(has($r,'Universiti Malaya') && has($r,'#56') && has($r,'Top 10') && empty($r['context']['universities']), 'National table request leaves previous institution');
$r = ask('Top private universities in Malaysia QS ranking');
expect(has($r,'PETRONAS') && !has($r,'Universiti Malaya (UM)') && has($r,'private'), 'Private filter does not return public universities');

foreach ([['এপিইউ এর র‍্যাঙ্কিং কত?', 'apu', '#=528'], ['সিটি ইউনিভার্সিটি এশিয়ায় র‍্যাংকিং কত?', 'cityu', '#=558'],
    ['apu ranking koto', 'apu', '#=528'], ['malaysia te segi rank koto', 'segi', '#18–20'],
    ['এপিইউ বিশ্ব র‍্যাঙ্কিং ২০২৭', 'apu', '#=528']] as [$q,$id,$value]) {
    $r = ask($q);
    expect(uni($r,$id) && has($r,$value) && ($r['context']['language'] ?? '') === 'bn' && preg_match('/\p{Bengali}/u',$r['reply']), 'Bengali/Banglish: ' . $q);
}
$r = ask('APU world ranking', ['universities'=>['segi'],'ranking_year'=>'2027','ranking_scope'=>'evil','reply'=>'rank #1','rank'=>1]);
expect(has($r,'#=528') && !isset($r['context']['rank']) && !isset($r['context']['reply']), 'Client state cannot supply ranking facts');
$context = []; $max = 0;
foreach (range(0,499) as $i) {
    $r = ask(['APU rank','Asia?','What about SEGi?','Malaysia?'][$i%4],$context);
    $context = $r['context'];
    $max = max($max,strlen(json_encode(['message'=>'What about SEGi?','context'=>$context],JSON_UNESCAPED_UNICODE)));
}
expect($max < 1024, '500 ranking turns keep request below 1 KiB');
echo "$passed passed, $failed failed; 500-turn max ranking request $max bytes\n";
exit($failed ? 1 : 0);
