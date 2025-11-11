<?php
require_once('../config/database.php');
require_once('../config/security.php');
require_once('../middleware/auth_middleware.php');

$username = sanitize($_POST['UserName']);
$email = sanitize($_POST['Email']);
$firstname = sanitize($_POST['FirstName']);
$lastname = sanitize($_POST['LastName']);
$phone = sanitize($_POST['Phone']);
$address = sanitize($_POST['Address']);
$password = hashPassword($_POST['Password']);

$query = "INSERT INTO user (UserName, PasswordHash, Email, FirstName, LastName, Phone, Address, IsActive, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())";
$stmt = $conn->prepare($query);
$stmt->bind_param("sssssss", $username, $password, $email, $firstname, $lastname, $phone, $address);
if($stmt->execute()){
    echo json_encode(['success'=>true,'UserID'=>$stmt->insert_id]);
} else {
    echo json_encode(['success'=>false,'msg'=>$stmt->error]);
}
$stmt->close();
$conn->close();
?>
