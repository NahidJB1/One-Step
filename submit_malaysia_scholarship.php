<?php
header('Content-Type: application/json');
require_once 'db_config.php';
$conn = getDbConnection();

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. Create table if not exists
    $tableQuery = "CREATE TABLE IF NOT EXISTS malaysia_scholarships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        passport_number VARCHAR(100),
        passing_year VARCHAR(10),
        qualification VARCHAR(50),
        ssc_gpa VARCHAR(10),
        hsc_gpa VARCHAR(10),
        bachelor_cgpa VARCHAR(10),
        masters_cgpa VARCHAR(10),
        university VARCHAR(150),
        subject VARCHAR(150),
        grant_amount INT,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if (!$conn->query($tableQuery)) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to create table: ' . $conn->error]);
        exit;
    }

    // 2. Collect Data
    $fullName = $_POST['fullName'] ?? '';
    $passport = $_POST['passport'] ?? '';
    $passingYear = $_POST['passingYear'] ?? '';
    $qualification = $_POST['qualification'] ?? '';
    $sscGpa = $_POST['sscGpa'] ?? '';
    $hscGpa = $_POST['hscGpa'] ?? '';
    $bachelorCgpa = $_POST['bachelorCgpa'] ?? '';
    $mastersCgpa = $_POST['mastersCgpa'] ?? '';
    $university = $_POST['university'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $grantAmount = isset($_POST['grantAmount']) ? (int)$_POST['grantAmount'] : 0;

    // 3. Insert into Database
    $stmt = $conn->prepare("INSERT INTO malaysia_scholarships (full_name, passport_number, passing_year, qualification, ssc_gpa, hsc_gpa, bachelor_cgpa, masters_cgpa, university, subject, grant_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if ($stmt) {
        $stmt->bind_param("ssssssssssi", $fullName, $passport, $passingYear, $qualification, $sscGpa, $hscGpa, $bachelorCgpa, $mastersCgpa, $university, $subject, $grantAmount);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Application submitted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error saving application: ' . $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Prepare Error: ' . $conn->error]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>
