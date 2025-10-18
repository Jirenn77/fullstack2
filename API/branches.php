<?php

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:3000'];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Configure session cookies to work across localhost origins
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', 'false'); // keep false for localhost HTTP

session_start();

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_GET['action'] ?? '';
    $branchId = $_GET['id'] ?? null;

    switch ($action) {
        case 'user':
            $user = getCurrentUserWithBranch($pdo);
            echo json_encode($user);
            break;

        case 'admin':
        $admin = getCurrentAdmin($pdo);
        echo json_encode($admin);
        break;

        case 'add':
            handleAddBranch($pdo);
            break;

        case 'update':
            handleUpdateBranch($pdo, $branchId);
            break;

        case 'delete':
            handleDeleteBranch($pdo, $branchId);
            break;

        case 'get':
            handleGetBranch($pdo, $branchId);
            break;

        case 'branches':
        default:
            if ($branchId) {
                handleGetBranch($pdo, $branchId);
            } else {
                $branches = getBranchesData($pdo);
                echo json_encode($branches);
            }
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

function getCurrentAdmin($pdo)
{
    // Check if admin is logged in
    if (!isset($_SESSION['admin_id'])) {
        http_response_code(401);
        return [
            'error' => 'Admin not authenticated',
            'session_debug' => $_SESSION,
            'session_id' => session_id()
        ];
    }

    // Fetch admin data
    $stmt = $pdo->prepare("
        SELECT 
            admin_id as id,
            email,
            'admin' as role,
            'Admin' as name,
            'Pabayo Gomez Street' as branch
        FROM admin 
        WHERE admin_id = ?
    ");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        return [
            'id' => $admin['id'],
            'admin_id' => $admin['id'],
            'name' => $admin['name'],
            'username' => $admin['email'], // Use email as username
            'branch' => $admin['branch'],
            'branch_id' => 1, // Pabayo Gomez Street branch ID
            'branch_name' => $admin['branch'],
            'email' => $admin['email'],
            'role' => $admin['role'],
            'status' => 'Active'
        ];
    } else {
        http_response_code(404);
        return ['error' => 'Admin not found'];
    }
}

function getCurrentUserWithBranch($pdo)
{
    // Check if either user_id or admin_id is set in session
    if (!isset($_SESSION['user_id']) && !isset($_SESSION['admin_id'])) {
        http_response_code(401);
        return ['error' => 'User not authenticated'];
    }

    // Handle admin FIRST (priority)
    if (isset($_SESSION['admin_id'])) {
        $stmt = $pdo->prepare("
            SELECT 
                admin_id as id,
                email,
                'admin' as role,
                'Admin' as name,
                'Pabayo Gomez Street' as branch
            FROM admin 
            WHERE admin_id = ?
        ");
        $stmt->execute([$_SESSION['admin_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            return [
                'id' => $user['id'],
                'admin_id' => $user['id'],
                'name' => $user['name'],
                'username' => $user['email'],
                'branch' => $user['branch'],
                'branch_id' => 1,
                'branch_name' => $user['branch'],
                'email' => $user['email'],
                'role' => $user['role'],
                'status' => 'Active'
            ];
        }
    }

    // Handle regular user (only if no admin session)
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("
            SELECT 
                u.user_id as id, 
                u.name,
                u.username,
                u.branch,
                u.branch_id, 
                b.name AS branch_name, 
                b.color_code,
                u.email,
                u.role,
                u.status
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.user_id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            return [
                'id' => $user['id'],
                'name' => $user['name'],
                'username' => $user['username'],
                'branch' => $user['branch'],
                'branch_id' => $user['branch_id'],
                'branch_name' => $user['branch_name'] ?: $user['branch'],
                'email' => $user['email'],
                'role' => $user['role'],
                'status' => $user['status']
            ];
        }
    }

    http_response_code(404);
    return ['error' => 'User not found'];
}

// Fetch All Branches
function getBranchesData($pdo)
{
    $query = "
    SELECT 
        b.id, 
        b.name, 
        b.color_code AS colorCode, 
        b.address, 
        b.contact_number AS contactNumber, 
        u.user_id, 
        u.name AS user_name, 
        u.email AS user_email
    FROM branches b
LEFT JOIN users u ON u.branch_id = b.id

";
    $stmt = $pdo->query($query);


    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Only add dummy data if fields are NULL
        $row['address'] = $row['address'] ?? 'Not available';
        $row['contactNumber'] = $row['contactNumber'] ?? 'Not available';
        $row['user_id'] = $row['user_id'] ?? 'Not assigned';
        $row['user_id'] = $row['user_id'] ?? null; // keep it null, not "Not assigned"
        $row['employees'] = 0;
        $result[] = $row;
    }

    return $result;
}

