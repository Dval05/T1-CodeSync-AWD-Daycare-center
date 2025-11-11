<?php
// php/api/students/update.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';
require_once '../../controllers/StudentController.php';

header('Content-Type: application/json');

// Permiso correcto según el SQL sembrado: 'edit_students'
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'edit_students')) {
	echo json_encode(['success' => false, 'message' => 'No autorizado para actualizar estudiantes.']);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$studId = $_POST['StudID'] ?? null;
	$firstName = $_POST['FirstName'] ?? '';
	$lastName = $_POST['LastName'] ?? '';
	$gradeId = $_POST['GradeID'] ?? null;

	if (empty($studId) || empty($firstName) || empty($lastName)) {
		echo json_encode(['success' => false, 'message' => 'ID, nombre y apellido del estudiante son requeridos.']);
		exit;
	}

	$studentController = new StudentController();
	$result = $studentController->updateStudent($studId, $firstName, $lastName, $gradeId);
	echo json_encode($result);
} else {
	echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido.']);
}
?>