<?php
// php/api/students/get.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php'; // For permission checking

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

// Example permission check (adjust as needed, e.g., 'view_student_details')
if (!hasPermission($_SESSION['user_id'], 'view_students')) {
    echo json_encode(['error' => 'No tienes permiso para ver los detalles de los estudiantes.']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$studId = isset($_GET['id']) ? intval($_GET['id']) : 0;

$response = ['student' => null, 'guardians' => []];

if ($studId > 0) {
    // Get student details
    $stmt = $conn->prepare("SELECT s.StudID, s.FirstName, s.LastName, s.GradeID, g.Name AS GradeName
                            FROM student s
                            LEFT JOIN grade g ON s.GradeID = g.GradeID
                            WHERE s.StudID = ?");
    $stmt->bind_param("i", $studId);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['student'] = $result->fetch_assoc();
    $stmt->close();

    // Get guardians
    $stmt = $conn->prepare("SELECT gu.GuardID, gu.FirstName, gu.LastName
                            FROM student_guardian sg
                            JOIN guardian gu ON sg.GuardID = gu.GuardID
                            WHERE sg.StudID = ?");
    $stmt->bind_param("i", $studId);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $response['guardians'][] = $row;
    }
    $stmt->close();
}

$conn->close();
echo json_encode($response);
?>