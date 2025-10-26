<?php
// ==== CORS + Session Configuration ====
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

    $input = json_decode(file_get_contents("php://input"), true);
    $action = $_GET['action'] ?? $input['action'] ?? '';
    $userId = $_GET['id'] ?? ($input['id'] ?? null);

    switch ($action) {
        case 'login':
            handleLogin($pdo);
            break;
            case 'logout': 
            handleLogout();
            break;
        case 'add':
            handleAddUser($pdo, $input);
            break;
        case 'branches':
            handleGetBranches($pdo);
            break;
        case 'update':
            handleUpdateUser($pdo, $userId, $input);
            break;
        case 'get':
            handleGetUser($pdo, $userId);
            break;
        case 'users':
        default:
            if ($userId) {
                handleGetUser($pdo, $userId);
            } else {
                $users = getUsersData($pdo);
                echo json_encode($users);
            }
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

// ===== LOGIN FUNCTION =====
function handleLogin($pdo)
{
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['identifier']) || empty($data['password'])) {
        echo json_encode(['error' => 'Missing parameters']);
        return;
    }

    $identifier = trim($data['identifier']);
    $password = trim($data['password']);
    $requestedBranchId = isset($data['branch_id']) ? (int)$data['branch_id'] : null;

    // Check if identifier is email or username with case-sensitive comparison
    if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
        // It's an email - search by email with case-sensitive comparison
        $stmt = $pdo->prepare("SELECT u.*, b.name AS branch_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE BINARY u.email = ?");
    } else {
        // It's a username - search by username with case-sensitive comparison  
        $stmt = $pdo->prepare("SELECT u.*, b.name AS branch_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE BINARY u.username = ?");
    }
    
    $stmt->execute([$identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Use case-sensitive comparison for password
        if ($password === $user['password']) {
            // Enforce branch assignment if a branch_id is provided by the client
            if ($requestedBranchId !== null && (int)$user['branch_id'] !== $requestedBranchId) {
                echo json_encode(['error' => 'User not assigned to this branch', 'code' => 'BRANCH_MISMATCH']);
                return;
            }

            $_SESSION['user_id'] = $user['user_id'];
            if (!empty($user['branch_id'])) {
                $_SESSION['branch_id'] = (int)$user['branch_id'];
            }

            unset($user['password']);
            echo json_encode([
                'success' => true,
                'branch' => $user['branch'] ?? $user['branch_name'] ?? null,
                'branch_id' => isset($user['branch_id']) ? (int)$user['branch_id'] : null,
                'branch_name' => $user['branch_name'] ?? null,
                'redirect' => '/home2',
                'role' => $user['role'],
                'user' => $user
            ]);
            return;
        }
    }

    echo json_encode(['error' => 'Invalid email/username or password']);
}

// ===== LOGOUT FUNCTION =====
function handleLogout()
{
    // Clear all session data
    $_SESSION = array();
    
    // If it's desired to kill the session, also delete the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Finally, destroy the session
    session_destroy();
    
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

// Fetch All Users
function getUsersData($pdo)
{
    $query = "SELECT 
                u.user_id AS id,
                u.name,
                u.username,
                u.branch,
                u.email,
                u.created_at,
                b.name AS branchName
              FROM users u
              LEFT JOIN branches b ON u.branch_id = b.id";
    $stmt = $pdo->query($query);

    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['status'] = "Active";
        $result[] = $row;
    }

    return $result;
}

// Get Single User
function handleGetUser($pdo, $userId)
{
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }

    $stmt = $pdo->prepare("
        SELECT 
            u.user_id as id,
            u.name,
            u.username,
            u.email,
            b.name as branchName,
            u.created_at,
            b.id as branchId
        FROM users u
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.user_id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $user['branch'] = $user['branchName'] ?? 'No branch assigned';
        $user['status'] = "Active";
        echo json_encode($user);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
}

