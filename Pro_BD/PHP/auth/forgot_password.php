<?php
require_once('../config/database.php');
require_once('../config/security.php');
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

$email = sanitize($_POST['email']);
$query = "SELECT UserID FROM user WHERE Email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $token = bin2hex(random_bytes(24));
    // aquí deberías guardar el token temporal en una tabla (reset_token)
    // y enviar link de recuperación al correo
    echo json_encode(['success' => true, 'token' => $token]);
} else {
    echo json_encode(['success' => false, 'msg' => 'Email not registered']);
}
?>
