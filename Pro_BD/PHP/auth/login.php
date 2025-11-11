<?php
require_once('../config/database.php');
require_once('../config/security.php');

header('Content-Type: application/json');

// Maneja datos POST o JSON
if (empty($_POST)) {
	$data = json_decode(file_get_contents("php://input"), true);
	$username = isset($data['username']) ? $data['username'] : '';
	$password = isset($data['password']) ? $data['password'] : '';
	$rememberMe = !empty($data['rememberMe']);
} else {
	$username = isset($_POST['username']) ? $_POST['username'] : '';
	$password = isset($_POST['password']) ? $_POST['password'] : '';
	$rememberMe = !empty($_POST['rememberMe']);
}

// Búsqueda del usuario
$query = "SELECT UserID, UserName, PasswordHash, IsActive FROM user WHERE UserName = ? LIMIT 1";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
	$stmt->bind_result($userID, $realUserName, $hash, $isActive);
	$stmt->fetch();

	if (!$isActive) {
		echo json_encode(['success' => false, 'msg' => 'Usuario inactivo']);
		$stmt->close();
		$conn->close();
		exit;
	}

	if (password_verify($password, $hash)) {
		// Opcional: actualizar última conexión
		$upd = $conn->prepare("UPDATE user SET LastLogin = NOW() WHERE UserID = ?");
		$upd->bind_param("i", $userID);
		$upd->execute();
		$upd->close();

		// Obtener primer rol activo (si existe) para retorno rápido
		$roleName = null;
		$rq = $conn->prepare("SELECT r.RoleName 
			FROM user_role ur 
			JOIN role r ON ur.RoleID = r.RoleID 
			WHERE ur.UserID = ? AND r.IsActive = 1 
			ORDER BY ur.AssignedAt DESC LIMIT 1");
		$rq->bind_param("i", $userID);
		$rq->execute();
		$rq->bind_result($roleNameTmp);
		if ($rq->fetch()) { $roleName = $roleNameTmp; }
		$rq->close();

		// Emitir token y guardar en tabla session
		$token = bin2hex(random_bytes(32));
		$expiresHours = $rememberMe ? 168 : 8; // 7 días si recuerda, 8 horas caso normal
		$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
		$ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : null;

		$ins = $conn->prepare("INSERT INTO session (UserID, Token, IPAddress, UserAgent, ExpiresAt) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))");
		$ins->bind_param("isssi", $userID, $token, $ip, $ua, $expiresHours);
		$ins->execute();
		$ins->close();

		echo json_encode([
			'success' => true,
			'token' => $token,
			'userId' => $userID,
			'userName' => $realUserName,
			'role' => $roleName
		]);
	} else {
		echo json_encode(['success' => false, 'msg' => 'Usuario o contraseña incorrectos']);
	}
} else {
	echo json_encode(['success' => false, 'msg' => 'Usuario o contraseña incorrectos']);
}

$stmt->close();
$conn->close();
?>
