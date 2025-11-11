<?php
require_once('../config/database.php');
require_once('../config/security.php');
require_once('../middleware/auth_middleware.php');
$userID = intval($_POST['UserID']);
$firstname = sanitize($_POST['FirstName']);
$lastname = sanitize($_POST['LastName']);
$phone = sanitize($_POST['Phone']);
$address = sanitize($_POST['Address']);
$email = sanitize($_POST['Email']);

$query = "UPDATE user SET FirstName=?, LastName=?, Phone=?, Address=?, Email=?, UpdatedAt=NOW() WHERE UserID=?";
$stmt = $conn->prepare($query);
$stmt->bind_param("sssssi", $firstname, $lastname, $phone, $address, $email, $userID);
if ($stmt->execute()) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'msg'=>'No se pudo actualizar']);
}
$stmt->close();
$conn->close();
?>
