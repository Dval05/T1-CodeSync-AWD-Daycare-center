<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'create_activities')) { echo json_encode(['success'=>false,'message'=>'No autorizado']); exit; }

$name = trim($_POST['Name'] ?? '');
$gradeId = intval($_POST['GradeID'] ?? 0) ?: null;
$empId = intval($_POST['EmpID'] ?? 0) ?: null;
if ($name === '') { echo json_encode(['success'=>false,'message'=>'Nombre requerido']); exit; }

$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare('INSERT INTO activity (Name, GradeID, EmpID) VALUES (?, ?, ?)');
$stmt->bind_param('sii', $name, $gradeId, $empId);
$ok = $stmt->execute();
$id = $ok ? $conn->insert_id : null;
$stmt->close();
$db->closeConnection();
echo json_encode(['success'=>(bool)$ok, 'ActivityID'=>$id]);
?>

