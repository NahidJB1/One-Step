<?php
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

try {
    require_once __DIR__ . '/../db_config.php';
    $conn = getDbConnection();

    // Auto-create tables
    $conn->query("CREATE TABLE IF NOT EXISTS chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        message_count INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $conn->query("CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        role ENUM('user', 'bot') NOT NULL,
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $action = $data['action'] ?? '';

    if ($action === 'start_session') {
        $userName = trim($data['user_name'] ?? '');
        $phone = trim($data['phone'] ?? '');

        if (empty($userName) || empty($phone)) {
            http_response_code(400);
            echo json_encode(['error' => 'user_name and phone are required']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO chat_sessions (user_name, phone) VALUES (?, ?)");
        $stmt->bind_param("ss", $userName, $phone);
        $stmt->execute();

        echo json_encode(['session_id' => $conn->insert_id]);
        $stmt->close();

    } elseif ($action === 'save_message') {
        $sessionId = (int)($data['session_id'] ?? 0);
        $role = $data['role'] ?? '';
        $message = $data['message'] ?? '';

        if (!$sessionId || !in_array($role, ['user', 'bot']) || empty($message)) {
            http_response_code(400);
            echo json_encode(['error' => 'session_id, valid role, and message are required']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO chat_messages (session_id, role, message) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $sessionId, $role, $message);
        $stmt->execute();
        $stmt->close();

        $stmt2 = $conn->prepare("UPDATE chat_sessions SET message_count = message_count + 1 WHERE id = ?");
        $stmt2->bind_param("i", $sessionId);
        $stmt2->execute();
        $stmt2->close();

        echo json_encode(['success' => true]);

    } elseif ($action === 'get_messages') {
        $sessionId = (int)($data['session_id'] ?? 0);

        if (!$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'session_id is required']);
            exit;
        }

        $stmt = $conn->prepare("SELECT id, role, message, sent_at FROM chat_messages WHERE session_id = ? ORDER BY sent_at ASC, id ASC");
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $result = $stmt->get_result();

        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        $stmt->close();

        echo json_encode(['messages' => $messages]);

    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }

    $conn->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