// Get Single Branch
function handleGetBranch($pdo, $branchId)
{
    if (!$branchId) {
        http_response_code(400);
        echo json_encode(['error' => 'Branch ID is required']);
        return;
    }

    $stmt = $pdo->prepare("
    SELECT 
        b.id, 
        b.name, 
        b.color_code AS colorCode, 
        b.address, 
        b.contact_number AS contactNumber, 
        u.user_id, 
        u.name AS user_name, 
        u.email AS user_email,
        (SELECT COUNT(*) FROM users WHERE branch_id = b.id) AS users,
        (SELECT COUNT(*) FROM employees WHERE branch_id = b.id) AS employees
    FROM branches b
LEFT JOIN users u ON u.branch_id = b.id
WHERE b.id = ?

");

    $stmt->execute([$branchId]);
    $branch = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($branch) {
        // Only set defaults if fields are NULL
        $branch['address'] = $branch['address'] ?? 'Not available';
        $branch['contactNumber'] = $branch['contactNumber'] ?? 'Not available';
        $branch['user_id'] = $branch['user_id'] ?? null;
        echo json_encode($branch);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Branch not found']);
    }
}

// Add New Branch
// Add New Branch
function handleAddBranch($pdo)
{
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO branches (name, color_code, address, contact_number)
        VALUES (:name, :colorCode, :address, :contactNumber)
    ");

    try {
        $stmt->execute([
            ':name' => $data['name'],
            ':colorCode' => $data['colorCode'] ?? '#3B82F6',
            ':address' => $data['address'] ?? null,
            ':contactNumber' => $data['contactNumber'] ?? null,
        ]);

        $newBranchId = $pdo->lastInsertId();

        // Fetch the full row for consistency
        $stmt = $pdo->prepare("
            SELECT 
                b.id, 
                b.name, 
                b.color_code as colorCode, 
                b.address, 
                b.contact_number as contactNumber,
                NULL as user_id,
                NULL as user_name,
                NULL as user_email
            FROM branches b
            WHERE b.id = ?
        ");
        $stmt->execute([$newBranchId]);
        $newBranch = $stmt->fetch(PDO::FETCH_ASSOC);

        // Defaults for UI
        $newBranch['address'] = $newBranch['address'] ?? 'Not available';
        $newBranch['contactNumber'] = $newBranch['contactNumber'] ?? 'Not available';
        $newBranch['employees'] = 0;

        http_response_code(201);
        echo json_encode($newBranch);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add branch: ' . $e->getMessage()]);
    }
}



// Update Branch
function handleUpdateBranch($pdo, $branchId)
{
    if (!$branchId) {
        http_response_code(400);
        echo json_encode(['error' => 'Branch ID is required']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if ($data === null || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input data']);
        return;
    }

    // Prepare the update fields
    $fields = [];
    $params = [':id' => $branchId];

    if (isset($data['name'])) {
        $fields[] = 'name = :name';
        $params[':name'] = $data['name'];
    }

    if (isset($data['colorCode'])) {
        $fields[] = 'color_code = :colorCode';
        $params[':colorCode'] = $data['colorCode'];
    }

    if (isset($data['address'])) {
        $fields[] = 'address = :address';
        $params[':address'] = $data['address'];
    }

    if (isset($data['contactNumber'])) {
        $fields[] = 'contact_number = :contactNumber';
        $params[':contactNumber'] = $data['contactNumber'];
    }

    if (isset($data['user_id'])) {
        $fields[] = 'user_id = :user_id';
        $params[':user_id'] = $data['user_id'];
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields provided for update']);
        return;
    }

    $sql = "UPDATE branches SET " . implode(', ', $fields) . " WHERE id = :id";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Branch updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Branch not found or no changes made']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update branch: ' . $e->getMessage()]);
    }
}


// Delete Branch
function handleDeleteBranch($pdo, $branchId)
{
    if (!$branchId) {
        http_response_code(400);
        echo json_encode(['error' => 'Branch ID is required']);
        return;
    }

    // Check if branch exists
    $checkStmt = $pdo->prepare("SELECT id FROM branches WHERE id = ?");
    $checkStmt->execute([$branchId]);

    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Branch not found']);
        return;
    }

    // Check for associated users or employees
    $usersStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE branch_id = ?");
    $usersStmt->execute([$branchId]);
    $userCount = $usersStmt->fetchColumn();

    $employeesStmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE branch_id = ?");
    $employeesStmt->execute([$branchId]);
    $employeeCount = $employeesStmt->fetchColumn();

    if ($userCount > 0 || $employeeCount > 0) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Cannot delete branch with associated users or employees',
            'userCount' => $userCount,
            'employeeCount' => $employeeCount
        ]);
        return;
    }

    // Delete the branch
    $deleteStmt = $pdo->prepare("DELETE FROM branches WHERE id = ?");

    try {
        $deleteStmt->execute([$branchId]);

        if ($deleteStmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Branch deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Branch not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete branch: ' . $e->getMessage()]);
    }
}
