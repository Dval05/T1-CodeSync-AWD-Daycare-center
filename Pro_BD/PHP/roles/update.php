<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

$roleID = intval($_POST['RoleID']);
$roleName = $_POST['RoleName'];
$desc = $_POST['Description'];
$query = "UPDATE role SET RoleName=?, Description=?, UpdatedAt=NOW() WHERE RoleID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ssi", $roleName, $desc, $roleID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'msg'=>'No se pudo actualizar']);
}
$stmt->close();
$conn->close();
?>
