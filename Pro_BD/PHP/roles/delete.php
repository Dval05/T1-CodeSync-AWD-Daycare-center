<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

$roleID = intval($_POST['RoleID']);
$query = "UPDATE role SET IsActive=0, UpdatedAt=NOW() WHERE RoleID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $roleID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'msg'=>'No se pudo eliminar']);
}
$stmt->close();
$conn->close();
?>
