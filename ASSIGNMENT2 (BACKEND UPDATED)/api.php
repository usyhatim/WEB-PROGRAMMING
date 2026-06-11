<?php
error_reporting(0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

include "config.php";

$method = $_SERVER["REQUEST_METHOD"];
$id = isset($_GET["id"]) ? intval($_GET["id"]) : null;

function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function getInput() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function countWords($text) {
    $text = trim(strip_tags($text));
    if ($text === "") return 0;
    return str_word_count($text);
}
function getDocument($conn, $id) {
    $stmt = $conn->prepare("
        SELECT 
            id,
            title,
            content,
            category,
            display_date AS displayDate,
            word_count AS wordCount,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM documents
        WHERE id = ?
    ");

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    return $result->fetch_assoc();
}
if ($method === "GET") {
    if ($id) {
        $document = getDocument($conn, $id);

        if (!$document) {
            sendJson(["error" => "Document not found"], 404);
        }

        sendJson($document);
    }

    $sql = "
    SELECT 
        id,
        title,
        content,
        category,
        display_date AS displayDate,
        word_count AS wordCount,
        created_at AS createdAt,
        updated_at AS updatedAt
    FROM documents
    ORDER BY id DESC
";
    $result = $conn->query($sql);

    $documents = [];

    while ($row = $result->fetch_assoc()) {
        $documents[] = $row;
    }

    sendJson($documents);
}

if ($method === "POST") {
    $data = getInput();

    $title = trim($data["title"] ?? "");
    $content = trim($data["content"] ?? "");
    $category = trim($data["category"] ?? "research");
   $display_date = $data["displayDate"] ?? $data["display_date"] ?? date("M j, Y");
$word_count = isset($data["wordCount"]) 
    ? intval($data["wordCount"]) 
    : (isset($data["word_count"]) ? intval($data["word_count"]) : countWords($content));
    if ($title === "") {
        sendJson(["error" => "Title is required"], 400);
    }

    $stmt = $conn->prepare("
        INSERT INTO documents (title, content, category, display_date, word_count)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->bind_param("ssssi", $title, $content, $category, $display_date, $word_count);

    if (!$stmt->execute()) {
        sendJson(["error" => "Failed to create document"], 500);
    }

    $newId = $conn->insert_id;
    sendJson(getDocument($conn, $newId), 201);
}

if ($method === "PUT" && $id) {
    $data = getInput();

    $title = trim($data["title"] ?? "");
    $content = trim($data["content"] ?? "");
    $category = trim($data["category"] ?? "research");
  $display_date = $data["displayDate"] ?? $data["display_date"] ?? date("M j, Y");
$word_count = isset($data["wordCount"]) 
    ? intval($data["wordCount"]) 
    : (isset($data["word_count"]) ? intval($data["word_count"]) : countWords($content));
    if ($title === "") {
        sendJson(["error" => "Title is required"], 400);
    }

    $stmt = $conn->prepare("
        UPDATE documents
        SET title = ?, content = ?, category = ?, display_date = ?, word_count = ?
        WHERE id = ?
    ");

    $stmt->bind_param("ssssii", $title, $content, $category, $display_date, $word_count, $id);

    if (!$stmt->execute()) {
        sendJson(["error" => "Failed to update document"], 500);
    }

    sendJson(getDocument($conn, $id));
}

if ($method === "DELETE" && $id) {
    $stmt = $conn->prepare("DELETE FROM documents WHERE id = ?");
    $stmt->bind_param("i", $id);

    if (!$stmt->execute()) {
        sendJson(["error" => "Failed to delete document"], 500);
    }

    sendJson([
        "success" => true,
        "message" => "Document deleted"
    ]);
}

sendJson(["error" => "Invalid request"], 400);
?>