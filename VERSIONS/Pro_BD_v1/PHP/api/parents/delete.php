<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'manage_parents')) {
	echo json_encode(['success' => false, 'message' => 'No autorizado']);
	exit;
}

$id = intval($_POST['GuardID'] ?? 0);
if ($id <= 0) { echo json_encode(['success' => false, 'message' => 'GuardID requerido']); exit; }

$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare("DELETE FROM guardian WHERE GuardID = ?");
$stmt->bind_param('i', $id);
$ok = $stmt->execute();
$stmt->close();
$db->closeConnection();
echo json_encode(['success' => (bool)$ok]);
?>

