<?php
// php/api/students/delete.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';
require_once '../../controllers/StudentController.php';

header('Content-Type: application/json');

// Check if user is logged in and has permission to delete students
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'delete_students')) { // Define 'delete_students' permission
    echo json_encode(['success' => false, 'message' => 'No autorizado para eliminar estudiantes.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $studId = $_POST['StudID'] ?? null;

    if (empty($studId)) {
        echo json_encode(['success' => false, 'message' => 'ID del estudiante es requerido.']);
        exit;
    }

    $studentController = new StudentController();
    $result = $studentController->deleteStudent($studId);
    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido.']);
}
?>