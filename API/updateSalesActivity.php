<?php
header("Content-Type: application/json");
include 'db.php';  // Ensure you have your database connection established

$data = json_decode(file_get_contents("php://input"), true); // Read JSON input

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve the type and count from the input JSON
    $type = $data['type'];
    $count = $data['count'];

    try {
        // Prepare and execute the update query
        $stmt = $conn->prepare("UPDATE sales_activity SET count = :count WHERE type = :type");
        $stmt->bindParam(':count', $count, PDO::PARAM_INT);  // Ensuring count is treated as an integer
        $stmt->bindParam(':type', $type, PDO::PARAM_STR);    // Ensuring type is treated as a string
        $stmt->execute();

        // Return a success response
        echo json_encode(['success' => true]);

    } catch (PDOException $e) {
        // Handle the error and send a JSON response with the error message
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
