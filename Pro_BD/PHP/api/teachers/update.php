<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'manage_teachers')) {
	echo json_encode(['success' => false, 'message' => 'No autorizado']);
	exit;
}

$id = intval($_POST['EmpID'] ?? 0);
$first = trim($_POST['FirstName'] ?? '');
$last = trim($_POST['LastName'] ?? '');
$doc = trim($_POST['DocumentNumber'] ?? '');
if ($id <= 0 || $first === '' || $last === '') {
	echo json_encode(['success' => false, 'message' => 'ID, nombre y apellido requeridos.']);
	exit;
}

$db = new Database();
$conn = $db->getConnection();

$cols = [];
$res = $conn->query("SHOW COLUMNS FROM employee");
if ($res) { while ($row = $res->fetch_assoc()) { $cols[$row['Field']] = true; } }
if ($doc !== '' && isset($cols['DocumentNumber'])) {
	$stmt = $conn->prepare("UPDATE employee SET FirstName = ?, LastName = ?, DocumentNumber = ? WHERE EmpID = ?");
	$stmt->bind_param('sssi', $first, $last, $doc, $id);
} else {
	$stmt = $conn->prepare("UPDATE employee SET FirstName = ?, LastName = ? WHERE EmpID = ?");
	$stmt->bind_param('ssi', $first, $last, $id);
}
$ok = $stmt && $stmt->execute();
if ($stmt) $stmt->close();
$db->closeConnection();

echo json_encode(['success' => (bool)$ok, 'message' => $ok ? 'Maestro actualizado' : 'No se pudo actualizar']);
?>

