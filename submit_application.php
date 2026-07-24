<?php
// submit_application.php

header('Content-Type: application/json');

require_once 'db_config.php';
$conn = getDbConnection();

// 3. Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 4. Collect Data
    $fullName = $_POST['fullName'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    $studyInterest = $_POST['studyInterest'] ?? '';
    $passportStatus = $_POST['passportStatus'] ?? '';

    // Logic for Education: 
    // If user selected "Other", we save the text they typed in the specific text box.
    // Otherwise, we save the dropdown value.
    $eduSelect = $_POST['eduQualification'] ?? '';
    $finalEducation = "";

    if ($eduSelect === "Other") {
        $finalEducation = $_POST['otherEdu'] ?? '';
    } else {
        $finalEducation = $eduSelect;
    }

    // 5. Insert into Database (Using Prepared Statements)
    $stmt = $conn->prepare("INSERT INTO student_applications (full_name, phone, email, education_qualification, study_interest, has_passport) VALUES (?, ?, ?, ?, ?, ?)");
    
    if ($stmt) {
        $stmt->bind_param("ssssss", $fullName, $phone, $email, $finalEducation, $studyInterest, $passportStatus);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Application submitted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error: ' . $stmt->error]);
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