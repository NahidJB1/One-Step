<?php
// The HTTP boundary is deliberately independent of retrieval and answer generation.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function chatError(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
if ($method !== 'POST') { header('Allow: POST, OPTIONS'); chatError(405, 'Use POST with a JSON message.'); }
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) chatError(413, 'Request is too large.');
$raw = file_get_contents('php://input', false, null, 0, 32769);
if ($raw === false || strlen($raw) > 32768) chatError(413, 'Request is too large.');
try {
    $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
} catch (JsonException $e) { chatError(400, 'Send a valid JSON object.'); }
if (!is_array($data) || !is_string($data['message'] ?? null)) chatError(400, 'Message must be a string.');
$message = trim($data['message']);
if ($message === '') chatError(400, 'Message is empty.');
if (preg_match_all('/./us', $message) > 2000) chatError(422, 'Please keep your message within 2,000 characters.');
foreach (['context', 'history'] as $field) {
    if (isset($data[$field]) && !is_array($data[$field])) chatError(400, ucfirst($field) . ' must be an object or array.');
}
try {
    require_once __DIR__ . '/chatbot/bootstrap.php';
    $bot = new OneStep\Chat\Counselor(new OneStep\Chat\KnowledgeBase(dirname(__DIR__)));
    $response = $bot->answer($message, $data['context'] ?? [], array_slice($data['history'] ?? [], -6));
    
    if (isset($response['status']) && $response['status'] === 'not_found') {
        $logLine = '[' . date('Y-m-d H:i:s') . '] User Query: ' . $message . "\n";
        file_put_contents(__DIR__ . '/unmatched_queries.log', $logLine, FILE_APPEND);
    }
    
    // Track popular questions in bot_analytics
    if (!empty($response['matched_q'])) {
        try {
            require_once __DIR__ . '/../db_config.php';
            $analyticsConn = getDbConnection();
            $analyticsConn->query("CREATE TABLE IF NOT EXISTS bot_analytics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question VARCHAR(500) NOT NULL,
                asked_count INT DEFAULT 1,
                likes INT DEFAULT 0,
                dislikes INT DEFAULT 0,
                last_asked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_question (question(255))
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $matchedQ = $response['matched_q'];
            $stmt = $analyticsConn->prepare("INSERT INTO bot_analytics (question, asked_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE asked_count = asked_count + 1");
            $stmt->bind_param("s", $matchedQ);
            $stmt->execute();
            $stmt->close();
            $analyticsConn->close();
        } catch (Throwable $analyticsErr) {
            // Analytics failure should not break chat responses
            error_log('Bot analytics error: ' . $analyticsErr->getMessage());
        }
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    // Do not write student messages or stack traces into publicly served log files.
    error_log('One-Step chatbot: ' . get_class($e) . ': ' . $e->getMessage());
    chatError(503, 'The local knowledge base is temporarily unavailable. Please try again or contact a counselor.');
}
