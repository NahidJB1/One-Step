<?php
// Replays the user's report with explicit story boundaries; never contacts a network service.
require __DIR__ . '/../api/chatbot/bootstrap.php';
set_error_handler(static function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});
$root = dirname(__DIR__);
$questions = json_decode(preg_replace('/^\s*const testQuestions\s*=\s*|;\s*$/', '', file_get_contents($root . '/bot_test_questions.js')), true, 512, JSON_THROW_ON_ERROR);
$stories = [];
foreach ($questions as $q) $stories[$q['q']] = $q['story'] ?? null;
preg_match_all('/^Q(\d+): (.+)$/m', file_get_contents(__DIR__ . '/CHATBOT_TEST_RESULTS-astra.txt'), $lines, PREG_SET_ORDER);
$bot = new OneStep\Chat\Counselor(new OneStep\Chat\KnowledgeBase($root));
$state = []; $lastStory = null; $results = []; $stats = []; $started = microtime(true);
$report = "UPDATED CHATBOT REPLAY\nIndependent questions reset context; numbered stories retain compact context.\nStatus is routing metadata, not a claim of factual correctness.\n\n";
foreach ($lines as $line) {
    $q = trim($line[2]); $story = $stories[$q] ?? null;
    if ($story === null || $story !== $lastStory) $state = [];
    $lastStory = $story;
    $r = $bot->answer($q, $state); $state = $r['context'];
    $stats[$r['status']] = ($stats[$r['status']] ?? 0) + 1;
    $results[] = ['number'=>(int)$line[1], 'question'=>$q, 'story'=>$story] + $r;
    $report .= "Q" . $line[1] . ': ' . $q . "\nStatus: " . $r['status'] . "\nA" . $line[1] . ': ' . $r['reply'] . "\n\n-------------------------------------------------\n\n";
    echo $line[1] . ' [' . $r['status'] . '] ' . $q . "\n  " . substr(str_replace("\n", ' ', $r['reply']), 0, 280) . "\n";
}
file_put_contents(__DIR__ . '/CHATBOT_TEST_RESULTS-astra-updated.txt', $report);
file_put_contents(__DIR__ . '/chatbot_astra_replay.json', json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo json_encode($stats) . sprintf(" %.2fs; peak %.1f MiB\n", microtime(true)-$started, memory_get_peak_usage(true)/1048576);
