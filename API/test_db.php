<?php
require_once 'db.php'; // Your config file name

try {
    // Test query
    $stmt = $conn->query("SELECT NOW() as current_time, DATABASE() as db_name");
    $result = $stmt->fetch();
    
    echo "<h2>✅ Connection Successful!</h2>";
    echo "Database: " . $result['db_name'] . "<br>";
    echo "Server Time: " . $result['current_time'] . "<br>";
    echo "Host: db30581.databaseasp.net<br>";
    
} catch (PDOException $e) {
    echo "<h2>❌ Connection Failed</h2>";
    echo "Error: " . $e->getMessage();
}
?>