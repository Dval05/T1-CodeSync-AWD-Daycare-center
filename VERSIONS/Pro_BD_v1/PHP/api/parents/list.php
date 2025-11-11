<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'view_parents')) {
	echo json_encode(['success' => false, 'message' => 'No autorizado']);
	exit;
}

$db = new Database();
$conn = $db->getConnection();
$cols = [];
$res = $conn->query("SHOW COLUMNS FROM guardian");
if ($res) { while ($row = $res->fetch_assoc()) { $cols[$row['Field']] = true; } }
$select = "GuardID, FirstName, LastName" . (isset($cols['DocumentNumber'])? ", DocumentNumber" : "");
$stmt = $conn->prepare("SELECT $select FROM guardian ORDER BY LastName, FirstName");
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$db->closeConnection();
echo json_encode(['success' => true, 'parents' => $rows]);
?>

