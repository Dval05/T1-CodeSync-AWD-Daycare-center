<?php
// php/api/observations/create.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

if (!hasPermission($_SESSION['user_id'], 'add_observation')) { // You might need a specific permission for adding observations
    echo json_encode(['success' => false, 'message' => 'No tienes permiso para añadir observaciones.']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$studId = isset($_POST['StudID']) ? intval($_POST['StudID']) : 0;
$observationText = isset($_POST['ObservationText']) ? trim($_POST['ObservationText']) : '';
$observationDate = isset($_POST['ObservationDate']) ? trim($_POST['ObservationDate']) : date('Y-m-d');
$empId = $_SESSION['employee_id'] ?? null; // Assuming EmpID is stored in session for logged-in employee

if ($studId > 0 && !empty($observationText) && $empId) {
    $stmt = $conn->prepare("INSERT INTO student_observation (StudID, EmpID, ObservationText, ObservationDate) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $studId, $empId, $observationText, $observationDate);

    if ($stmt->execute()) {
        // Log the action to audit_log
        $logStmt = $conn->prepare("INSERT INTO audit_log (UserID, ActionType, Details) VALUES (?, ?, ?)");
        $actionType = "CREATE_OBSERVATION";
        $details = "Created observation for StudID: " . $studId . " by EmpID: " . $empId;
        $logStmt->bind_param("iss", $_SESSION['user_id'], $actionType, $details);
        $logStmt->execute();
        $logStmt->close();

        echo json_encode(['success' => true, 'message' => 'Observación añadida con éxito.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al añadir observación: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos o inválidos para la observación.']);
}

$conn->close();
?>