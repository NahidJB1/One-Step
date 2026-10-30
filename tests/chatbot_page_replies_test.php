<?php
require __DIR__ . '/../api/chatbot/bootstrap.php';
use OneStep\Chat\{KnowledgeBase, Counselor};
$kb = new KnowledgeBase(dirname(__DIR__));
$bot = new Counselor($kb);
$checks = 0;
function checkReply($ok, $label) { global $checks; if (!$ok) throw new RuntimeException($label); $checks++; }
function links($r) { return array_column($r['buttons'], 'url'); }
$r = $bot->answer('How do I apply to APU?');
checkReply($r['status'] === 'answered' && in_array('apply?university=apu', links($r)), 'Application route');
checkReply(strpos($r['reply'], 'passport number is optional') !== false && strpos($r['reply'], 'does not confirm admission') !== false, 'Form and admission wording');
$r = $bot->answer('How do I apply?');
checkReply($r['status'] === 'clarification', 'Ask for missing university');
$r = $bot->answer('APU', $r['context']);
checkReply(in_array('apply?university=apu', links($r)), 'Application follow-up');
$course = 'APU Foundation Programme (Engineering Pathway)';
$r = $bot->answer('Apply for ' . $course . ' at APU');
checkReply((bool)array_filter(links($r), static function ($url) use ($course) { return strpos($url, 'course=' . rawurlencode($course)) !== false; }), 'Known course preselection');
foreach ($kb->accommodation as $id => $data) {
    $r = $bot->answer($kb->universities[$id]['name'] . ' accommodation');
    checkReply($r['status'] === 'answered', "$id accommodation status");
    foreach ($data['properties'] as $property) foreach ($property['rent'] as $rent) checkReply(strpos($r['reply'], $rent) !== false, "$id preserves rent");
    checkReply(in_array("Universities/$id-university#accommodation", links($r)), "$id accommodation link");
    checkReply(strpos($r['reply'], ($data['rentPeriod'] ?? '') === 'month' ? 'monthly' : 'rental period is not specified') !== false, "$id rental period");
}
$r = $bot->answer('INTI accommodation');
$r = $bot->answer('What about MMU?', $r['context']);
checkReply(($r['context']['universities'] ?? []) === ['mmu'] && strpos($r['reply'], 'Eclipse') !== false, 'Accommodation follow-up changes university');
$r = $bot->answer('Genovasi accommodation');
checkReply($r['status'] === 'partial' && strpos($r['reply'], 'not published') !== false && !in_array('Universities/genovasi-university#accommodation', links($r)), 'No invented accommodation');
$r = $bot->answer('INTI fees and accommodation');
checkReply(strpos($r['reply'], '**Fees**') !== false && strpos($r['reply'], '**Accommodation') !== false, 'Combined answer includes both topics');
checkReply(in_array('Universities/inti-university#courses-fees', links($r)) && in_array('Universities/inti-university#accommodation', links($r)), 'Combined topical links');
$r = $bot->answer('Bachelor', $r['context']);
checkReply(($r['context']['intent'] ?? '') === 'fees' && ($r['context']['universities'] ?? []) === ['inti'], 'Combined answer keeps fee clarification context');
$r = $bot->answer('Read about INTI campus life');
checkReply(in_array('Universities/inti-university#articles', links($r)), 'Article link');
$r = $bot->answer('ALFA courses');
checkReply(in_array('Universities/alfa-university#courses', links($r)), 'Courses link');
$r = $bot->answer('APU QS World ranking');
checkReply(in_array('Universities/apu-university#rankings', links($r)), 'Ranking link');
$r = $bot->answer('INTI accommodation and QS World ranking');
checkReply(strpos($r['reply'], '**Accommodation') !== false && strpos($r['reply'], '**Rankings**') !== false, 'Accommodation and ranking both answered');
$r = $bot->answer('Can Indian students apply for the Graduate Pass?');
checkReply(!in_array('application', [$r['context']['intent'] ?? '']) && strpos($r['reply'], '31 December 2026') !== false, 'Graduate Pass retains immigration guidance');
$r = $bot->answer('Can I apply to APU with IELTS 4.5?');
checkReply(($r['context']['intent'] ?? '') !== 'application' && strpos($r['reply'], 'score alone') !== false, 'Admission score does not become form advice');
$r = $bot->answer('MMU bachelor computer science first year fees');
checkReply(substr_count($r['reply'], '**Published conditions:**') === 1, 'Shared fee conditions appear once');
checkReply(strpos($r['reply'], 'SST') !== false && strpos($r['reply'], 'RM 25,750') !== false, 'Fee conditions and amounts retained');
$r = $bot->answer('MMU computer science first year fees');
checkReply($r['status'] === 'clarification' && ($r['context']['pending'] ?? '') === 'level', 'Mixed first-year study levels require clarification');
$r = $bot->answer('Bachelor', $r['context']);
checkReply(strpos($r['reply'], 'RM 25,750') !== false && ($r['context']['fee_period'] ?? '') === 'first_year', 'Clarified first-year request keeps fee period');
checkReply((bool)array_filter($kb->faqs, static function ($faq) { return $faq['source']['file'] === 'Universities/inti-university.html'; }), 'Published FAQ source imported');
echo "$checks page-reply checks passed.\n";
