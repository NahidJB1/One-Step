<?php
require __DIR__ . '/../api/chatbot/bootstrap.php';
$root = dirname(__DIR__);
$kb = new OneStep\Chat\KnowledgeBase($root);
$checked = 0;
foreach (glob($root . '/Universities/*-university.html') as $file) {
    $id = basename($file, '-university.html');
    $page = 'Universities/' . $id . '-university';
    foreach (['details' => $page, 'fees' => $page . '#courses-fees'] as $kind => $expected) {
        if ($kb->page($id, $kind) !== $expected) throw new RuntimeException("Wrong $kind destination for $id");
        $checked++;
    }
}
if ($kb->page('city-university', 'fees') !== 'Universities/cityu-university#courses-fees') throw new RuntimeException('CityU alias failed');
foreach ($kb->records as $record) {
    $url = $record['source']['url'];
    if (strpos($url, 'Fees_Chart/') === 0 || strpos($url, '-details') !== false) throw new RuntimeException('Legacy source URL: ' . $url);
    if (!is_file($root . '/' . explode('#', $url)[0] . '.html')) throw new RuntimeException('Missing source page: ' . $url);
}
echo "Chatbot links passed: $checked destinations plus all program and fee sources.\n";
