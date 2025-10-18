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
        $data = json_decode(file_get_contents('php://input'), true);

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

            $updatedMembership = $pdo->query("SELECT * FROM membership WHERE id = $id")->fetch(PDO::FETCH_ASSOC);
            echo json_encode($updatedMembership);
            exit;
        }

        // ===== HANDLE CREATE =====
        // Validate required fields
        if (empty($data['name']) || empty($data['type']) || empty($data['description'])) {
            http_response_code(400);
            echo json_encode(["error" => "Name, type, and description are required"]);
            exit;
        }

        // Set defaults based on type, but allow custom types with user-provided values
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

            // Validate that custom types have required fields
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
        $membership = $pdo->query("SELECT * FROM membership WHERE id = $id")->fetch(PDO::FETCH_ASSOC);
        echo json_encode($membership);
        exit;
    }

    // ===== HANDLE GET =====
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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
                CONCAT('[', 
                    GROUP_CONCAT(
                        CONCAT('{\"service_id\":', s.service_id, ',\"name\":\"', s.name, '\"}')
                    ), 
                ']') AS included_services
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

        foreach ($memberships as &$m) {
            if (!empty($m['included_services'])) {
                $m['included_services'] = json_decode($m['included_services'], true) ?: [];
            } else {
                $m['included_services'] = [];
            }
        }

        echo json_encode($memberships);
        exit;
    }

    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}