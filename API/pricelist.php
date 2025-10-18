<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db.php'; // Ensure this file contains your database connection logic

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['action'])) {
    echo json_encode(["message" => "Action parameter is missing."]);
    exit();
}

$action = $data['action'];

try {
    $pdo = new PDO("mysql:host=your_host;dbname=lizly_skin_care", "root", ""); // Update database name
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($action) {
        case 'add_item':
            // Validate required fields for adding a price list item
            $requiredFields = ['name', 'details', 'description'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }

            // Add a new price list item
            $stmt = $pdo->prepare("INSERT INTO price_list (name, details, description) VALUES (:name, :details, :description)");
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':details', $data['details']);
            $stmt->bindParam(':description', $data['description']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Price list item added successfully!']);
            } else {
                echo json_encode(['message' => 'Failed to add price list item.']);
            }
            break;

        case 'edit_item':
            // Validate required fields for editing a price list item
            $requiredFields = ['id', 'name', 'details', 'description'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }

            // Update the price list item
            $stmt = $pdo->prepare("UPDATE price_list SET name = :name, details = :details, description = :description WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':details', $data['details']);
            $stmt->bindParam(':description', $data['description']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Price list item updated successfully!']);
            } else {
                echo json_encode(['message' => 'Failed to update price list item.']);
            }
            break;

        case 'delete_item':
            // Validate required fields for deleting a price list item
            if (!isset($data['id'])) {
                echo json_encode(['error' => 'Missing required field: id']);
                exit();
            }

            // Delete the price list item
            $stmt = $pdo->prepare("DELETE FROM price_list WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Price list item deleted successfully!']);
            } else {
                echo json_encode(['message' => 'Failed to delete price list item.']);
            }
            break;

        case 'get_item':
            // Validate required fields for fetching a price list item
            if (!isset($data['id'])) {
                echo json_encode(['error' => 'Missing required field: id']);
                exit();
            }

            // Fetch the price list item
            $stmt = $pdo->prepare("SELECT * FROM price_list WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->execute();
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($item) {
                echo json_encode($item);
            } else {
                echo json_encode(['message' => 'Price list item not found.']);
            }
            break;

        case 'get_all_items':
            // Fetch all price list items
            $stmt = $pdo->prepare("SELECT * FROM price_list");
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
            break;

        default:
            echo json_encode(['error' => 'Invalid action: ' . $action]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>