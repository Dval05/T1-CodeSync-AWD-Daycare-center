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

$first = trim($_POST['FirstName'] ?? '');
$last = trim($_POST['LastName'] ?? '');
$doc = trim($_POST['DocumentNumber'] ?? '');
if ($first === '' || $last === '') {
	echo json_encode(['success' => false, 'message' => 'Nombre y apellido requeridos.']);
	exit;
}

$db = new Database();
$conn = $db->getConnection();

// Insert con DocumentNumber si existe
$cols = [];
$res = $conn->query("SHOW COLUMNS FROM employee");
if ($res) { while ($row = $res->fetch_assoc()) { $cols[$row['Field']] = true; } }
if ($doc !== '' && isset($cols['DocumentNumber'])) {
	$stmt = $conn->prepare("INSERT INTO employee (FirstName, LastName, DocumentNumber) VALUES (?, ?, ?)");
	$stmt->bind_param('sss', $first, $last, $doc);
} else {
	$stmt = $conn->prepare("INSERT INTO employee (FirstName, LastName) VALUES (?, ?)");
	$stmt->bind_param('ss', $first, $last);
}
$ok = $stmt && $stmt->execute();
$id = $ok ? $conn->insert_id : null;
if ($stmt) $stmt->close();
$db->closeConnection();

echo json_encode(['success' => (bool)$ok, 'EmpID' => $id, 'message' => $ok ? 'Maestro creado' : 'No se pudo crear']);
?>

