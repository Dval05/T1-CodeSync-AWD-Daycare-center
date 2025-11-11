<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
$userID = intval($_POST['UserID']);
$query = "UPDATE user SET IsActive=0, UpdatedAt=NOW() WHERE UserID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'msg'=>'No se pudo eliminar']);
}
$stmt->close();
$conn->close();
?>
