<?php
// db_config.php - Centralized Database Configuration

$host = 'localhost';
$dbname = 'u629648508_scholarship'; 
$user = 'u629648508_admin';         
$pass = 'OneStep123@#!!'; 

// Optionally establish a global connection here or let files create their own using these variables.
// Let files create their own using these variables.
function getDbConnection() {
    global $host, $user, $pass, $dbname;
    
    // In PHP 8.1+, mysqli throws exceptions by default. Catch them to prevent 500 errors.
    try {
        $conn = new mysqli($host, $user, $pass, $dbname);
        if ($conn->connect_error) {
            die("Database connection failed: " . $conn->connect_error);
        }
        // Set charset
        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        die("Database connection failed. Please check your db_config.php credentials. Error: " . $e->getMessage());
    }
}
?>
