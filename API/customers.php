<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // -------------------- ADD CUSTOMER --------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'add') {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data)
                throw new Exception("Invalid or missing JSON payload.");

            $name = trim($data['name'] ?? '');
            $contact = trim($data['phone'] ?? ''); // frontend sends "phone", but DB column is "contact"
            $email = isset($data['email']) && trim($data['email']) !== '' ? trim($data['email']) : null;
            $address = isset($data['address']) && trim($data['address']) !== '' ? trim($data['address']) : null;
            $birthday = isset($data['birthday']) && trim($data['birthday']) !== '' ? $data['birthday'] : null;
            $isMember = !empty($data['isMember']) ? 1 : 0;
            $membershipType = $data['membershipType'] ?? null;

            if (empty($name) || empty($contact))
                throw new Exception("Name and contact number are required.");

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO customers (name, contact, email, address, birthday) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $contact, $email, $address, $birthday]);
            $customerId = $pdo->lastInsertId();

            if ($isMember && $membershipType) {
                $coverage = match ($membershipType) {
                    'PRO' => 10000,
                    'Basic' => 5000,
                    default => 0
                };

                if ($coverage === 0)
                    throw new Exception("Invalid membership type: $membershipType");

                $stmtMem = $pdo->prepare("INSERT INTO memberships (customer_id, type, coverage, remaining_balance, date_registered, expire_date) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))");
                $stmtMem->execute([$customerId, $membershipType, $coverage, $coverage]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Customer added successfully.', 'customer_id' => $customerId]);

        } catch (Exception $e) {
            if ($pdo->inTransaction())
                $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Failed to add customer: ' . $e->getMessage()]);
        }
        exit;
    }

    // -------------------- UPDATE CUSTOMER --------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'update') {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id)
                throw new Exception("Missing customer ID.");

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data)
                throw new Exception("Invalid or missing JSON payload.");

            $name = trim($data['name'] ?? '');
            $contact = trim($data['contact'] ?? '');
            $email = isset($data['email']) && trim($data['email']) !== '' ? trim($data['email']) : null;
            $address = isset($data['address']) && trim($data['address']) !== '' ? trim($data['address']) : null;
            $birthday = isset($data['birthday']) && trim($data['birthday']) !== '' ? $data['birthday'] : null;
            $customerId = isset($data['customerId']) && trim($data['customerId']) !== '' ? trim($data['customerId']) : null;

            if (empty($name) || empty($contact))
                throw new Exception("Name and contact number are required.");

            $stmt = $pdo->prepare("UPDATE customers 
                                   SET name = :name, contact = :contact, email = :email, address = :address, birthday = :birthday, customerId = :customerId 
                                   WHERE id = :id");
            $stmt->execute([
                ':name' => $name,
                ':contact' => $contact,
                ':email' => $email,
                ':address' => $address,
                ':birthday' => $birthday,
                ':customerId' => $customerId,
                ':id' => $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Customer updated successfully.']);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Failed to update customer: ' . $e->getMessage()]);
        }
        exit;
    }


    // -------------------- GET SINGLE CUSTOMER --------------------
    if (isset($_GET['customerId'])) {
        $customerId = $_GET['customerId'];

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->execute([$customerId]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$customer) {
            http_response_code(404);
            echo json_encode(['error' => 'Customer not found']);
            exit;
        }

        if (!empty($customer['birthday'])) {
            $customer['birthday'] = date("F d, Y", strtotime($customer['birthday']));
        }

        $stmtMem = $pdo->prepare("
    SELECT type, coverage, remaining_balance, date_registered, expire_date
    FROM memberships
    WHERE customer_id = ?
    ORDER BY date_registered DESC, id DESC
    LIMIT 1
");
$stmtMem->execute([$customer['id']]); // for list loop, or [$customerId] for single customer
$membership = $stmtMem->fetch(PDO::FETCH_ASSOC);



        if ($membership) {
            $customer['membership'] = $membership['type'];
            $customer['membershipDetails'] = [
                'coverage' => $membership['coverage'],
                'remainingBalance' => $membership['remaining_balance'],
                'dateRegistered' => $membership['date_registered'],
                'expireDate' => $membership['expire_date']
            ];
        } else {
            $customer['membership'] = "None";
            $customer['membershipDetails'] = null;
        }

        $stmtTrans = $pdo->prepare("SELECT invoice_number, invoice_date, GROUP_CONCAT(s.name SEPARATOR ', ') as services, SUM(i.total_price) as amount, i.status FROM invoices i JOIN services s ON i.service_id = s.service_id WHERE i.customer_id = ? GROUP BY invoice_number ORDER BY invoice_date DESC LIMIT 10");
        $stmtTrans->execute([$customerId]);
        $transactions = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);

        foreach ($transactions as &$t) {
            $t['date'] = date("M d, Y", strtotime($t['invoice_date']));
            $t['service'] = $t['services'];
            $t['amount'] = (float) $t['amount'];
            $t['status'] = $t['status'];
            unset($t['invoice_date'], $t['services']);
        }

        $customer['transactions'] = $transactions;
        echo json_encode($customer);
        exit;
    }


    // -------------------- LIST CUSTOMERS --------------------
    $filter = $_GET['filter'] ?? 'all';
    $stmt = $pdo->prepare("SELECT * FROM customers ORDER BY id");
    $stmt->execute();
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $filtered = [];

    foreach ($customers as &$customer) {
        $stmtMem = $pdo->prepare("SELECT type, coverage, remaining_balance, date_registered, expire_date FROM memberships WHERE customer_id = ?");
        $stmtMem->execute([$customer['id']]);
        $membership = $stmtMem->fetch(PDO::FETCH_ASSOC);

        if ($membership) {
            $customer['membershipDetails'] = [
                'coverage' => $membership['coverage'],
                'remainingBalance' => $membership['remaining_balance'],
                'dateRegistered' => $membership['date_registered'],
                'expireDate' => $membership['expire_date']
            ];
            $customer['membership_status'] = $membership['type'];
        } else {
            $customer['membership_status'] = 'None';
        }

        if ($filter === 'member' && $customer['membership_status'] === 'None')
            continue;
        if ($filter === 'nonMember' && $customer['membership_status'] !== 'None')
            continue;

        $stmtTrans = $pdo->prepare("SELECT invoice_number, invoice_date, GROUP_CONCAT(s.name SEPARATOR ', ') as services, SUM(i.total_price) as amount, i.status FROM invoices i JOIN services s ON i.service_id = s.service_id WHERE i.customer_id = ? GROUP BY invoice_number ORDER BY invoice_date DESC LIMIT 10");
        $stmtTrans->execute([$customer['id']]);
        $transactions = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);

        foreach ($transactions as &$t) {
            $t['date'] = date("M d, Y", strtotime($t['invoice_date']));
            $t['service'] = $t['services'];
            $t['amount'] = (float) $t['amount'];
            $t['status'] = $t['status'];
            unset($t['invoice_date'], $t['services']);
        }

        $customer['transactions'] = $transactions;

        if (!empty($customer['birthday'])) {
            $customer['birthday'] = date("F d, Y", strtotime($customer['birthday']));
        }

        $filtered[] = $customer;
    }

    echo json_encode(array_values($filtered));

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
