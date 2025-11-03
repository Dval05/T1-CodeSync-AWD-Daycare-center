<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'edit_activities')) { echo json_encode(['success'=>false,'message'=>'No autorizado']); exit; }

$id = intval($_POST['ActivityID'] ?? 0);
$name = trim($_POST['Name'] ?? '');
$gradeId = intval($_POST['GradeID'] ?? 0) ?: null;
$empId = intval($_POST['EmpID'] ?? 0) ?: null;
if ($id<=0 || $name==='') { echo json_encode(['success'=>false,'message'=>'Datos inválidos']); exit; }

$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare('UPDATE activity SET Name = ?, GradeID = ?, EmpID = ? WHERE ActivityID = ?');
$stmt->bind_param('siii', $name, $gradeId, $empId, $id);
$ok = $stmt->execute();
$stmt->close();
$db->closeConnection();
echo json_encode(['success'=>(bool)$ok]);
?>

