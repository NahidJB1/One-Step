<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../db_config.php';

try {
    $conn = getDbConnection();

    // Ensure the bot_analytics table exists (graceful auto-creation)
    $createTableQuery = "CREATE TABLE IF NOT EXISTS bot_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question VARCHAR(500) NOT NULL,
        asked_count INT DEFAULT 1,
        likes INT DEFAULT 0,
        dislikes INT DEFAULT 0,
        last_asked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_question (question(255))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    $conn->query($createTableQuery);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $question = $input['question'] ?? '';
        $action = $input['action'] ?? '';
        $previous = $input['previous_action'] ?? null;

        if (empty($question) || empty($action)) {
            echo json_encode(['status' => 'error', 'message' => 'Missing parameters']);
            exit;
        }

        // Action can be 'like', 'dislike', 'remove_like', 'remove_dislike'
        if ($action === 'like') {
            $updateQuery = "INSERT INTO bot_analytics (question, asked_count, likes) VALUES (?, 1, 1) ON DUPLICATE KEY UPDATE likes = likes + 1";
            if ($previous === 'dislike') {
                $updateQuery .= ", dislikes = GREATEST(0, dislikes - 1)";
            }
        } elseif ($action === 'dislike') {
            $updateQuery = "INSERT INTO bot_analytics (question, asked_count, dislikes) VALUES (?, 1, 1) ON DUPLICATE KEY UPDATE dislikes = dislikes + 1";
            if ($previous === 'like') {
                $updateQuery .= ", likes = GREATEST(0, likes - 1)";
            }
        } elseif ($action === 'remove_like') {
            $updateQuery = "UPDATE bot_analytics SET likes = GREATEST(0, likes - 1) WHERE question = ?";
        } elseif ($action === 'remove_dislike') {
            $updateQuery = "UPDATE bot_analytics SET dislikes = GREATEST(0, dislikes - 1) WHERE question = ?";
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            exit;
        }

        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param("s", $question);
        $stmt->execute();

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
}
?>
