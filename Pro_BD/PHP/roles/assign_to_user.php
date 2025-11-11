<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

$userID = intval($_POST['UserID']);
$roleID = intval($_POST['RoleID']);
$assignedBy = intval($_POST['AssignedBy']);
$query = "INSERT INTO userrole (UserID, RoleID, AssignedAt, AssignedBy) VALUES (?, ?, NOW(), ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("iii", $userID, $roleID, $assignedBy);
if ($stmt->execute()) {
    echo json_encode(['success'=>true, 'UserRoleID'=>$stmt->insert_id]);
} else {
    echo json_encode(['success'=>false, 'msg'=>$stmt->error]);
}
$stmt->close();
$conn->close();
?>
