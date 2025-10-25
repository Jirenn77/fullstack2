<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // ===== HANDLE POST (CREATE OR UPDATE) =====
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON: " . json_last_error_msg()]);
            exit;
        }

        // If action = update, perform an UPDATE
        if (isset($data['action']) && $data['action'] === 'update' && !empty($data['membership_id'])) {
            $id = intval($data['membership_id']);
            $name = $data['name'] ?? '';
            $type = $data['type'] ?? '';
            $description = $data['description'] ?? '';
            $price = $data['price'] ?? 0;
            $consumable = $data['consumable_amount'] ?? 0;
            $valid_until = $data['valid_until'] ?? null;
            $status = $data['status'] ?? 'active';
            $discount = $data['discount'] ?? '0';

            $stmt = $pdo->prepare("
                UPDATE membership 
                SET name = ?, type = ?, description = ?, price = ?, consumable_amount = ?, valid_until = ?, status = ?, discount = ?
                WHERE id = ?
            ");
            $stmt->execute([$name, $type, $description, $price, $consumable, $valid_until, $status, $discount, $id]);

            // Handle membership services if provided
            if (isset($data['included_services']) && is_array($data['included_services'])) {
                // Clear existing services
                $deleteStmt = $pdo->prepare("DELETE FROM membership_services WHERE membership_id = ?");
                $deleteStmt->execute([$id]);
                
                // Insert new services
                if (!empty($data['included_services'])) {
                    $insertStmt = $pdo->prepare("INSERT INTO membership_services (membership_id, service_id) VALUES (?, ?)");
                    foreach ($data['included_services'] as $service) {
                        $serviceId = $service['id'] ?? $service['service_id'] ?? null;
                        if ($serviceId) {
                            $insertStmt->execute([$id, $serviceId]);
                        }
                    }
                }
            }

            // Fetch updated membership
            $stmt = $pdo->prepare("SELECT * FROM membership WHERE id = ?");
            $stmt->execute([$id]);
            $updatedMembership = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($updatedMembership) {
                echo json_encode($updatedMembership);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Membership not found after update"]);
            }
            exit;
        }

        // ===== HANDLE CREATE =====
        // Validate required fields
        if (empty($data['name']) || empty($data['type']) || empty($data['description'])) {
            http_response_code(400);
            echo json_encode(["error" => "Name, type, and description are required"]);
            exit;
        }

        // Set defaults based on type
        if ($data['type'] === 'basic') {
            $consumable = 5000;
            $price = 3000;
            $no_expiration = 1;
            $valid_until = null;
            $discount = '30';
        } elseif ($data['type'] === 'pro') {
            $consumable = 10000;
            $price = 6000;
            $no_expiration = 1;
            $valid_until = null;
            $discount = '50';
        } elseif ($data['type'] === 'promo') {
            // For promo, use provided values
            $consumable = (int)($data['consumable_amount'] ?? 0);
            $price = (float)($data['price'] ?? 0);
            $no_expiration = isset($data['no_expiration']) && $data['no_expiration'] ? 1 : 0;
            $valid_until = $no_expiration ? null : ($data['valid_until'] ?? null);
            $discount = $data['discount'] ?? '0';
        } else {
            // For custom types, use all provided values
            $consumable = (int)($data['consumable_amount'] ?? 0);
            $price = (float)($data['price'] ?? 0);
            $no_expiration = isset($data['no_expiration']) && $data['no_expiration'] ? 1 : 0;
            $valid_until = $no_expiration ? null : ($data['valid_until'] ?? null);
            $discount = $data['discount'] ?? '0';

            if ($price <= 0 || $consumable <= 0) {
                http_response_code(400);
                echo json_encode(["error" => "Price and consumable amount are required for custom membership types"]);
                exit;
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO membership 
            (name, type, discount, description, consumable_amount, price, no_expiration, valid_until, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ");
        $stmt->execute([
            $data['name'],
            $data['type'],
            $discount,
            $data['description'],
            $consumable,
            $price,
            $no_expiration,
            $valid_until
        ]);

        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM membership WHERE id = ?");
        $stmt->execute([$id]);
        $membership = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($membership) {
            echo json_encode($membership);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve created membership"]);
        }
        exit;
    }

    // ===== HANDLE GET =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // First, let's check if the membership_services table exists
    try {
        $checkTable = $pdo->query("SELECT 1 FROM membership_services LIMIT 1");
    } catch (PDOException $e) {
        // Table doesn't exist, create it
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS membership_services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                membership_id INT NOT NULL,
                service_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (membership_id) REFERENCES membership(id) ON DELETE CASCADE,
                FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
                UNIQUE KEY unique_membership_service (membership_id, service_id)
            )
        ");
    }

    // Simplified query without complex JSON escaping
    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.name,
            m.type,
            m.discount,
            m.description,
            m.consumable_amount,
            m.price,
            m.no_expiration,
            m.valid_until,
            m.status,
            m.created_at,
            m.date_registered,
            GROUP_CONCAT(DISTINCT s.service_id) as service_ids,
            GROUP_CONCAT(DISTINCT s.name) as service_names,
            GROUP_CONCAT(DISTINCT s.category) as service_categories,
            GROUP_CONCAT(DISTINCT s.duration) as service_durations,
            GROUP_CONCAT(DISTINCT s.price) as service_prices
        FROM membership m
        LEFT JOIN membership_services ms ON m.id = ms.membership_id
        LEFT JOIN services s ON ms.service_id = s.service_id
        GROUP BY m.id
        ORDER BY 
            CASE m.type
                WHEN 'basic' THEN 1
                WHEN 'pro' THEN 2
                WHEN 'promo' THEN 3
                ELSE 4
            END,
            m.id ASC
    ");
    
    $stmt->execute();
    $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Process services into proper array format
    foreach ($memberships as &$m) {
        $included_services = [];
        
        if (!empty($m['service_ids'])) {
            $service_ids = explode(',', $m['service_ids']);
            $service_names = explode(',', $m['service_names']);
            $service_categories = explode(',', $m['service_categories']);
            $service_durations = explode(',', $m['service_durations']);
            $service_prices = explode(',', $m['service_prices']);
            
            for ($i = 0; $i < count($service_ids); $i++) {
                if (!empty($service_ids[$i])) {
                    $included_services[] = [
                        'service_id' => (int)$service_ids[$i],
                        'name' => $service_names[$i] ?? '',
                        'category' => $service_categories[$i] ?? '',
                        'duration' => $service_durations[$i] ?? null,
                        'price' => $service_prices[$i] ?? '0'
                    ];
                }
            }
        }
        
        $m['included_services'] = $included_services;
        
        // Remove the temporary columns
        unset(
            $m['service_ids'],
            $m['service_names'], 
            $m['service_categories'],
            $m['service_durations'],
            $m['service_prices']
        );
    }

    echo json_encode($memberships);
    exit;
}

    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}