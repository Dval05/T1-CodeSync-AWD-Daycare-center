<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
$query = "SELECT PermissionID, PermissionName, Module, Action, Description, CreatedAt FROM permission";
$result = $conn->query($query);
$data = [];
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
$conn->close();
?>
