<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

$roleID = intval($_GET['RoleID']);
$query = "SELECT p.PermissionID, p.PermissionName, p.Module, p.Action, p.Description 
          FROM rolepermission rp 
          JOIN permission p ON rp.PermissionID=p.PermissionID
          WHERE rp.RoleID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $roleID);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
$stmt->close();
$conn->close();
?>
