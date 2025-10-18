<?php
$host = 'localhost';
$db = 'dbcom';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

// Create a PDO connection and assign it to the $conn variable
$conn = connectDatabase($host, $db, $user, $pass, $charset);

function connectDatabase($host, $db, $user, $pass, $charset)
{
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        // Return the PDO connection object
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        // If connection fails, return error in JSON format and exit
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}
?>
