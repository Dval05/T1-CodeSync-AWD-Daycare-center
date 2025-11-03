<?php
// php/api/attendance/daily_report.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Acceso denegado. No autenticado.']);
    exit();
}

$db_instance = new Database();
$conn = $db_instance->getConnection();

$date = filter_input(INPUT_GET, 'date', FILTER_SANITIZE_STRING); // Expected format: YYYY-MM-DD

if (empty($date)) {
    // If no date is provided, default to today
    $date = date('Y-m-d');
}

$response = ['success' => false, 'message' => ''];

try {
    // Join with student and employee tables to get names
    $stmt = $conn->prepare("
        SELECT
            a.AttendanceID,
            a.Date,
            a.Status,
            s.StudID,
            s.FirstName AS StudentFirstName,
            s.LastName AS StudentLastName,
            g.Name AS GradeName,
            e.EmpID,
            e.FirstName AS EmployeeFirstName,
            e.LastName AS EmployeeLastName
        FROM attendance a
        JOIN student s ON a.StudID = s.StudID
        LEFT JOIN grade g ON s.GradeID = g.GradeID
        JOIN employee e ON a.EmpID = e.EmpID
        WHERE a.Date = ?
        ORDER BY s.LastName, s.FirstName
    ");

    if ($stmt === false) {
        throw new Exception("Error al preparar la consulta del reporte diario: " . $conn->error);
    }

    $stmt->bind_param("s", $date);
    $stmt->execute();
    $result = $stmt->get_result();
    $report_data = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $response = ['success' => true, 'date' => $date, 'report' => $report_data];

} catch (Exception $e) {
    error_log("Error in attendance/daily_report.php: " . $e->getMessage());
    $response = ['success' => false, 'message' => 'Error interno del servidor al obtener el reporte diario de asistencia.'];
} finally {
    $db_instance->closeConnection();
}

echo json_encode($response);
?>