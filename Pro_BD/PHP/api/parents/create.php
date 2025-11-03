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

$first = trim($_POST['FirstName'] ?? '');
$last = trim($_POST['LastName'] ?? '');
$doc = trim($_POST['DocumentNumber'] ?? '');
if ($first === '' || $last === '' || $doc === '') {
	echo json_encode(['success' => false, 'message' => 'Nombre, apellido y cédula requeridos.']);
	exit;
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare("INSERT INTO guardian (FirstName, LastName, DocumentNumber) VALUES (?, ?, ?)");
$stmt->bind_param('sss', $first, $last, $doc);
$ok = $stmt && $stmt->execute();
$id = $ok ? $conn->insert_id : null;
if ($stmt) $stmt->close();
$db->closeConnection();

echo json_encode(['success' => (bool)$ok, 'GuardID' => $id]);
?>

