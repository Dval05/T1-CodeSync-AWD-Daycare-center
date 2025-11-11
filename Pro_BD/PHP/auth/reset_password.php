<?php
require_once('../config/database.php');
require_once('../config/security.php');
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

$token = sanitize($_POST['token']);
$newPassword = $_POST['password'];
$hashed = hashPassword($newPassword);

// Buscar el usuario por token válido y no expirado
$query = "SELECT UserID FROM user WHERE PasswordResetToken = ? AND PasswordResetExpires > NOW()";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->bind_result($userID);

if ($stmt->fetch()) {
    // Actualiza la contraseña y limpia el token
    $update = "UPDATE user SET PasswordHash = ?, PasswordResetToken = NULL, PasswordResetExpires = NULL WHERE UserID = ?";
    $ustmt = $conn->prepare($update);
    $ustmt->bind_param("si", $hashed, $userID);
    if ($ustmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'msg' => 'No se pudo actualizar la contraseña']);
    }
    $ustmt->close();
} else {
    echo json_encode(['success' => false, 'msg' => 'Token inválido o expirado']);
}
$stmt->close();
$conn->close();
?>
