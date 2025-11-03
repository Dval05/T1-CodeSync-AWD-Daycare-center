<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

// Solo admin puede crear roles
$p = new Permissions($_SESSION['user_id']);
$roles = $p->getUserRoles();
if (!(in_array('Administrator', $roles, true) || $_SESSION['user_id'] === 1)) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$name = trim($_POST['Name'] ?? '');
if ($name === '') {
    echo json_encode(['success' => false, 'message' => 'Nombre de rol requerido']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

// Validar duplicado
$stmt = $conn->prepare('SELECT COUNT(*) AS cnt FROM role WHERE Name = ?');
$stmt->bind_param('s', $name);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stmt->close();
if ((int)$res['cnt'] > 0) {
    $db->closeConnection();
    echo json_encode(['success' => false, 'message' => 'El rol ya existe']);
    exit;
}

$stmt = $conn->prepare('INSERT INTO role (Name) VALUES (?)');
$stmt->bind_param('s', $name);
$ok = $stmt->execute();
$newId = $conn->insert_id;
$stmt->close();
$db->closeConnection();

echo json_encode(['success' => $ok, 'RoleID' => $newId, 'message' => $ok ? 'Rol creado' : 'No se pudo crear el rol']);
?>

