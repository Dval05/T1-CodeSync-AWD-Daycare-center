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

$p = new Permissions($_SESSION['user_id']);
$roles = $p->getUserRoles();
if (!(in_array('Administrator', $roles, true) || $_SESSION['user_id'] === 1)) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no válido']);
    exit;
}

$roleId = intval($_POST['RoleID'] ?? 0);
$permIds = $_POST['PermIDs'] ?? [];
if ($roleId <= 0 || !is_array($permIds)) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

// Limpiar permisos existentes
$stmt = $conn->prepare('DELETE FROM role_permission WHERE RoleID = ?');
$stmt->bind_param('i', $roleId);
$stmt->execute();
$stmt->close();

// Insertar nuevos
if (count($permIds) > 0) {
    $stmt = $conn->prepare('INSERT INTO role_permission (RoleID, PermID) VALUES (?, ?)');
    foreach ($permIds as $pid) {
        $pid = intval($pid);
        if ($pid <= 0) continue;
        $stmt->bind_param('ii', $roleId, $pid);
        $stmt->execute();
    }
    $stmt->close();
}

$db->closeConnection();

echo json_encode(['success' => true, 'message' => 'Permisos actualizados']);
?>

