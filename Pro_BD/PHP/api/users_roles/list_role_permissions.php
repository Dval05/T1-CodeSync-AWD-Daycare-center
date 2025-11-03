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

$roleId = intval($_GET['RoleID'] ?? 0);
if ($roleId <= 0) {
    echo json_encode(['success' => false, 'message' => 'RoleID requerido']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare('SELECT PermID FROM role_permission WHERE RoleID = ?');
$stmt->bind_param('i', $roleId);
$stmt->execute();
$res = $stmt->get_result();
$permIds = [];
while ($row = $res->fetch_assoc()) { $permIds[] = intval($row['PermID']); }
$stmt->close();
$db->closeConnection();

echo json_encode(['success' => true, 'permIds' => $permIds]);
?>

