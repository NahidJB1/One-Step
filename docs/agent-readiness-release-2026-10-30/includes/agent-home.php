<?php
declare(strict_types=1);
// The homepage only. No session, database, user-agent sniffing or external calls.
header('Vary: Accept');
header('Link: </llms.txt>; rel="describedby"; type="text/plain", </index.md>; rel="alternate"; type="text/markdown"');
header('X-Content-Type-Options: nosniff');
$quality = ['text/html' => 0.0, 'text/markdown' => 0.0];
foreach (explode(',', $_SERVER['HTTP_ACCEPT'] ?? 'text/html') as $range) {
    $parts = array_map('trim', explode(';', strtolower($range)));
    if (!array_key_exists($parts[0], $quality)) continue;
    $q = 1.0;
    foreach (array_slice($parts, 1) as $parameter) {
        if (preg_match('/^q=([01](?:\.\d+)?)$/', $parameter, $match)) $q = min(1.0, (float)$match[1]);
    }
    $quality[$parts[0]] = $q;
}
$markdown = $quality['text/markdown'] > 0 && $quality['text/markdown'] >= $quality['text/html'];
header('Content-Type: ' . ($markdown ? 'text/markdown' : 'text/html') . '; charset=utf-8');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') readfile(dirname(__DIR__) . ($markdown ? '/index.md' : '/index.html'));
