<?php
// submit.php - DATABASE VERSION

header('Content-Type: application/json');

require_once 'db_config.php';
$conn = getDbConnection();

// 2. Handle File Upload (Same as before)
$uploadsDir = __DIR__ . '/uploads';
if (!file_exists($uploadsDir)) { mkdir($uploadsDir, 0777, true); }

$fullName = $_POST['fullName'] ?? '';
$rollNumber = $_POST['rollNumber'] ?? '';
$classSelect = $_POST['classSelect'] ?? '';
$schoolSelect = $_POST['schoolSelect'] ?? '';
$paymentMethod = $_POST['paymentMethod'] ?? '';
$trxId = $_POST['trxId'] ?? 'N/A';
$receiptFilename = 'No-Receipt';

if (isset($_FILES['receiptUpload']) && $_FILES['receiptUpload']['error'] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES['receiptUpload']['tmp_name'];
    $name = basename($_FILES['receiptUpload']['name']);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    
    // Security check: Whitelist extensions
    $allowedExts = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!in_array($ext, $allowedExts)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file extension. Only JPG, PNG, and PDF are allowed.']);
        exit;
    }
    
    // Security check: Validate MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $tmpName);
    finfo_close($finfo);
    
    $allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!in_array($mimeType, $allowedMimes)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type.']);
        exit;
    }
    
    $cleanName = preg_replace('/[^a-zA-Z0-9]/', '_', $fullName);
    $finalName = $cleanName . '_' . $rollNumber . '_' . time() . '.' . $ext;
    
    if (move_uploaded_file($tmpName, $uploadsDir . '/' . $finalName)) {
        $receiptFilename = $finalName;
    }
}

// 3. Insert Data into Database
$stmt = $conn->prepare("INSERT INTO students (full_name, roll_number, class_name, school_name, payment_method, trx_id, receipt_file) VALUES (?, ?, ?, ?, ?, ?, ?)");

if ($stmt) {
    $stmt->bind_param("sssssss", $fullName, $rollNumber, $classSelect, $schoolSelect, $paymentMethod, $trxId, $receiptFilename);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Registration Saved to Database!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Execute Error: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Prepare Error: ' . $conn->error]);
}

$conn->close();
?>