<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "news_editor";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database connection failed",
        "message" => $conn->connect_error
    ]);
    exit;
}

$conn->set_charset("utf8mb4");
?>