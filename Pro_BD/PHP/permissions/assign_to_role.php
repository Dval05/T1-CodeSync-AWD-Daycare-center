<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
$roleID = intval($_POST['RoleID']);
$permID = intval($_POST['PermissionID']);
$query = "INSERT INTO rolepermission (RoleID, PermissionID, GrantedAt) VALUES (?, ?, NOW())";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $roleID, $permID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true, 'RolePermissionID'=>$stmt->insert_id]);
} else {
    echo json_encode(['success'=>false, 'msg'=>$stmt->error]);
}
$stmt->close();
$conn->close();
?>
