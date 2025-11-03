<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'view_teachers')) {
	echo json_encode(['success' => false, 'message' => 'No autorizado']);
	exit;
}

$db = new Database();
$conn = $db->getConnection();

$cols = [];
$res = $conn->query("SHOW COLUMNS FROM employee");
if ($res) { while ($row = $res->fetch_assoc()) { $cols[$row['Field']] = true; } }
$select = "EmpID, FirstName, LastName" . (isset($cols['DocumentNumber'])? ", DocumentNumber" : "");

$stmt = $conn->prepare("SELECT $select FROM employee ORDER BY LastName, FirstName");
$stmt->execute();
$result = $stmt->get_result();
$rows = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$db->closeConnection();

echo json_encode(['success' => true, 'teachers' => $rows]);
?>

