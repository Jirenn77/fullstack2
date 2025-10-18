<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get action and period from query parameters
    $action = isset($_GET['action']) ? $_GET['action'] : 'dashboard';
    $period = isset($_GET['period']) ? $_GET['period'] : 'day';

    // Handle different endpoints
    switch ($action) {
        case 'all_services':
            echo json_encode(getAllServices($pdo));
            break;

        case 'premium_services':
            $membershipType = isset($_GET['membership_type']) ? strtolower(trim($_GET['membership_type'])) : null;

            // Debug output
            error_log("Received membership type: " . $membershipType);

            $services = getPremiumServices($pdo, $membershipType);

            // Debug output
            error_log("Returning services: " . print_r($services, true));

            header('Content-Type: application/json');
            echo json_encode($services);
            break;

        case 'add_service':
            $rawData = file_get_contents('php://input');
            error_log("RAW input: " . $rawData);

            $data = json_decode($rawData, true);

            if (!$data) {
                error_log("JSON decode failed: " . json_last_error_msg());
                echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
                exit;
            }

            error_log("Parsed JSON: " . print_r($data, true));

            if (!isset($data['service'], $data['group_id'])) {
                error_log("Missing service or group_id");
                echo json_encode(['success' => false, 'message' => 'Missing service or group_id']);
                exit;
            }

            $result = addServices($pdo, $data['service'], $data['group_id']);
            echo json_encode($result);
            break;

        case 'get_groups':
            echo json_encode(getAllGroups($pdo));
            break;

        case 'get_groups_with_services':
            echo json_encode(getGroupsWithServices($pdo));
            break;

        case 'get_available_services':
            $groupId = (int) $_GET['group_id'];
            echo json_encode(getAvailableServices($pdo, $groupId));
            break;

        case 'get_deals_with_services':
            echo json_encode(getDealsWithServices($pdo));
            break;

        case 'get_discounts_with_services':
            echo json_encode(getDiscountsWithServices($pdo));
            break;

        case 'get_memberships':
            echo json_encode(getMembershipsWithServices($pdo));
            break;

        case 'save_group':
            $rawInput = file_get_contents('php://input');
            file_put_contents("debug_input.json", $rawInput); // ✅ log input
            $data = json_decode($rawInput, true);

            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Invalid or missing JSON body.', 'raw' => $rawInput]);
                exit;
            }

            echo json_encode(saveGroup($pdo, $data));
            break;

        case 'update_service_mapping':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode(updateServiceMapping($pdo, $data));
            break;

        case 'update_service':
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON format: ' . json_last_error_msg(),
                    'raw' => $rawInput
                ]);
                exit;
            }
            echo json_encode(updateService($pdo, $data));
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

