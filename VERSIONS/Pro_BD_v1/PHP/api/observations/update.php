<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'edit_observations')) { echo json_encode(['success'=>false,'message'=>'No autorizado']); exit; }

$id = intval($_POST['ObservationID'] ?? 0);
$text = trim($_POST['ObservationText'] ?? '');
$date = trim($_POST['ObservationDate'] ?? '');
if ($id <= 0 || $text === '') { echo json_encode(['success'=>false,'message'=>'Datos inválidos']); exit; }

$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare('UPDATE student_observation SET ObservationText = ?, ObservationDate = COALESCE(?, ObservationDate) WHERE ObservationID = ?');
$dateParam = $date !== '' ? $date : null;
$stmt->bind_param('ssi', $text, $dateParam, $id);
$ok = $stmt->execute();
$stmt->close();
$db->closeConnection();
echo json_encode(['success'=>(bool)$ok]);
?>

