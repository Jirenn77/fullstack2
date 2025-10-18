<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:3000', // frontend dev
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input  = json_decode(file_get_contents("php://input"), true);
    $action = $_GET['action'] ?? $input['action'] ?? '';
    $roleId = $_GET['id'] ?? ($input['id'] ?? null);

    switch ($action) {
        case 'add':
            handleAddRole($pdo, $input);
            break;
        case 'update':
            handleUpdateRole($pdo, $roleId, $input);
            break;
        case 'get':
            handleGetRole($pdo, $roleId);
            break;
        case 'roles':
        default:
            if ($roleId) {
                handleGetRole($pdo, $roleId);
            } else {
                $roles = getRolesData($pdo);
                echo json_encode($roles);
            }
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

/**
 * Fetch all roles with their permissions
 */
function getRolesData($pdo) {
    $sql = "
        SELECT r.id AS role_id, r.name AS role_name, r.created_at, p.name AS permission_name
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        ORDER BY r.id
    ";
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $roles = [];
    foreach ($rows as $row) {
        $id = $row['role_id'];
        if (!isset($roles[$id])) {
            $roles[$id] = [
                "id" => $id,
                "name" => $row['role_name'],
                "createdAt" => $row['created_at'],
                "permissions" => []
            ];
        }
        if ($row['permission_name']) {
            $roles[$id]["permissions"][] = $row['permission_name'];
        }
    }
    return array_values($roles);
}

/**
 * Get a single role with permissions
 */
function handleGetRole($pdo, $roleId) {
    if (!$roleId) {
        http_response_code(400);
        echo json_encode(['error' => 'Role ID is required']);
        return;
    }

    $sql = "
        SELECT r.id AS role_id, r.name AS role_name, r.created_at, p.name AS permission_name
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE r.id = ?
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$roleId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        http_response_code(404);
        echo json_encode(['error' => 'Role not found']);
        return;
    }

    $role = [
        "id" => $rows[0]['role_id'],
        "name" => $rows[0]['role_name'],
        "createdAt" => $rows[0]['created_at'],
        "permissions" => []
    ];

    foreach ($rows as $row) {
        if ($row['permission_name']) {
            $role["permissions"][] = $row['permission_name'];
        }
    }

    echo json_encode($role);
}

/**
 * Add a new role
 */
function handleAddRole($pdo, $data) {
    if (empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Role name is required']);
        return;
    }

    $stmt = $pdo->prepare("INSERT INTO roles (name, created_at) VALUES (?, NOW())");
    $stmt->execute([$data['name']]);
    $newRoleId = $pdo->lastInsertId();

    if (!empty($data['permissions']) && is_array($data['permissions'])) {
        foreach ($data['permissions'] as $permId) {
            $insert = $pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
            $insert->execute([$newRoleId, $permId]);
        }
    }

    handleGetRole($pdo, $newRoleId);
}

/**
 * Update a role
 */
function handleUpdateRole($pdo, $roleId, $data) {
    if (!$roleId) {
        http_response_code(400);
        echo json_encode(['error' => 'Role ID is required']);
        return;
    }

    if (!empty($data['name'])) {
        $stmt = $pdo->prepare("UPDATE roles SET name = ? WHERE id = ?");
        $stmt->execute([$data['name'], $roleId]);
    }

    if (isset($data['permissions']) && is_array($data['permissions'])) {
        $pdo->prepare("DELETE FROM role_permissions WHERE role_id = ?")->execute([$roleId]);
        foreach ($data['permissions'] as $permId) {
            $insert = $pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
            $insert->execute([$roleId, $permId]);
        }
    }

    handleGetRole($pdo, $roleId);
}