function addServices($pdo, $service, $groupId)
{
    try {
        if (empty($service['name']) || !isset($service['price']) || !isset($service['category'])) {
            return ['success' => false, 'message' => 'Missing required service fields.'];
        }

        // 🔹 Get the next service_id manually
        $stmt = $pdo->query("SELECT MAX(service_id) AS max_id FROM services");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextId = $row && $row['max_id'] ? $row['max_id'] + 1 : 1;

        // 🔹 Insert new service with manual service_id
        $stmt = $pdo->prepare("
            INSERT INTO services (service_id, name, price, description, duration, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $nextId,
            $service['name'],
            $service['price'],
            $service['description'] ?? null,
            $service['duration'] ?? null,
            $service['category']
        ]);

        // 🔹 Map service to group
        $stmtMapping = $pdo->prepare("
            INSERT INTO service_group_mappings (group_id, service_id)
            VALUES (?, ?)
        ");
        $stmtMapping->execute([$groupId, $nextId]);

        return ['success' => true, 'service_id' => $nextId];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}


function getAllServices($pdo)
{
    $stmt = $pdo->query("
        SELECT 
            service_id, 
            name, 
            category, 
            description,
            duration,
            price
        FROM services
        ORDER BY name
    ");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}


function getDealsWithServices($pdo)
{
    $deals = [];

    // Get all promos
    $stmt = $pdo->query("SELECT * FROM promos ORDER BY promo_id");
    $promos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($promos as $promo) {
        $groupName = trim($promo['name']);
        $groupId = $promo['promo_id'];

        // Fetch services linked to this promo
        $stmtServices = $pdo->prepare("
    SELECT 
        s.service_id,
        s.name,
        s.category,
        s.price AS originalPrice,
        CASE 
            WHEN p.discount_type = 'percentage' 
                THEN ROUND(s.price * (1 - (p.discount_value / 100)), 2)
            WHEN p.discount_type = 'fixed' 
                THEN GREATEST(0, ROUND(s.price - p.discount_value, 2))
            ELSE s.price
        END AS discountedPrice,
        p.discount_type,
        p.discount_value
    FROM promo_services ps
    JOIN services s ON s.service_id = ps.service_id
    JOIN promos p ON p.promo_id = ps.promo_id
    WHERE ps.promo_id = ?
    ORDER BY s.name
");


        $stmtServices->execute([$groupId]);
        $services = $stmtServices->fetchAll(PDO::FETCH_ASSOC);

        // Join service names for the description
        $serviceNames = array_column($services, 'name');
        $joinedNames = implode(' + ', $serviceNames);

        $deals[] = [
            'id' => $groupId,
            'name' => $groupName,
            'description' => $joinedNames,
            'details' => $promo['description'],
            'type' => 'promo',
            'validFrom' => $promo['valid_from'],
            'validTo' => $promo['valid_to'],
            'status' => $promo['status'],
            'discount_type' => $promo['discount_type'],
            'discount_value' => $promo['discount_value'],
            'services' => $services
        ];
    }

    return $deals;
}

function getDiscountsWithServices($pdo)
{
    $discounts = [];

    $stmt = $pdo->query("SELECT * FROM discounts ORDER BY discount_id");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $discount) {
        $discountId = $discount['discount_id'];

        $stmtServices = $pdo->prepare("
            SELECT 
                s.service_id,
                s.name,
                s.category,
                s.price AS originalPrice,
                CASE 
                    WHEN d.discount_type = 'percentage' 
                        THEN ROUND(s.price * (1 - (d.value / 100)), 2)
                    ELSE GREATEST(s.price - d.value, 0)
                END AS discountedPrice,
                d.value AS discountValue,
                d.discount_type AS discountType
            FROM 
                service_group_mappings gm
            JOIN 
                services s ON s.service_id = gm.service_id
            JOIN 
                discounts d ON d.discount_id = gm.group_id
            WHERE 
                gm.group_id = ?
        ");
        $stmtServices->execute([$discountId]);
        $services = $stmtServices->fetchAll(PDO::FETCH_ASSOC);

        $discounts[] = [
            'id' => $discountId,
            'name' => $discount['name'],
            'description' => $discount['description'],
            'discountType' => $discount['discount_type'],  // ✅ fixed
            'value' => $discount['value'],
            'status' => $discount['status'],
            'services' => $services
        ];
    }

    return $discounts;
}



function getMembershipsWithServices($pdo)
{
    $memberships = [];

    $stmt = $pdo->query("SELECT * FROM membership ORDER BY id");
    $membershipRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($membershipRows as $membership) {

        $discountValue = (float) str_replace('%', '', $membership['discount']);

        $stmtServices = $pdo->prepare("
            SELECT 
                service_id,
                name,
                category,
                price AS originalPrice,
                ROUND(price * (? / 100), 2) AS discountAmount,
                ROUND(price * (1 - (? / 100)), 2) AS discountedPrice,
                ? AS discountPercentage
            FROM services
            WHERE price >= 500
            ORDER BY name
        ");
        $stmtServices->execute([$discountValue, $discountValue, $discountValue]);
        $services = $stmtServices->fetchAll(PDO::FETCH_ASSOC);

        $memberships[] = [
            'id' => $membership['id'],
            'name' => $membership['name'],
            'description' => $membership['description'],
            'type' => strtolower($membership['name']),
            'discount' => $discountValue,
            'duration' => (int) $membership['duration'],
            'status' => $membership['status'],
            'services' => $services
        ];
    }

    return $memberships;
}

function getAllGroups($pdo)
{
    $stmt = $pdo->query("SELECT * FROM service_groups ORDER BY group_name");
    return $stmt->fetchAll();
}

function getGroupsWithServices($pdo)
{
    $stmt = $pdo->query("SELECT * FROM service_groups ORDER BY group_name");
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($groups as &$group) {
        $groupName = trim($group['group_name']);

        // Fetch services mapped by group name
        $stmtServices = $pdo->prepare("
            SELECT s.service_id, s.name, s.price, s.description, s.duration
            FROM services s
            WHERE TRIM(s.category) = ?
            ORDER BY s.name
        ");
        $stmtServices->execute([$groupName]);

        $group['services'] = $stmtServices->fetchAll(PDO::FETCH_ASSOC);
    }

    return $groups;
}

function getPremiumServices($pdo, $membershipType = null)
{
    // Base query for all premium services (₱499 and above)
    $query = "
        SELECT 
            service_id, 
            name, 
            category, 
            CAST(price AS DECIMAL(10,2)) AS originalPrice,
            description,
            duration
        FROM services
        WHERE price >= 499
    ";

    // Exclude Glow Drip for Basic membership
    if ($membershipType === 'basic') {
        $query .= " AND name != 'Glow Drip'";
    }

    $query .= " ORDER BY price DESC, name";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Apply 50% discount for both membership types
    foreach ($services as &$service) {
        $originalPrice = (float) $service['originalPrice'];
        $discountedPrice = round($originalPrice * 0.5, 2); // 50% discount

        $service['originalPrice'] = number_format($originalPrice, 2, '.', '');
        $service['discountedPrice'] = number_format($discountedPrice, 2, '.', '');
        $service['discountPercentage'] = '50%';
        $service['membershipType'] = $membershipType;
    }

    return $services;
}

function getAvailableServices($pdo, $groupId)
{
    $stmt = $pdo->prepare("
        SELECT s.service_id, s.name, s.price, s.description, s.duration
        FROM services s
        WHERE s.service_id NOT IN (
            SELECT service_id FROM service_group_mappings WHERE group_id = ?
        )
        ORDER BY s.name
    ");
    $stmt->execute([$groupId]);
    return $stmt->fetchAll();
}

function saveGroup($pdo, $data)
{
    $pdo->beginTransaction();

    try {
        // Default type is 'custom' if not provided
        $groupType = $data['group_type'] ?? 'custom';

        if (empty($data['group_id'])) {
            // Create new group
            $stmt = $pdo->prepare("
                INSERT INTO service_groups (group_name, description, status, group_type) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['group_name'],
                $data['description'] ?? null,
                $data['status'] ?? 'Active',
                $groupType
            ]);
            $groupId = $pdo->lastInsertId();
        } else {
            // Update existing group
            $stmtUpdate = $pdo->prepare("
                UPDATE service_groups 
                SET group_name = ?, description = ?, status = ?, group_type = ?
                WHERE group_id = ?
            ");
            $stmtUpdate->execute([
                $data['group_name'],
                $data['description'] ?? null,
                $data['status'] ?? 'Active',
                $groupType,
                $data['group_id']
            ]);

            $groupId = $data['group_id'];
        }

        // Replace services
        $stmt = $pdo->prepare("DELETE FROM service_group_mappings WHERE group_id = ?");
        $stmt->execute([$groupId]);

        if (!empty($data['services'])) {
            $stmt = $pdo->prepare("
                INSERT INTO service_group_mappings (group_id, service_id) 
                VALUES (?, ?)
            ");
            foreach ($data['services'] as $serviceId) {
                $stmt->execute([$groupId, $serviceId]);
            }
        }

        // ✅ Fetch updated group with services
        $stmtGroup = $pdo->prepare("
    SELECT group_id, group_name, description, status, group_type, created_at, updated_at
    FROM service_groups
    WHERE group_id = ?
");
        $stmtGroup->execute([$groupId]);
        $group = $stmtGroup->fetch(PDO::FETCH_ASSOC);

        // Ensure $group is an array
        if (!$group) {
            $group = [
                'group_id' => $groupId,
                'group_name' => $data['group_name'] ?? '',
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'Active',
                'group_type' => $groupType,
                'created_at' => null,
                'updated_at' => null,
            ];
        }

        // Fetch services
        $stmtServices = $pdo->prepare("
    SELECT s.service_id, s.name, s.price, s.description, s.duration, s.category
    FROM services s
    INNER JOIN service_group_mappings m ON s.service_id = m.service_id
    WHERE m.group_id = ?
");
        $stmtServices->execute([$groupId]);
        $services = $stmtServices->fetchAll(PDO::FETCH_ASSOC);

        $group['services'] = $services;
        $group['servicesCount'] = count($services);


        $pdo->commit();

        return ['success' => true, 'group' => $group];
    } catch (PDOException $e) {
        $pdo->rollBack();
        return ['success' => false, 'error' => $e->getMessage()];
    }
}


function updateServiceMapping($pdo, $data)
{
    try {
        if ($data['action'] === 'add') {
            $stmt = $pdo->prepare("
                INSERT INTO service_group_mappings (group_id, service_id)
                VALUES (?, ?)
            ");
            $success = $stmt->execute([$data['group_id'], $data['service_id']]);
        } else {
            $stmt = $pdo->prepare("
                DELETE FROM service_group_mappings
                WHERE group_id = ? AND service_id = ?
            ");
            $success = $stmt->execute([$data['group_id'], $data['service_id']]);
        }

        return ['success' => $success];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function updateService($pdo, $data)
{
    // Validate required fields
    if (!isset($data['id'], $data['name'], $data['price'], $data['duration'])) {
        return [
            'success' => false,
            'message' => 'Missing required fields: id, name, price, or duration'
        ];
    }

    try {
        // Prepare and execute the update query
        $stmt = $pdo->prepare("UPDATE services SET name = ?, price = ?, duration = ? WHERE service_id = ?");
        $success = $stmt->execute([
            $data['name'],
            $data['price'],
            $data['duration'],
            $data['id']
        ]);

        // Check if any row was actually updated
        if ($stmt->rowCount() === 0) {
            return [
                'success' => false,
                'message' => 'No changes made or service not found'
            ];
        }

        return ['success' => true];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ];
    }
}
