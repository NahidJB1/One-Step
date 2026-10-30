<?php
require __DIR__ . '/../api/chatbot/bootstrap.php';
use OneStep\Chat\{KnowledgeBase, FaqIndex};
$root = dirname(__DIR__);
$file = $root . '/data/chatbot_index.json';
$fingerprint = KnowledgeBase::fingerprint($root);
if (in_array('--check', $argv, true)) {
    $data = is_file($file) ? json_decode(file_get_contents($file), true) : [];
    if (($data['fingerprint'] ?? '') !== $fingerprint || !(new KnowledgeBase($root))->cachedIndex) { fwrite(STDERR, "Chatbot index is missing, invalid or outdated.\n"); exit(1); }
    echo "Chatbot index is current.\n"; exit;
}
$kb = new KnowledgeBase($root, false);
$knowledge = [];
foreach (KnowledgeBase::snapshotFields() as $field) $knowledge[$field] = $kb->$field;
$data = ['fingerprint'=>$fingerprint,'knowledge'=>$knowledge,'index'=>(new FaqIndex($kb))->snapshot()];
$temp = $file . '.tmp';
if (file_put_contents($temp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR)) === false || !rename($temp, $file)) throw new RuntimeException('Could not write chatbot index');
echo 'Built chatbot index: ' . count($kb->faqs) . ' FAQs, ' . count($kb->records) . " records.\n";
