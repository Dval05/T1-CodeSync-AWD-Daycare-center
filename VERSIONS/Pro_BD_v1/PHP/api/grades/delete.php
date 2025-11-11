<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'manage_grades')) { echo json_encode(['success'=>false,'message'=>'No autorizado']); exit; }

$id = intval($_POST['GradeID'] ?? 0);
if ($id <= 0) { echo json_encode(['success'=>false,'message'=>'GradeID requerido']); exit; }

$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare('DELETE FROM grade WHERE GradeID = ?');
$stmt->bind_param('i', $id);
$ok = $stmt->execute();
$stmt->close();
$db->closeConnection();
echo json_encode(['success'=>(bool)$ok]);
?>

