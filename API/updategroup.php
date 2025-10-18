<?php
header("Content-Type: application/json");
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'];
$name = $data['name'];
$description = $data['description'];
$services = $data['services'];

$stmt = $pdo->prepare("UPDATE service_groups SET name = ?, description = ?, services = ? WHERE id = ?");
$success = $stmt->execute([$name, $description, $services, $id]);

if ($success) {
    echo json_encode(['message' => 'Service group updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to update service group']);
}
?>