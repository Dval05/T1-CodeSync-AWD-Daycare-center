<?php
require_once('../config/database.php');
require_once('../config/security.php');
require_once('../middleware/auth_middleware.php');
session_start();

if (!isset($_SESSION['UserID'])) {
    echo json_encode(['success'=>false, 'msg'=>'No autenticado']);
    exit();
}

$userID = $_SESSION['UserID'];
$query = "SELECT UserID, UserName, Email, FirstName, LastName, Phone, Address, IsActive, LastLogin, CreatedAt, UpdatedAt
          FROM user WHERE UserID = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userID);
$stmt->execute();
$result = $stmt->get_result();
echo json_encode($result->fetch_assoc());
$stmt->close();
$conn->close();
?>
