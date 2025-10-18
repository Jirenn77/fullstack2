<?php

header("Content-Type: application/json; charset=UTF-8");

// Log raw data received
$raw_data = file_get_contents("php://input");
error_log("Raw Data: " . $raw_data);

// Decode the JSON and check for errors
$data = json_decode($raw_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'error' => 'Invalid JSON input',
        'json_error' => json_last_error_msg(),
        'raw_data' => $raw_data
    ]);
    exit;
}

// If valid JSON
echo json_encode(['success' => 'Valid JSON received', 'data' => $data]);
