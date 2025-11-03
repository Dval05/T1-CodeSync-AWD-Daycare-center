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
$first = trim($_POST['FirstName'] ?? '');
$last = trim($_POST['LastName'] ?? '');
$doc = trim($_POST['DocumentNumber'] ?? '');
if ($id <= 0 || $first === '' || $last === '' || $doc === '') {
	echo json_encode(['success' => false, 'message' => 'ID, nombre, apellido y cédula requeridos.']);
	exit;
}

$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare("UPDATE guardian SET FirstName = ?, LastName = ?, DocumentNumber = ? WHERE GuardID = ?");
$stmt->bind_param('sssi', $first, $last, $doc, $id);
$ok = $stmt && $stmt->execute();
if ($stmt) $stmt->close();
$db->closeConnection();

echo json_encode(['success' => (bool)$ok]);
?>

