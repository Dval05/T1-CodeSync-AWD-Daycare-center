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
$firstname = sanitize($_POST['FirstName']);
$lastname = sanitize($_POST['LastName']);
$phone = sanitize($_POST['Phone']);
$address = sanitize($_POST['Address']);

$query = "UPDATE user SET FirstName=?, LastName=?, Phone=?, Address=?, UpdatedAt=NOW() WHERE UserID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ssssi", $firstname, $lastname, $phone, $address, $userID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'msg'=>'No se pudo actualizar']);
}
$stmt->close();
$conn->close();
?>
