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

// Solo admin puede listar roles
$p = new Permissions($_SESSION['user_id']);
$roles = $p->getUserRoles();
if (!(in_array('Administrator', $roles, true) || $_SESSION['user_id'] === 1)) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare('SELECT RoleID, Name FROM role ORDER BY RoleID ASC');
$stmt->execute();
$result = $stmt->get_result();
$rows = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$db->closeConnection();

echo json_encode(['success' => true, 'roles' => $rows]);
?>

