<?php
// Local diagnostic: php tests/chatbot_probe.php "APU master fees" "What about SEGi?"
require __DIR__ . '/../api/chatbot/bootstrap.php';
set_error_handler(static function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});
$bot = new OneStep\Chat\Counselor(new OneStep\Chat\KnowledgeBase(dirname(__DIR__)));
$state = [];
foreach (array_slice($argv, 1) as $question) {
    $r = $bot->answer($question, $state);
    $state = $r['context'];
    echo json_encode(['q'=>$question] + $r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n";
}
