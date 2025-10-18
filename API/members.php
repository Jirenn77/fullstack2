<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    function logMembershipAction($pdo, $data)
    {
        // DEBUG: Log what we received in logMembershipAction
        error_log("=== logMembershipAction START ===");
        error_log("logMembershipAction received data: " . json_encode($data));
        
        $stmt = $pdo->prepare("
            INSERT INTO membership_logs 
            (customer_id, membership_id, action, type, amount, payment_method, branch_id, performed_by, performed_by_name, timestamp)
            VALUES (:customer_id, :membership_id, :action, :type, :amount, :payment_method, :branch_id, :performed_by, :performed_by_name, :timestamp)
        ");
        
        $params = [
            ':customer_id' => $data['customer_id'],
            ':membership_id' => $data['membership_id'] ?? null,
            ':action' => $data['action'],
            ':type' => $data['type'],
            ':amount' => $data['amount'],
            ':payment_method' => $data['payment_method'],
            ':branch_id' => $data['branch_id'] ?? null,
            ':performed_by' => $data['performed_by'] ?? null,
            ':performed_by_name' => $data['performed_by_name'] ?? 'Unknown User',
            ':timestamp' => date('Y-m-d H:i:s')
        ];
        
        // DEBUG: Log the final parameters being executed
        error_log("logMembershipAction executing with params: " . json_encode($params));
        
        $stmt->execute($params);
        
        $lastId = $pdo->lastInsertId();
        error_log("logMembershipAction completed, inserted log ID: $lastId");
        error_log("=== logMembershipAction END ===\n");
        
        return $lastId;
    }

    // ================================
    // GET MEMBERSHIP(S)
    // ================================
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $queryParams = $_GET;

        // GET /memberships?customer_id=1
        if (isset($queryParams['customer_id'])) {
            $customerId = (int) $queryParams['customer_id'];

            $stmt = $pdo->prepare("
                SELECT *
                FROM memberships
                WHERE customer_id = :customer_id
                ORDER BY date_registered DESC, id DESC
            ");
            $stmt->bindValue(':customer_id', $customerId, PDO::PARAM_INT);
            $stmt->execute();
            $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Normalize each membership object: add membership_id, membershipId, and is_expired
            foreach ($memberships as &$membership) {
                // ensure int id available
                $membership['membership_id'] = isset($membership['id']) ? (int) $membership['id'] : null;
                $membership['membershipId'] = $membership['membership_id']; // camelCase alias

                // is_expired boolean
                if (!empty($membership['expire_date'])) {
                    $expireDate = new DateTime($membership['expire_date']);
                    $now = new DateTime();
                    $membership['is_expired'] = $expireDate < $now;
                } else {
                    $membership['is_expired'] = false;
                }

                // cast a couple useful numeric-ish fields for clarity
                if (isset($membership['coverage']))
                    $membership['coverage'] = (float) $membership['coverage'];
                if (isset($membership['remaining_balance']))
                    $membership['remaining_balance'] = (float) $membership['remaining_balance'];
            }

            // Debug log
            error_log("Memberships fetched for customer_id=$customerId: " . json_encode($memberships));

            echo json_encode($memberships); // Return array consistently
            exit;
        }


        // GET /memberships?expiring=7
        if (isset($queryParams['expiring'])) {
            $daysThreshold = (int) $queryParams['expiring'];
            $currentDate = date('Y-m-d');
            $futureDate = date('Y-m-d', strtotime("+$daysThreshold days"));

            $stmt = $pdo->prepare("
                SELECT m.*, c.name, c.contact, c.email
                FROM memberships m
                JOIN customers c ON m.customer_id = c.id
                WHERE m.expire_date IS NOT NULL
                  AND m.expire_date BETWEEN :current AND :future
                ORDER BY m.expire_date ASC
            ");
            $stmt->bindParam(':current', $currentDate);
            $stmt->bindParam(':future', $futureDate);
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        // GET /memberships - all
        $stmt = $pdo->prepare("
            SELECT 
                m1.*, 
                c.name, 
                c.contact, 
                c.email
            FROM memberships m1
            JOIN (
                SELECT customer_id, MAX(id) AS max_id
                FROM memberships
                GROUP BY customer_id
            ) m2 ON m1.customer_id = m2.customer_id AND m1.id = m2.max_id
            JOIN customers c ON m1.customer_id = c.id
            ORDER BY m1.date_registered DESC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // ================================
    // POST MEMBERSHIP (Create or Renew)
    // ================================
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // DEBUG: Log the incoming request
        error_log("=== members.php POST START ===");
        error_log("members.php POST received: " . json_encode($input));

        if (!isset($input['customer_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Customer ID is required']);
            exit;
        }

        $customerId = (int) $input['customer_id'];
        $membershipId = isset($input['membership_id']) ? (int) $input['membership_id'] : null;
        $action = $input['action'] ?? 'create';
        $type = strtolower($input['type'] ?? 'basic');
        $coverage = (float) ($input['coverage'] ?? 5000);
        $duration = (int) ($input['duration'] ?? 1); // for promo/vip
        $paymentMethod = $input['payment_method'] ?? 'cash';
        $note = $input['note'] ?? null;

        // Add user tracking fields
        $branchId = isset($input['branch_id']) && $input['branch_id'] !== '' ? (int) $input['branch_id'] : null;
        $performedBy = isset($input['performed_by']) && $input['performed_by'] !== '' ? (int) $input['performed_by'] : null;
        $performedByName = $input['performed_by_name'] ?? 'Unknown User';

        // DEBUG: Log the extracted user data
        error_log("Extracted user data - branch_id: " . ($branchId ?? 'NULL') . ", performed_by: " . ($performedBy ?? 'NULL') . ", performed_by_name: " . $performedByName);

        $currentDate = date('Y-m-d');

        // Only promo/vip types get expiration
        $expireDate = null;
        if (in_array($type, ['promo', 'vip'])) {
            if (!empty($input['expire_date'])) {
                $expireDate = $input['expire_date'];
            } else {
                $expireDate = date('Y-m-d', strtotime("+$duration months"));
            }
        }

        // ========================
        // RENEW MEMBERSHIP
        // ========================
        if ($action === 'renew' && $membershipId !== null) {
            error_log("Processing RENEW action for membership_id: $membershipId");
            
            // Get the current membership first
            $stmt = $pdo->prepare("SELECT type, remaining_balance FROM memberships WHERE id = :id");
            $stmt->execute([':id' => $membershipId]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$current) {
                http_response_code(404);
                echo json_encode(['error' => 'Membership not found']);
                exit;
            }

            // 🚫 Prevent renewal of promo memberships
            if (strtolower($current['type']) === 'promo') {
                http_response_code(400);
                echo json_encode(['error' => 'Promo memberships cannot be renewed because they have a fixed expiration.']);
                exit;
            }

            $oldRemaining = (float) $current['remaining_balance'];
            $newBalance = $oldRemaining + $coverage; // ✅ carry over old balance

            $stmt = $pdo->prepare("
                UPDATE memberships
                SET 
                    expire_date = :expire_date,
                    date_registered = :current_date,
                    remaining_balance = :remaining_balance,
                    type = :type,
                    coverage = :coverage
                WHERE customer_id = :customer_id AND id = :membership_id
            ");
            $stmt->execute([
                ':expire_date' => $expireDate,
                ':current_date' => $currentDate,
                ':remaining_balance' => $newBalance,
                ':type' => $type,
                ':coverage' => $coverage,
                ':customer_id' => $customerId,
                ':membership_id' => $membershipId
            ]);

            $logData = [
                'customer_id' => $customerId,
                'membership_id' => $membershipId,
                'action' => 'renewed',
                'type' => $type,
                'amount' => $coverage, // only log the new coverage
                'payment_method' => $paymentMethod,
                // Add user tracking to logs
                'branch_id' => $branchId,
                'performed_by' => $performedBy,
                'performed_by_name' => $performedByName
            ];
            
            // DEBUG: Log what we're passing to logMembershipAction
            error_log("Calling logMembershipAction for RENEW with: " . json_encode($logData));
            
            $logId = logMembershipAction($pdo, $logData);
            error_log("RENEW completed, log ID: $logId");

            $stmt = $pdo->prepare("SELECT * FROM memberships WHERE id = :id");
            $stmt->execute([':id' => $membershipId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("=== members.php RENEW END ===\n");
            echo json_encode($result);
            exit;
        } else {
            // ========================
            // CREATE MEMBERSHIP
            // ========================
            error_log("Processing CREATE action for new membership");
            
            $stmt = $pdo->prepare("
                INSERT INTO memberships 
                    (customer_id, type, coverage, remaining_balance, date_registered, expire_date)
                VALUES 
                    (:customer_id, :type, :coverage, :remaining_balance, :date_registered, :expire_date)
            ");
            $stmt->execute([
                ':customer_id' => $customerId,
                ':type' => $type,
                ':coverage' => $coverage,
                ':remaining_balance' => $coverage,
                ':date_registered' => $currentDate,
                ':expire_date' => $expireDate
            ]);

            $newId = $pdo->lastInsertId();
            error_log("Created new membership with ID: $newId");

            $logData = [
                'customer_id' => $customerId,
                'membership_id' => $newId,
                'action' => 'New member',
                'type' => $type,
                'amount' => $coverage,
                'payment_method' => $paymentMethod,
                // Add user tracking to logs
                'branch_id' => $branchId,
                'performed_by' => $performedBy,
                'performed_by_name' => $performedByName
            ];
            
            // DEBUG: Log what we're passing to logMembershipAction
            error_log("Calling logMembershipAction for CREATE with: " . json_encode($logData));
            
            $logId = logMembershipAction($pdo, $logData);
            error_log("CREATE completed, log ID: $logId");

            $stmt = $pdo->prepare("SELECT * FROM memberships WHERE id = :id");
            $stmt->execute([':id' => $newId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("=== members.php CREATE END ===\n");
            echo json_encode($result);
            exit;
        }
    }

    // Unsupported Method
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}