// Add New User
function handleAddUser($pdo, $data)
{
    try {
        if (empty($data['name']) || empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Name, username, email, and password are required"
            ]);
            return;
        }

        // Validate branch_id exists if provided
        $branchId = isset($data['branch_id']) && !empty($data['branch_id']) ? (int)$data['branch_id'] : null;
        
        if ($branchId !== null) {
            $branchCheck = $pdo->prepare("SELECT id FROM branches WHERE id = ?");
            $branchCheck->execute([$branchId]);
            if (!$branchCheck->fetch()) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid branch selected"
                ]);
                return;
            }
            
            // Get branch name for the legacy branch field
            $branchStmt = $pdo->prepare("SELECT name FROM branches WHERE id = ?");
            $branchStmt->execute([$branchId]);
            $branch = $branchStmt->fetch(PDO::FETCH_ASSOC);
            $branchName = $branch['name'] ?? null;
        } else {
            $branchName = null;
        }

        $check = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $check->execute([$data['email']]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "message" => "Email already exists"
            ]);
            return;
        }

        $stmt = $pdo->prepare("
            INSERT INTO users (name, username, email, password, branch, branch_id, status, created_at)
            VALUES (:name, :username, :email, :password, :branch, :branch_id, :status, NOW())
        ");

        $stmt->execute([
            ':name' => $data['name'],
            ':username' => $data['username'],
            ':email' => $data['email'],
            ':password' => $data['password'],
            ':branch' => $branchName, // Use the branch name we fetched
            ':branch_id' => $branchId, // Use the validated branch_id
            ':status' => $data['status'] ?? 'Active',
        ]);

        $newUserId = $pdo->lastInsertId();

        $stmt = $pdo->prepare("
            SELECT 
                u.user_id AS id,
                u.name,
                u.username,
                u.email,
                u.branch,
                u.status,
                u.created_at,
                b.name AS branchName
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.user_id = ?
        ");
        $stmt->execute([$newUserId]);
        $newUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$newUser) {
            throw new Exception("Failed to fetch newly created user");
        }

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "User added successfully",
            "user" => $newUser
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
}

// Fetch all branches
function handleGetBranches($pdo)
{
    try {
        $stmt = $pdo->query("SELECT id, name FROM branches ORDER BY name ASC");
        $branches = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "branches" => $branches
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to fetch branches: " . $e->getMessage()
        ]);
    }
}

// Update User
function handleUpdateUser($pdo, $id, $data)
{
    try {
        // Collect fields to update
        $fields = [];
        $params = [':id' => $id];

        if (isset($data['name'])) {
            $fields[] = 'name = :name';
            $params[':name'] = $data['name'];
        }

        if (isset($data['username'])) {
            $fields[] = 'username = :username';
            $params[':username'] = $data['username'];
        }

        if (isset($data['email'])) {
            $fields[] = 'email = :email';
            $params[':email'] = $data['email'];
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $fields[] = 'password = :password';
            $params[':password'] = $data['password'];
        }

        // Handle branch_id update - this is crucial
        if (isset($data['branch_id'])) {
            $fields[] = 'branch_id = :branch_id';
            $params[':branch_id'] = !empty($data['branch_id']) ? $data['branch_id'] : null;
            
            // Also update the legacy branch field for consistency
            if (!empty($data['branch_id'])) {
                // Get branch name from branches table
                $branchStmt = $pdo->prepare("SELECT name FROM branches WHERE id = ?");
                $branchStmt->execute([$data['branch_id']]);
                $branch = $branchStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($branch) {
                    $fields[] = 'branch = :branch';
                    $params[':branch'] = $branch['name'];
                }
            } else {
                $fields[] = 'branch = :branch';
                $params[':branch'] = null;
            }
        }

        if (isset($data['status'])) {
            $fields[] = 'status = :status';
            $params[':status'] = $data['status'];
        }

        if (isset($data['role'])) {
            $fields[] = 'role = :role';
            $params[':role'] = $data['role'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            return;
        }

        // Build dynamic query
        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE user_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            // Return updated user data including branch info
            $updatedStmt = $pdo->prepare("
                SELECT 
                    u.user_id as id,
                    u.name,
                    u.username,
                    u.email,
                    u.branch_id,
                    b.name as branchName,
                    u.status,
                    u.role
                FROM users u
                LEFT JOIN branches b ON u.branch_id = b.id
                WHERE u.user_id = ?
            ");
            $updatedStmt->execute([$id]);
            $updatedUser = $updatedStmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => $updatedUser
            ]);
        } else {
            echo json_encode(['message' => 'No changes made or user not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
