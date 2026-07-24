<?php
// db_config.php - Centralized Database Configuration

$host = 'localhost';
$dbname = 'u629648508_scholarship'; 
$user = 'u629648508_admin';         
$pass = 'OneStep123@#!!'; 

// Optionally establish a global connection here or let files create their own using these variables.
// Letting files create their own for backward compatibility, but providing a helper function is good.
function getDbConnection() {
    global $host, $user, $pass, $dbname;
    $conn = new mysqli($host, $user, $pass, $dbname);
    if ($conn->connect_error) {
        die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
    }
    // Set charset
    $conn->set_charset("utf8mb4");
    return $conn;
}
?>
