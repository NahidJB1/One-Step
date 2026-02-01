<?php
// submit.php

// 1. Setup response headers (return JSON)
header('Content-Type: application/json');

// 2. Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

// 3. Create 'uploads' and 'data' folders if they don't exist
if (!file_exists('uploads')) { mkdir('uploads', 0777, true); }
if (!file_exists('data')) { mkdir('data', 0777, true); }

// 4. Collect Text Data
$fullName = $_POST['fullName'] ?? '';
$rollNumber = $_POST['rollNumber'] ?? '';
$classSelect = $_POST['classSelect'] ?? '';
$schoolSelect = $_POST['schoolSelect'] ?? '';
$paymentMethod = $_POST['paymentMethod'] ?? '';
$trxId = $_POST['trxId'] ?? 'N/A';
$date = date('Y-m-d H:i:s');

// 5. Handle File Upload (Receipt)
$receiptFilename = 'No-Receipt';
if (isset($_FILES['receiptUpload']) && $_FILES['receiptUpload']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['receiptUpload']['tmp_name'];
    $fileName = $_FILES['receiptUpload']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Create a unique name: Name_Roll_Timestamp.jpg
    $cleanName = preg_replace('/[^a-zA-Z0-9]/', '_', $fullName);
    $newFileName = $cleanName . '_' . $rollNumber . '_' . time() . '.' . $fileExtension;
    
    $dest_path = 'uploads/' . $newFileName;
    
    if(move_uploaded_file($fileTmpPath, $dest_path)) {
        $receiptFilename = $newFileName;
    }
}

// 6. Save Data to CSV (Excel readable)
$csvFile = 'data/registrations.csv';
$isNewFile = !file_exists($csvFile);

$file = fopen($csvFile, 'a'); // Open in append mode

// If new file, write the headers first
if ($isNewFile) {
    fputcsv($file, ['Date', 'Full Name', 'Roll', 'Class', 'School', 'Payment Method', 'TRX ID', 'Receipt File']);
}

// Write the student data
fputcsv($file, [$date, $fullName, $rollNumber, $classSelect, $schoolSelect, $paymentMethod, $trxId, $receiptFilename]);

fclose($file);

// 7. Return Success
echo json_encode(['status' => 'success', 'message' => 'Registration saved successfully!']);
?>
