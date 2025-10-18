<?php
header("Content-Type: application/json");
include 'db.php'; // Ensure the PDO connection is included

$data = json_decode(file_get_contents("php://input"), true); // Get the JSON input

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the inventory data from the input
    $quantityInHand = $data['quantity_in_hand'];
    $quantityToBeReceived = $data['quantity_to_be_received'];

    try {
        // Prepare the update query with named placeholders
        $stmt = $conn->prepare("
            UPDATE inventory 
            SET quantity_in_hand = :quantity_in_hand, quantity_to_be_received = :quantity_to_be_received
            WHERE id = 1
        ");
        
        // Bind parameters to prevent SQL injection
        $stmt->bindParam(':quantity_in_hand', $quantityInHand, PDO::PARAM_INT);
        $stmt->bindParam(':quantity_to_be_received', $quantityToBeReceived, PDO::PARAM_INT);

        // Execute the statement
        $stmt->execute();

        // Return a success message
        echo json_encode(['success' => true]);

    } catch (PDOException $e) {
        // Catch any errors and return an error response
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
