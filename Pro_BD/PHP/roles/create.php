<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

$rolename = $_POST['RoleName'];
$desc = $_POST['Description'];
$query = "INSERT INTO role (RoleName, Description, IsActive, CreatedAt) VALUES (?, ?, 1, NOW())";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $rolename, $desc);
if ($stmt->execute()) {
    echo json_encode(['success'=>true, 'RoleID'=>$stmt->insert_id]);
} else {
    echo json_encode(['success'=>false, 'msg'=>$stmt->error]);
}
$stmt->close();
$conn->close();
?>
