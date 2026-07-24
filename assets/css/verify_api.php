<?php
// verify_api.php
header('Content-Type: application/json');

// Database configuration
$host = 'localhost';
$dbname = 'u629648508_scholarship'; 
$user = 'u629648508_admin';         
$pass = 'OneStep123@#!!'; 

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$cert_number = isset($_GET['cert_id']) ? trim($_GET['cert_id']) : '';

if (empty($cert_number)) {
    echo json_encode(['status' => 'error']);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM certificates WHERE cert_number = ?");
$stmt->bind_param("s", $cert_number);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    
    // Format the date if it exists
    if(!empty($data['issue_date'])) {
        $data['formatted_date'] = date('d M, Y', strtotime($data['issue_date']));
    } else {
        $data['formatted_date'] = 'N/A';
    }

    echo json_encode(['status' => 'success', 'data' => $data]);
} else {
    echo json_encode(['status' => 'error']);
}

$stmt->close();
$conn->close();
?>