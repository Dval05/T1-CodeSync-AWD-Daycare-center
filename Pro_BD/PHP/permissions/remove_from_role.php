<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
$roleID = intval($_POST['RoleID']);
$permID = intval($_POST['PermissionID']);
$query = "DELETE FROM rolepermission WHERE RoleID=? AND PermissionID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $roleID, $permID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'msg'=>'No se pudo eliminar permiso']);
}
$stmt->close();
$conn->close();
?>
