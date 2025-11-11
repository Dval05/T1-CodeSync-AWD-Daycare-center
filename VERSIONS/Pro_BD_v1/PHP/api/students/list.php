<?php
// php/api/students/list.php
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

$student_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);

$response = ['success' => false, 'message' => ''];

try {
    if ($student_id) {
        // Fetch specific student details
        $stmt = $conn->prepare("
            SELECT
                s.StudID,
                s.FirstName,
                s.LastName,
                s.GradeID,
                g.Name AS GradeName -- Join to get Grade Name
            FROM student s
            LEFT JOIN grade g ON s.GradeID = g.GradeID
            WHERE s.StudID = ?
        ");
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta de estudiante: " . $conn->error);
        }
        $stmt->bind_param("i", $student_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $student = $result->fetch_assoc();
        $stmt->close();

        if ($student) {
            // Fetch associated guardians
            $guardian_stmt = $conn->prepare("
                SELECT
                    gu.GuardID,
                    gu.FirstName AS GuardianFirstName,
                    gu.LastName AS GuardianLastName,
                    u.Email AS GuardianEmail
                FROM student_guardian sg
                JOIN guardian gu ON sg.GuardID = gu.GuardID
                LEFT JOIN user u ON gu.UserID = u.UserID
                WHERE sg.StudID = ?
            ");
            if ($guardian_stmt === false) {
                throw new Exception("Error al preparar la consulta de tutores: " . $conn->error);
            }
            $guardian_stmt->bind_param("i", $student_id);
            $guardian_stmt->execute();
            $guardian_result = $guardian_stmt->get_result();
            $student['guardians'] = $guardian_result->fetch_all(MYSQLI_ASSOC);
            $guardian_stmt->close();

            $response = ['success' => true, 'student' => $student];
        } else {
            $response = ['success' => false, 'message' => 'Estudiante no encontrado.'];
        }
    } else {
        // Fetch all students (e.g., for a table list)
        $stmt = $conn->prepare("
            SELECT
                s.StudID,
                s.FirstName,
                s.LastName,
                s.GradeID,
                g.Name AS GradeName -- Join to get Grade Name
            FROM student s
            LEFT JOIN grade g ON s.GradeID = g.GradeID
            ORDER BY s.LastName, s.FirstName
        ");
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta de estudiantes: " . $conn->error);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $students = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        $response = ['success' => true, 'students' => $students];
    }
} catch (Exception $e) {
    error_log("Error in students/list.php: " . $e->getMessage());
    $response = ['success' => false, 'message' => 'Error interno del servidor al obtener estudiantes.'];
} finally {
    $db_instance->closeConnection();
}

echo json_encode($response);
?>