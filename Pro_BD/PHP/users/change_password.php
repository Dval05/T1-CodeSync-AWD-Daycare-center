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
$oldPassword = $_POST['oldPassword'];
$newPassword = $_POST['newPassword'];

$query = "SELECT PasswordHash FROM user WHERE UserID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userID);
$stmt->execute();
$stmt->bind_result($hash);
$stmt->fetch();
$stmt->close();

if (!verifyPassword($oldPassword, $hash)) {
    echo json_encode(['success'=>false, 'msg'=>'Clave actual incorrecta']);
    exit();
}
$hashed = hashPassword($newPassword);
$query = "UPDATE user SET PasswordHash=? WHERE UserID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("si", $hashed, $userID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'msg'=>'No se pudo actualizar la clave']);
}
$stmt->close();
$conn->close();
?>
