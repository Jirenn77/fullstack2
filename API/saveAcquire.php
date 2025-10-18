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

    // Handle CORS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // POST - Save transaction and invoices
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (
            !isset($input['customer_id']) ||
            !isset($input['services']) ||
            !is_array($input['services'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing or invalid required fields']);
            exit;
        }

        $customerId = filter_var($input['customer_id'], FILTER_SANITIZE_NUMBER_INT);
        $employeeName = isset($input['employee_name']) ? $input['employee_name'] : 'N/A';
        $employeeId = isset($input['employee_id']) ? $input['employee_id'] : null;
        $branchId = isset($input['branch_id']) ? $input['branch_id'] : null;
        $branchName = isset($input['branch_name']) ? $input['branch_name'] : (isset($input['branch']) ? $input['branch'] : 'Main Branch');
        $services = $input['services'];

        // Recalculate subtotal from services to ensure accuracy
        $subtotal = 0;
        foreach ($services as $service) {
            if (!isset($service['price']) || !isset($service['quantity']) || !isset($service['service_id'])) {
                throw new Exception('Invalid service data: missing price, quantity, or service_id');
            }
            $subtotal += floatval($service['price']) * intval($service['quantity']);
        }

        // ✅ CRITICAL: Get ALL deduction amounts from frontend
        $promoReduction = isset($input['promoReduction']) ? floatval($input['promoReduction']) : 0;
        $discountReduction = isset($input['discountReduction']) ? floatval($input['discountReduction']) : 0;
        $membershipDiscount = isset($input['membershipDiscount']) ? floatval($input['membershipDiscount']) : 0;
        $membershipBalanceDeduction = isset($input['membershipBalanceDeduction']) ? floatval($input['membershipBalanceDeduction']) : 0;
        $membershipReduction = $membershipDiscount + $membershipBalanceDeduction;

        // Final total matches frontend logic
        $finalAmount = $subtotal - $promoReduction - $discountReduction - $membershipReduction;
        if ($finalAmount < 0) {
            $finalAmount = 0; // Prevent negative totals
        }

        $serviceDate = date("Y-m-d");
        
        // ✅ Get the updated balance from frontend
        $updateMembershipBalance = isset($input['new_membership_balance']) ? floatval($input['new_membership_balance']) : null;

        try {
    $pdo->beginTransaction();

    // Generate invoice number (use the one from frontend if provided)
    $invoiceNumber = isset($input['order_number']) ? $input['order_number'] : 'INV-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

    // Combine service names into description
    $serviceDescription = implode(', ', array_map(function ($s) {
        return $s['name'] ?? 'Unknown Service';
    }, $services));

    // ✅ FIXED: Include branch data in transactions table
    $stmt = $pdo->prepare("
        INSERT INTO transactions 
        (customer_id, service_date, service_description, employee_name, invoice_number, total_amount, branch_id, branch_name)
        VALUES (:customer_id, :service_date, :description, :employee, :invoice_number, :total, :branch_id, :branch_name)
    ");
    $stmt->execute([
        ':customer_id' => $customerId,
        ':service_date' => $serviceDate,
        ':description' => $serviceDescription,
        ':employee' => $employeeName,
        ':invoice_number' => $invoiceNumber,
        ':total' => $finalAmount,
        ':branch_id' => $branchId,  // ✅ Now storing branch_id
        ':branch_name' => $branchName  // ✅ Now storing branch_name
    ]);

            // Insert each service into invoices
            foreach ($services as $service) {
                $stmt = $pdo->prepare("
                    INSERT INTO invoices 
                    (invoice_number, customer_id, service_id, invoice_date, quantity, total_price, status)
                    VALUES (:invoice_number, :customer_id, :service_id, :invoice_date, :quantity, :total_price, :status)
                ");
                $stmt->execute([
                    ':invoice_number' => $invoiceNumber,
                    ':customer_id' => $customerId,
                    ':service_id' => $service['service_id'],
                    ':invoice_date' => $serviceDate,
                    ':quantity' => intval($service['quantity']),
                    ':total_price' => floatval($service['price']) * intval($service['quantity']),
                    ':status' => 'Paid'
                ]);
            }

            // Insert into orders table for dashboard stats - Use actual branch_id if available
            $ordersBranchId = $branchId ?: 1; // Use actual branch_id or fallback to 1
            foreach ($services as $service) {
                $stmtOrders = $pdo->prepare("
                    INSERT INTO orders
                    (branch_id, service_id, order_date, amount, customer_id)
                    VALUES (:branch_id, :service_id, :order_date, :amount, :customer_id)
                ");
                $stmtOrders->execute([
                    ':branch_id' => $ordersBranchId,
                    ':service_id' => $service['service_id'],
                    ':order_date' => $serviceDate . ' ' . date('H:i:s'),
                    ':amount' => floatval($service['price']) * intval($service['quantity']),
                    ':customer_id' => $customerId,
                ]);
            }

            // ✅ Update membership balance if applicable
            if (!is_null($updateMembershipBalance)) {
                $safeBalance = max(0, $updateMembershipBalance);
                
                // Debug logging
                error_log("Updating membership balance for customer $customerId: $safeBalance (deduction: $membershipBalanceDeduction)");

                $updateStmt = $pdo->prepare("
                    UPDATE memberships 
                    SET remaining_balance = :balance 
                    WHERE customer_id = :customer_id
                ");
                $updateStmt->execute([
                    ':balance' => $safeBalance,
                    ':customer_id' => $customerId
                ]);

                // Check if update was successful
                if ($updateStmt->rowCount() === 0) {
                    error_log("No membership record found for customer: $customerId");
                    // You might want to create a membership record here if needed
                } else {
                    error_log("Membership balance updated successfully for customer: $customerId");
                }
            }

            $pdo->commit();

            // ✅ FIXED: Now all variables are properly defined
            http_response_code(201);
            echo json_encode([
                'message' => 'Order saved successfully',
                'invoice_number' => $invoiceNumber,
                'calculated_total' => $finalAmount,
                'membership_balance_updated' => !is_null($updateMembershipBalance),
                'new_balance' => $updateMembershipBalance,
                'branch_id' => $branchId,
                'branch_name' => $branchName,
                'handled_by' => $employeeName,
                'branch' => $branchName,
                'debug_info' => [
                    'subtotal' => $subtotal,
                    'membership_balance_deduction' => $membershipBalanceDeduction,
                    'membership_discount' => $membershipDiscount,
                    'employee_data_received' => [
                        'employee_id' => $employeeId,
                        'employee_name' => $employeeName,
                        'branch_id' => $branchId,
                        'branch_name' => $branchName
                    ]
                ]
            ]);
            exit;

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Transaction failed: ' . $e->getMessage()]);
            exit;
        }
    }

    // Method not allowed
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}