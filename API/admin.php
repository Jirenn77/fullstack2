<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:3000'
];
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once 'db.php';

$host = 'localhost';
$db = 'dbcom';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

function getRequestData() {
    $data = [];
    if (!empty($_POST)) {
        $data = $_POST;
    } else {
        $raw = file_get_contents("php://input");
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $data = $json;
        }
    }
    return $data;
}

function login($pdo)
{
    $data = getRequestData();
    error_log("Login data: " . print_r($data, true));

    if (isset($data['email'], $data['password'])) {
        $email = trim($data['email']);
        $password = trim($data['password']);

        // Check in the admin table ONLY
        $stmt = $pdo->prepare("SELECT * FROM admin WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin) {
            error_log('Admin found: ' . json_encode($admin));
            if ($password === trim($admin['password'])) { // direct comparison, trimmed
                $_SESSION['admin_id'] = $admin['admin_id'];
                unset($admin['password']);
                $admin['role'] = $admin['role'] ?: 'admin'; // default if null
                echo json_encode($admin);
                return;
            } else {
                error_log('Admin password mismatch');
            }
        }

        echo json_encode(['error' => 'Invalid email or password']);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
}

function logout()
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

function register()
{
    $data = getRequestData();
    error_log("Register data: " . print_r($data, true));

    if (!isset($data['email'], $data['password'], $data['role'], $data['captchaToken'])) {
        echo json_encode(['error' => 'Missing parameters']);
        return;
    }

    // Validate CAPTCHA
    $captchaToken = $data['captchaToken'];
    $secretKey = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    $url = "https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$captchaToken";
    $response = file_get_contents($url);
    $responseKeys = json_decode($response, true);

    if (empty($responseKeys["success"])) {
        echo json_encode(['error' => 'Invalid CAPTCHA']);
        return;
    }

    // Sanitize & validate email
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    // Validate password strength
    $password = $data['password'];
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/', $password)) {
        echo json_encode(['error' => 'Password must be at least 8 chars, include uppercase, lowercase, number, and special char.']);
        return;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert into database
    global $pdo;
    try {
        if ($data['role'] === 'customer') {
            $stmt = $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->execute([$email, $hashedPassword]);
            echo json_encode(['success' => 'Customer registered successfully']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO admin (email, password, role) VALUES (?, ?, ?)");
            $stmt->execute([$email, $hashedPassword, $data['role']]);
            echo json_encode(['success' => ucfirst($data['role']) . ' registered successfully']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Main logic
if (isset($_GET['action'])) {
    $action = $_GET['action'];
    if ($action == 'login') {
        login($pdo);
    } elseif ($action == 'logout') {
        logout();
    } elseif ($action == 'register') {
        register();
    } else {
        echo json_encode(['error' => 'Invalid action specified']);
    }
} else {
    echo json_encode(['error' => 'No action specified']);
}
