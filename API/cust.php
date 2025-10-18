<?php

// session_start();

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST");
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = 'localhost';
$db = 'dbcom';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';


// include_once'getBalance.php';


$pdo = connectDatabase($host, $db, $user, $pass, $charset);

function connectDatabase($host, $db, $user, $pass, $charset)
{
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}


function getInvoice($pdo)
{
    // Check the request method
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
        return;
    }

    // Check for action parameter
    if (!isset($_GET['action']) || $_GET['action'] !== 'get_invoice') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Invalid action specified.']);
        return;
    }

    // Assuming CustomerID is passed correctly
    $customerID = isset($_GET['CustomerID']) ? (int)$_GET['CustomerID'] : 1; // Default to 1 if not provided

    // Prepare and execute the SQL statement
    $stmt = $pdo->prepare("
        SELECT i.*, c.CustomerName, p.ProductName 
        FROM invoices i 
        JOIN customers c ON i.CustomerID = c.CustomerID 
        JOIN products p ON i.ProductID = p.ProductID 
        WHERE i.CustomerID = ?
    ");
    $stmt->execute([$customerID]);
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return a single JSON response
    header('Content-Type: application/json');
    if ($invoices) {
        echo json_encode(['success' => true, 'invoices' => $invoices]);
    } else {
        echo json_encode(['success' => true, 'invoices' => [], 'message' => 'No invoices found']);
    }
}



function makePayment($pdo)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $customerID = 1; // Replace with dynamic customer ID as needed
    $amount = $data['Amount'];
    $invoiceID = $data['InvoiceID'];

    $minimumAmount = 100; // Minimum payment amount

    if ($amount < $minimumAmount) {
        echo json_encode(['success' => false, 'error' => "Payment must be at least ₱$minimumAmount."]);
        return;
    }

    // Check if the invoice exists and is unpaid
    $stmt = $pdo->prepare("SELECT PaymentStatus, TotalAmount FROM invoices WHERE InvoiceID = ? AND CustomerID = ?");
    $stmt->execute([$invoiceID, $customerID]);
    $invoice = $stmt->fetch();

    if (!$invoice || $invoice['PaymentStatus'] === 'Paid') {
        echo json_encode(['success' => false, 'error' => 'Invoice not found or already paid.']);
        return;
    }

    // Insert payment into the payments table
    $stmt = $pdo->prepare("INSERT INTO payments (CustomerID, InvoiceID, Amount, PaymentDate) VALUES (?, ?, ?, NOW())");
    if ($stmt->execute([$customerID, $invoiceID, $amount])) {
        // Update the invoice status if it is fully paid
        $stmt = $pdo->prepare("UPDATE invoices SET PaidAmount = PaidAmount + ?, PaymentStatus = CASE WHEN (PaidAmount + ?) >= TotalAmount THEN 'Paid' ELSE PaymentStatus END WHERE InvoiceID = ?");
        $stmt->execute([$amount, $amount, $invoiceID]);

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to process payment.']);
    }
}


function getPaymentHistory($pdo, $customerID)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
        return;
    }

    // Check if CustomerID is set
    if (!isset($_GET['CustomerID'])) {
        echo json_encode(['success' => false, 'error' => 'CustomerID is required.']);
        return;
    }

    $customerID = $_GET['CustomerID'];

    // Log the incoming CustomerID for debugging
    error_log("Fetching payment history for CustomerID: " . $customerID);

    $stmt = $pdo->prepare("SELECT * FROM payments WHERE CustomerID = ? ORDER BY PaymentDate DESC");
    $stmt->execute([$customerID]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log the number of payments found
    if (empty($payments)) {
        error_log("No payments found for CustomerID: " . $customerID);
    } else {
        error_log("Payments found for CustomerID: " . $customerID . ", Count: " . count($payments));
    }

    // Return the payments
    echo json_encode(['success' => true, 'payments' => $payments]);
}


function getProfile($pdo)
{
    session_start(); // Start the session

    // Debugging: Log session data
    error_log('Session data: ' . json_encode($_SESSION));

    // Set CustomerID to 1 directly
    $customerID = 1; // Only allow profile for CustomerID = 1

    try {
        // Prepare and execute the query to fetch customer details
        $stmt = $pdo->prepare("SELECT CustomerName, Email, ContactDetails, Balance FROM customers WHERE CustomerID = ?");
        $stmt->execute([$customerID]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($profile) {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'profile' => $profile]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Profile not found.']);
        }
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}





if (isset($_GET['action'])) {
    $action = $_GET['action'];

    switch ($action) {
        case 'get_invoice':
            getInvoice($pdo);
            break;
        case 'make_payment':
            makePayment($pdo);
            break;
        case 'get_payment_history':
            if (isset($_GET['CustomerID'])) {
                $customerID = $_GET['CustomerID'];
                getPaymentHistory($pdo, $customerID);
            } else {
                echo json_encode(['success' => false, 'error' => 'CustomerID is required.']);
            }
            break;
        case 'get_profile':
            getProfile($pdo);
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action specified.']);
            break;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No action specified.']);
}
