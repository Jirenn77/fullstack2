<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['action'])) {
    echo json_encode(["message" => "Action parameter is missing."]);
    exit();
}

$action = $data['action'];

try {
    $pdo = new PDO("mysql:host=your_host;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($action) {
        case 'add_category':
            // Validate required fields for adding a category
            $requiredFields = ['name', 'description', 'status', 'serviceLink'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }

            // Add a new category
            $stmt = $pdo->prepare("INSERT INTO categories (name, description, status, service_link) VALUES (:name, :description, :status, :serviceLink)");
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':serviceLink', $data['serviceLink']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Category added successfully!']);
            } else {
                echo json_encode(['message' => 'Failed to add category.']);
            }
            break;

        case 'edit_category':
            // Validate required fields for editing a category
            $requiredFields = ['id', 'name', 'description', 'status', 'serviceLink'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }

            // Update the category
            $stmt = $pdo->prepare("UPDATE categories SET name = :name, description = :description, status = :status, service_link = :serviceLink WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':serviceLink', $data['serviceLink']);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Category updated successfully!']);
            } else {
                echo json_encode(['message' => 'Failed to update category.']);
            }
            break;

        case 'delete_category':
            // Validate required fields for deleting a category
            if (!isset($data['id'])) {
                echo json_encode(['error' => 'Missing required field: id']);
                exit();
            }

            case 'get_category':
                // Validate required fields for fetching a category
                if (!isset($data['id'])) {
                    echo json_encode(['error' => 'Missing required field: id']);
                    exit();
                }
    
                // Fetch the category
                $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = :id");
                $stmt->bindParam(':id', $data['id']);
                $stmt->execute();
                $category = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($category) {
                    echo json_encode($category);
                } else {
                    echo json_encode(['message' => 'Category not found.']);
                }
                break;
    
            case 'get_services':
                // Fetch all services
                $stmt = $pdo->prepare("SELECT id, name, link FROM services"); // Assuming you have a `services` table
                $stmt->execute();
                $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($services);
                break;
    
            default:
                echo json_encode(['error' => 'Invalid action: ' . $action]);
                break;
        }
} catch (PDOException $e) {
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>