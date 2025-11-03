<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'send_messages')) { echo json_encode(['success'=>false,'message'=>'No autorizado']); exit; }

$to = intval($_POST['ReceiverID'] ?? 0);
$msg = trim($_POST['Message'] ?? '');
if ($to<=0 || $msg==='') { echo json_encode(['success'=>false,'message'=>'Datos inválidos']); exit; }
$from = $_SESSION['user_id'];

$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare('INSERT INTO notification (SenderID, ReceiverID, Message) VALUES (?, ?, ?)');
$stmt->bind_param('iis', $from, $to, $msg);
$ok = $stmt->execute();
$stmt->close();
$db->closeConnection();
echo json_encode(['success'=>(bool)$ok]);
?>

