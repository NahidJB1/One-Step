<?php
declare(strict_types=1);
$root = dirname(__DIR__);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if ($path === '/' || $path === '/index' || $path === '/index.html') {
    require $root . '/includes/agent-home.php';
    return true;
}
if (preg_match('~(?:^|/)\.(?!well-known(?:/|$))|^/(?:db|node_modules|docs|tests|scripts|includes)(?:/|$)~', $path)) {
    http_response_code(403); return true;
}
$file = realpath($root . $path);
if ($file === false && !pathinfo($path, PATHINFO_EXTENSION)) $file = realpath($root . $path . '.html');
if ($path === '/apply') $file = realpath($root . '/apply.php');
if (!$file || !str_starts_with($file, $root . DIRECTORY_SEPARATOR) || !is_file($file)) {
    http_response_code(404); readfile($root . '/404.html'); return true;
}
if (pathinfo($file, PATHINFO_EXTENSION) === 'php') { require $file; return true; }
$types = ['html'=>'text/html','md'=>'text/markdown','txt'=>'text/plain','json'=>'application/json','js'=>'text/javascript','css'=>'text/css','svg'=>'image/svg+xml','png'=>'image/png','jpg'=>'image/jpeg','jpeg'=>'image/jpeg','webp'=>'image/webp','ico'=>'image/x-icon','pdf'=>'application/pdf','woff2'=>'font/woff2','xml'=>'application/xml'];
header('Content-Type: ' . ($types[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? 'application/octet-stream'));
if ($path === '/.well-known/mcp/server-card.json') header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') readfile($file);
return true;
