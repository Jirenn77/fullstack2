<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db.php';

// Get the raw POST data
$rawData = file_get_contents("php://input");
error_log("Raw input data: " . $rawData); // Log the raw input data

// Decode the JSON data
$data = json_decode($rawData, true);

// Check if JSON decoding failed
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Invalid JSON data received: " . json_last_error_msg());
    error_log("Raw input data: " . $rawData); // Log the raw input data for debugging
    echo json_encode(['error' => 'Invalid JSON data: ' . json_last_error_msg()]);
    exit();
}

error_log("Decoded data: " . print_r($data, true)); // Log the decoded data

// Check if the action parameter is present
if (!isset($data['action'])) {
    error_log("Action parameter is missing in the payload."); // Log the missing action
    echo json_encode(['error' => 'Action parameter is missing']);
    exit();
}

// Extract the action from the data
$action = $data['action'];
error_log("Extracted action: " . $action); // Log the extracted action

try {
    switch ($action) {
        case 'add_item':
            // Validate required fields for adding an item
            $requiredFields = ['name', 'category', 'type', 'stockQty', 'service', 'description', 'unitPrice', 'supplier'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }

            // Add a new item
            $stmt = $conn->prepare("INSERT INTO items (name, category, type, stockQty, service, description, unitPrice, supplier) VALUES (:name, :category, :type, :stockQty, :service, :description, :unitPrice, :supplier)");
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':category', $data['category']);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':stockQty', $data['stockQty']);
            $stmt->bindParam(':service', $data['service']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':unitPrice', $data['unitPrice']);
            $stmt->bindParam(':supplier', $data['supplier']);
            $stmt->execute();

            echo json_encode(['success' => 'Item added successfully']);
            break;

        case 'edit_item':
            // Validate required fields for editing an item
            $requiredFields = ['id', 'name', 'category', 'type', 'stockQty', 'service', 'description', 'unitPrice', 'supplier'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }

            // Update the item
            $stmt = $conn->prepare("UPDATE items SET name = :name, category = :category, type = :type, stockQty = :stockQty, service = :service, description = :description, unitPrice = :unitPrice, supplier = :supplier WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':category', $data['category']);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':stockQty', $data['stockQty']);
            $stmt->bindParam(':service', $data['service']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':unitPrice', $data['unitPrice']);
            $stmt->bindParam(':supplier', $data['supplier']);
            $stmt->execute();

            echo json_encode(['success' => 'Item updated successfully']);
            break;

        case 'clone_item':
            // Validate required fields for cloning an item
            if (!isset($data['id'])) {
                echo json_encode(['error' => 'Missing required field: id']);
                exit();
            }

            // Clone an existing item
            $stmt = $conn->prepare("SELECT * FROM items WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->execute();
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($item) {
                // Insert the cloned item
                $stmt = $conn->prepare("INSERT INTO items (name, category, type, stockQty, service, description, unitPrice, supplier) VALUES (:name, :category, :type, :stockQty, :service, :description, :unitPrice, :supplier)");
                $stmt->bindParam(':name', $item['name']);
                $stmt->bindParam(':category', $item['category']);
                $stmt->bindParam(':type', $item['type']);
                $stmt->bindParam(':stockQty', $item['stockQty']);
                $stmt->bindParam(':service', $item['service']);
                $stmt->bindParam(':description', $item['description']);
                $stmt->bindParam(':unitPrice', $item['unitPrice']);
                $stmt->bindParam(':supplier', $item['supplier']);
                $stmt->execute();

                echo json_encode(['success' => 'Item cloned successfully']);
            } else {
                echo json_encode(['error' => 'Item not found']);
            }
            break;

        case 'mark_as_inactive':
            // Validate required fields for marking an item as inactive
            if (!isset($data['id'])) {
                echo json_encode(['error' => 'Missing required field: id']);
                exit();
            }

            // Mark an item as inactive
            $stmt = $conn->prepare("UPDATE items SET status = 'inactive' WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->execute();

            echo json_encode(['success' => 'Item marked as inactive']);
            break;

        case 'delete_item':
            // Validate required fields for deleting an item
            if (!isset($data['id'])) {
                echo json_encode(['error' => 'Missing required field: id']);
                exit();
            }

            // Delete an item
            $stmt = $conn->prepare("DELETE FROM items WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->execute();

            echo json_encode(['success' => 'Item deleted successfully']);
            break;

        case 'add_to_group':
            // Validate required fields for adding an item to a group
            $requiredFields = ['id', 'groupId'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }

            // Add an item to a group
            $stmt = $conn->prepare("UPDATE items SET group_id = :groupId WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':groupId', $data['groupId']);
            $stmt->execute();

            echo json_encode(['success' => 'Item added to group successfully']);
            break;

        default:
            echo json_encode(['error' => 'Invalid action: ' . $action]);
            break;
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage()); // Log the database error
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>