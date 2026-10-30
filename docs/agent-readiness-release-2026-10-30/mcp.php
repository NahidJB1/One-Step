<?php
declare(strict_types=1);
// Stateless public resources only: fixed paths, no credentials or private data.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ['https://www.onestepmy.com', 'https://onestepmy.com'], true)) {
    http_response_code(403);
    echo '{"error":"Origin not allowed"}';
    exit;
}
if ($origin !== '') { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST'); http_response_code(405); echo '{"error":"Use POST"}'; exit;
}
function rpc_error($id, int $code, string $message): void {
    echo json_encode(['jsonrpc'=>'2.0','id'=>$id,'error'=>['code'=>$code,'message'=>$message]], JSON_UNESCAPED_SLASHES);
    exit;
}
$version = $_SERVER['HTTP_MCP_PROTOCOL_VERSION'] ?? '';
if ($version !== '' && $version !== '2025-06-18') { http_response_code(400); rpc_error(null,-32600,'Unsupported protocol version'); }
$accept = strtolower($_SERVER['HTTP_ACCEPT'] ?? '');
if (strpos($accept,'application/json') === false || strpos($accept,'text/event-stream') === false) {
    http_response_code(406); rpc_error(null,-32600,'Accept must include application/json and text/event-stream');
}
if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
    http_response_code(415); rpc_error(null,-32600,'Content-Type must be application/json');
}
$raw = file_get_contents('php://input', false, null, 0, 16385);
if (strlen($raw) > 16384) { http_response_code(413); rpc_error(null,-32600,'Request too large'); }
$request = json_decode($raw);
if (json_last_error() !== JSON_ERROR_NONE) { http_response_code(400); rpc_error(null,-32700,'Parse error'); }
if (!is_object($request) || ($request->jsonrpc ?? '') !== '2.0' || !is_string($request->method ?? null)) {
    http_response_code(400); rpc_error(null,-32600,'Invalid request');
}
$hasId = property_exists($request,'id');
$id = $request->id ?? null;
if ($hasId && !is_string($id) && !is_int($id) && $id !== null) rpc_error(null,-32600,'Invalid id');
if (isset($request->params) && !is_object($request->params)) rpc_error($id,-32602,'Parameters must be an object');
if (!$hasId) { http_response_code(202); exit; }
$card = json_decode(file_get_contents(__DIR__.'/.well-known/mcp/server-card.json'), true);
switch ($request->method) {
    case 'initialize':
        if (!is_string($request->params->protocolVersion ?? null)) rpc_error($id,-32602,'protocolVersion is required');
        $result = ['protocolVersion'=>'2025-06-18','capabilities'=>(object)['resources'=>new stdClass()],'serverInfo'=>$card['serverInfo']];
        break;
    case 'ping': $result = new stdClass(); break;
    case 'resources/list': $result = ['resources'=>$card['resources']]; break;
    case 'resources/read':
        $uri = $request->params->uri ?? null;
        $files = [
            'https://www.onestepmy.com/llms.txt'=>['llms.txt','text/plain'],
            'https://www.onestepmy.com/index.md'=>['index.md','text/markdown'],
            'mcp://server-card.json'=>['.well-known/mcp/server-card.json','application/json']
        ];
        if (!is_string($uri) || !isset($files[$uri])) rpc_error($id,-32002,'Unknown public resource');
        [$file,$mime] = $files[$uri];
        $result = ['contents'=>[['uri'=>$uri,'mimeType'=>$mime,'text'=>file_get_contents(__DIR__.'/'.$file)]]];
        break;
    default: rpc_error($id,-32601,'Method not found');
}
echo json_encode(['jsonrpc'=>'2.0','id'=>$id,'result'=>$result], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
