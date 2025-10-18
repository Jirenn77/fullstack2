<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include DB config
require_once 'db.php';

try {
    // Connect using PDO
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // ================================
    // ADD BUNDLE
    // ================================
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'addBundle') {
        $input = json_decode(file_get_contents("php://input"), true);

        $name        = $input['name'] ?? '';
        $description = $input['description'] ?? '';
        $price       = isset($input['price']) ? (float)$input['price'] : 0;
        $validFrom   = $input['validFrom'] ?? null;
        $validTo     = $input['validTo'] ?? null;
        $status      = $input['status'] ?? 'active';
        $services    = $input['services'] ?? [];

        $pdo->beginTransaction();

        // Insert bundle
        $stmt = $pdo->prepare("
            INSERT INTO bundles (name, description, price, valid_from, valid_to, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $name,
            $description,
            $price,
            $validFrom ? date('Y-m-d', strtotime($validFrom)) : null,
            $validTo ? date('Y-m-d', strtotime($validTo)) : null,
            $status
        ]);

        $bundleId = $pdo->lastInsertId();

        // Insert bundle services
        if (!empty($services)) {
            $insertService = $pdo->prepare("INSERT INTO bundle_services (bundle_id, service_id) VALUES (?, ?)");
            foreach ($services as $serviceId) {
                $insertService->execute([$bundleId, $serviceId]);
            }
        }

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Bundle added successfully.']);
        exit;
    }

    // ================================
    // UPDATE BUNDLE
    // ================================
    if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'updateBundle') {
        $input = json_decode(file_get_contents("php://input"), true);

        $bundleId    = $input['bundle_id'] ?? null;
        $name        = $input['name'] ?? '';
        $description = $input['description'] ?? '';
        $price       = isset($input['price']) ? (float)$input['price'] : 0;
        $validFrom   = $input['validFrom'] ?? null;
        $validTo     = $input['validTo'] ?? null;
        $status      = $input['status'] ?? '';
        $services    = $input['services'] ?? [];

        if (!$bundleId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing bundle ID.']);
            exit;
        }

        try {
            $pdo->beginTransaction();

            // Update bundle
            $stmt = $pdo->prepare("
                UPDATE bundles
                SET name = ?, description = ?, price = ?, valid_from = ?, valid_to = ?, status = ?
                WHERE bundle_id = ?
            ");
            $stmt->execute([
                $name,
                $description,
                $price,
                $validFrom ? date('Y-m-d', strtotime($validFrom)) : null,
                $validTo ? date('Y-m-d', strtotime($validTo)) : null,
                $status,
                $bundleId
            ]);

            // Update bundle services (delete old, insert new)
            $deleteStmt = $pdo->prepare("DELETE FROM bundle_services WHERE bundle_id = ?");
            $deleteStmt->execute([$bundleId]);

            if (!empty($services)) {
                $insertStmt = $pdo->prepare("INSERT INTO bundle_services (bundle_id, service_id) VALUES (?, ?)");
                foreach ($services as $serviceId) {
                    $insertStmt->execute([$bundleId, $serviceId]);
                }
            }

            $pdo->commit();

            echo json_encode(['success' => true, 'message' => 'Bundle updated successfully.']);
            exit;
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
    }

    // ================================
    // GET BUNDLES WITH SERVICES
    // ================================
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT bundle_id, name, description, price, valid_from, valid_to, status FROM bundles");
        $bundles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($bundles as &$bundle) {
            $bundle['id'] = $bundle['bundle_id'];

            $bundle['validFrom'] = !empty($bundle['valid_from'])
                ? date("Y-m-d", strtotime($bundle['valid_from']))
                : null;

            $bundle['validTo'] = !empty($bundle['valid_to'])
                ? date("Y-m-d", strtotime($bundle['valid_to']))
                : null;

            // ✅ Fetch associated services
            $servicesStmt = $pdo->prepare("
                SELECT s.service_id, s.name, s.category, s.price, s.duration
                FROM services s
                INNER JOIN bundle_services bs ON s.service_id = bs.service_id
                WHERE bs.bundle_id = ?
            ");
            $servicesStmt->execute([$bundle['bundle_id']]);
            $bundle['services'] = $servicesStmt->fetchAll(PDO::FETCH_ASSOC);

            unset($bundle['bundle_id'], $bundle['valid_from'], $bundle['valid_to']);
        }

        echo json_encode(['bundles' => $bundles]);
        exit;
    }

    // ================================
    // Fallback
    // ================================
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
