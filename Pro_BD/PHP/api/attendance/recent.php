<?php
// php/api/attendance/recent.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

if (!hasPermission($_SESSION['user_id'], 'view_attendance')) {
    echo json_encode(['error' => 'No tienes permiso para ver la asistencia.']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$studId = isset($_GET['studid']) ? intval($_GET['studid']) : 0;
$limit = 5; // Number of recent records to fetch

$attendanceRecords = [];

if ($studId > 0) {
    $stmt = $conn->prepare("
        SELECT a.Date, a.Status, e.FirstName, e.LastName
        FROM attendance a
        LEFT JOIN employee e ON a.EmpID = e.EmpID
        WHERE a.StudID = ?
        ORDER BY a.Date DESC
        LIMIT ?
    ");
    $stmt->bind_param("ii", $studId, $limit);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $row['EmployeeName'] = $row['FirstName'] . ' ' . $row['LastName'];
        unset($row['FirstName'], $row['LastName']);
        $attendanceRecords[] = $row;
    }
    $stmt->close();
}

$conn->close();
echo json_encode($attendanceRecords);
?>