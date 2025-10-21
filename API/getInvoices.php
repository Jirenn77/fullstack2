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

    // ✅ Handle invoice fetching (GET)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $branchFilter = $_GET['branch'] ?? null;

        // First, let's use a simpler query to see what tables and data we have
        $query = "
        SELECT 
            i.invoice_number,
            i.invoice_date,
            i.total_price,
            i.status AS payment_status,
            c.name AS customer_name,
            s.name AS service_name,
            s.price AS service_unit_price,
            t.total_amount AS final_total,
            t.employee_name,
            t.branch_name AS branch
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        JOIN services s ON i.service_id = s.service_id
        LEFT JOIN transactions t ON i.invoice_number = t.invoice_number
        WHERE 1=1
        ";

        // optional filter by branch
        if ($branchFilter && strtolower($branchFilter) !== 'all') {
            $query .= " AND (t.branch_name = :branch OR :branch = 'Main')";
        }

        $query .= " ORDER BY i.invoice_date DESC, i.invoice_id DESC";

        $stmt = $pdo->prepare($query);

        if ($branchFilter && strtolower($branchFilter) !== 'all') {
            $stmt->bindParam(':branch', $branchFilter);
        }

        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$result) {
            echo json_encode([]);
            exit;
        }

        $invoices = [];

        foreach ($result as $row) {
            $invNumber = $row['invoice_number'];

            // Check if invoice exists already
            $index = null;
            foreach ($invoices as $key => $inv) {
                if ($inv['invoiceNumber'] === $invNumber) {
                    $index = $key;
                    break;
                }
            }

            if ($index === null) {
                $grandTotal = $row['final_total'] ?? $row['total_price'] ?? 0;
                
                $invoices[] = [
                    'invoiceNumber' => $invNumber,
                    'name' => $row['customer_name'],
                    'dateIssued' => $row['invoice_date'],
                    'totalAmount' => "₱" . number_format($grandTotal, 2),
                    'paymentStatus' => $row['payment_status'],
                    'handledBy' => $row['employee_name'] ?? "Staff",
                    'branch' => $row['branch'] ?? "Main",
                    'grandTotal' => $grandTotal,
                    'services' => []
                ];
                $index = count($invoices) - 1;
            }

            $serviceUnitPrice = $row['service_unit_price'] ?? $row['total_price'] ?? 0;

            $invoices[$index]['services'][] = [
                'name' => $row['service_name'],
                'price' => $serviceUnitPrice,
                'quantity' => 1, // Default to 1 if not available
                'total' => $serviceUnitPrice
            ];
        }

        // Calculate subtotal and total discount for each invoice
        foreach ($invoices as &$invoice) {
            $invoice['subtotal'] = array_sum(array_column($invoice['services'], 'total'));
            $invoice['totalDiscount'] = max(0, $invoice['subtotal'] - $invoice['grandTotal']);
            
            // Set default values for other fields
            $invoice['discountAmount'] = 0;
            $invoice['promoDiscount'] = 0;
            $invoice['membershipDiscount'] = 0;
            $invoice['membershipBalanceDeduction'] = 0;
        }

        echo json_encode($invoices);
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    error_log("Database error in getInvoices.php: " . $e->getMessage());
}