<?php
// track.php - Visitor tracking endpoint
require_once 'db_config.php';

// Enable error reporting for debugging during setup
ini_set('display_errors', 1);
error_reporting(E_ALL);

$conn = getDbConnection();

// Create table if not exists
$conn->query("CREATE TABLE IF NOT EXISTS visitor_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    referrer_url VARCHAR(500) DEFAULT '',
    entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
    time_spent INT DEFAULT 0,
    INDEX (session_id),
    INDEX (last_ping),
    INDEX (page_url(191)),
    INDEX (entry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Get JSON payload
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data && isset($_POST['action'])) {
    $data = $_POST;
}

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'No data received', 'raw' => $raw_input, 'post' => $_POST, 'method' => $_SERVER['REQUEST_METHOD']]);
    exit;
}

$action = $data['action'] ?? '';
$session_id = $data['session_id'] ?? '';

if (empty($session_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing session_id', 'data' => $data]);
    exit;
}

if ($action === 'page_view') {
    $page_url = $data['page_url'] ?? '';
    $referrer_url = $data['referrer_url'] ?? '';
    
    $stmt = $conn->prepare("INSERT INTO visitor_logs (session_id, page_url, referrer_url, entry_time, last_ping, time_spent) VALUES (?, ?, ?, NOW(), NOW(), 0)");
    $stmt->bind_param("sss", $session_id, $page_url, $referrer_url);
    $stmt->execute();
    $log_id = $stmt->insert_id;
    $stmt->close();
    
    echo json_encode(['status' => 'ok', 'log_id' => $log_id]);
    exit;
} elseif ($action === 'heartbeat' || $action === 'page_leave') {
    $log_id = $data['log_id'] ?? 0;
    if ($log_id > 0) {
        $stmt = $conn->prepare("UPDATE visitor_logs SET last_ping = NOW(), time_spent = TIMESTAMPDIFF(SECOND, entry_time, NOW()) WHERE id = ?");
        $stmt->bind_param("i", $log_id);
        $stmt->execute();
        $stmt->close();
    }
    echo json_encode(['status' => 'ok']);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action', 'action' => $action]);
exit;
?>
