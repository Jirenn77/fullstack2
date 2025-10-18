<?php

// Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Start session
session_start();

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_GET['action'] ?? '';
    $employeeId = $_GET['id'] ?? null;

    switch ($action) {
        case 'add':
            handleAddEmployee($pdo);
            break;
        case 'update':
            handleUpdateEmployee($pdo, $employeeId);
            break;
        case 'delete':
            handleDeleteEmployee($pdo, $employeeId);
            break;
        case 'get':
            handleGetEmployee($pdo, $employeeId);
            break;
        case 'employees':
        default:
            if ($employeeId) {
                handleGetEmployee($pdo, $employeeId);
            } else {
                $employees = getEmployeesData($pdo);
                echo json_encode($employees);
            }
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

// Fetch All Employees
function getEmployeesData($pdo) {
    $query = "SELECT 
                e.id, 
                e.name, 
                e.service, 
                e.email, 
                e.phone, 
                DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hireDate,
                e.contact_details as contactDetails,
                e.status,
                b.name as branchName
              FROM employees e
              LEFT JOIN branches b ON e.branch_id = b.id";
    $stmt = $pdo->query($query);

    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $result[] = $row;
    }

    return $result;
}

// Get Single Employee
function handleGetEmployee($pdo, $employeeId) {
    if (!$employeeId) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID is required']);
        return;
    }

    $stmt = $pdo->prepare("
        SELECT 
            e.id, 
            e.name, 
            e.service, 
            e.email, 
            e.phone, 
            DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hireDate,
            e.contact_details as contactDetails,
            e.status,
            b.name as branchName,
            b.id as branchId
        FROM employees e
        LEFT JOIN branches b ON e.branch_id = b.id
        WHERE e.id = ?
    ");
    $stmt->execute([$employeeId]);
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($employee) {
        echo json_encode($employee);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Employee not found']);
    }
}

// Add New Employee
function handleAddEmployee($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['name']) || !isset($data['service'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and service are required']);
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO employees 
            (name, service, email, phone, hire_date, contact_details, status, branch_id) 
        VALUES 
            (:name, :service, :email, :phone, :hireDate, :contactDetails, :status, :branchId)
    ");

    try {
        $stmt->execute([
            ':name' => $data['name'],
            ':service' => $data['service'],
            ':email' => $data['email'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':hireDate' => $data['hireDate'] ?? null,
            ':contactDetails' => $data['contactDetails'] ?? null,
            ':status' => $data['status'] ?? 'Active',
            ':branchId' => $data['branchId'] ?? null
        ]);

        $newEmployeeId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("
            SELECT 
                e.id, 
                e.name, 
                e.service, 
                e.email, 
                e.phone, 
                DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hireDate,
                e.contact_details as contactDetails,
                e.status,
                b.name as branchName
            FROM employees e
            LEFT JOIN branches b ON e.branch_id = b.id
            WHERE e.id = ?
        ");
        $stmt->execute([$newEmployeeId]);
        $newEmployee = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(201);
        echo json_encode($newEmployee);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add employee: ' . $e->getMessage()]);
    }
}

// Update Employee
function handleUpdateEmployee($pdo, $employeeId) {
    if (!$employeeId) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID is required']);
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
    $params = [':id' => $employeeId];
    
    if (isset($data['name'])) {
        $fields[] = 'name = :name';
        $params[':name'] = $data['name'];
    }
    
    if (isset($data['service'])) {
        $fields[] = 'service = :service';
        $params[':service'] = $data['service'];
    }
    
    if (isset($data['email'])) {
        $fields[] = 'email = :email';
        $params[':email'] = $data['email'];
    }
    
    if (isset($data['phone'])) {
        $fields[] = 'phone = :phone';
        $params[':phone'] = $data['phone'];
    }
    
    if (isset($data['hireDate'])) {
        $fields[] = 'hire_date = :hireDate';
        $params[':hireDate'] = $data['hireDate'];
    }
    
    if (isset($data['contactDetails'])) {
        $fields[] = 'contact_details = :contactDetails';
        $params[':contactDetails'] = $data['contactDetails'];
    }
    
    if (isset($data['status'])) {
        $fields[] = 'status = :status';
        $params[':status'] = $data['status'];
    }
    
    if (isset($data['branchId'])) {
        $fields[] = 'branch_id = :branchId';
        $params[':branchId'] = $data['branchId'];
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields provided for update']);
        return;
    }

    $sql = "UPDATE employees SET " . implode(', ', $fields) . " WHERE id = :id";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            // Return the updated employee data
            $stmt = $pdo->prepare("
                SELECT 
                    e.id, 
                    e.name, 
                    e.service, 
                    e.email, 
                    e.phone, 
                    DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hireDate,
                    e.contact_details as contactDetails,
                    e.status,
                    b.name as branchName
                FROM employees e
                LEFT JOIN branches b ON e.branch_id = b.id
                WHERE e.id = ?
            ");
            $stmt->execute([$employeeId]);
            $updatedEmployee = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Employee updated successfully',
                'employee' => $updatedEmployee
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Employee not found or no changes made']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update employee: ' . $e->getMessage()]);
    }
}

// Delete Employee
function handleDeleteEmployee($pdo, $employeeId) {
    if (!$employeeId) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID is required']);
        return;
    }

    // Check if employee exists
    $checkStmt = $pdo->prepare("SELECT id FROM employees WHERE id = ?");
    $checkStmt->execute([$employeeId]);
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Employee not found']);
        return;
    }

    // Delete the employee
    $deleteStmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
    
    try {
        $deleteStmt->execute([$employeeId]);
        
        if ($deleteStmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Employee not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete employee: ' . $e->getMessage()]);
    }
}