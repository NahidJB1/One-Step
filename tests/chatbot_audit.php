<?php
// Read-only content audit. Redirect stdout to a JSON report if desired.
require __DIR__ . '/../api/chatbot/bootstrap.php';
use OneStep\Chat\KnowledgeBase;
use OneStep\Chat\Text;
$kb = new KnowledgeBase(dirname(__DIR__));
$questions = [];
$assurances = [];
$datesMissing = 0;
foreach ($kb->faqs as $faq) {
    foreach ($faq['variants'] as $variant) $questions[Text::normalize($variant)][] = $faq['id'];
    if (preg_match('/you are cleared|far exceeds|guarantee[ds]?|100% (?:visa|approval)|will (?:be deported|fail|pass)|must be|strictly require/i', $faq['a'])) {
        $assurances[] = ['id'=>$faq['id'], 'question'=>$faq['q'], 'reason'=>'Review categorical claims, conditions, and effective date.'];
    }
}
$collisions = [];
foreach ($questions as $question => $ids) {
    $ids = array_unique($ids);
    $answers = [];
    foreach ($ids as $id) $answers[Text::normalize($kb->faqs[$id]['a'])] = true;
    if (count($answers) > 1) $collisions[] = ['question'=>$question, 'faq_ids'=>array_values($ids)];
}
$ambiguousLevels = [];
$uncertainFeeBasis = 0;
foreach ($kb->records as $r) {
    if (!$r['levels']) $ambiguousLevels[] = ['name'=>$r['name'], 'source'=>$r['source']];
    if ($r['source']['type'] === 'fees' && !$r['section'] && !array_filter(array_keys($r['fields']), static function ($h) { return preg_match('/total|per year|per sem/i', $h); })) $uncertainFeeBasis++;
}
echo json_encode([
    'knowledge_version'=>$kb->version, 'faq_count'=>count($kb->faqs), 'program_and_fee_records'=>count($kb->records),
    'note'=>'This is a structural audit, not verification of facts. Review original documents before changing answers. No data was modified.',
    'conflicting_question_variants'=>$collisions, 'categorical_claims_to_review'=>$assurances,
    'records_without_a_reliable_study_level'=>$ambiguousLevels, 'fee_rows_without_an_explicit_total_or_period_label'=>$uncertainFeeBasis,
    'effective_dates'=>'The engine does not treat any current source as having a verified effective date.'
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE), "\n";
