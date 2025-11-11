<?php
// php/api/grades/list.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

// Example permission check
if (!hasPermission($_SESSION['user_id'], 'manage_grades') && !hasPermission($_SESSION['user_id'], 'manage_students')) {
    echo json_encode(['error' => 'No tienes permiso para listar grados.']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$grades = [];
$query = "SELECT GradeID, Name FROM grade ORDER BY Name ASC";
$result = $conn->query($query);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $grades[] = $row;
    }
}

$conn->close();
echo json_encode($grades);
?>