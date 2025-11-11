<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
$query = "SELECT UserID, UserName, Email, FirstName, LastName, Phone, Address, IsActive, LastLogin FROM user";
$result = $conn->query($query);
$data = [];
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
$conn->close();
?>
