<?php

$host = "localhost";
$user = "newsdb"; // Change this to your MySQL username
$password = ""; // Change this to your MySQL password
$database = ""; // Change this to your MySQL database name

$conn = mysqli_connect($host, $user, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

echo "Connected successfully";
?>
