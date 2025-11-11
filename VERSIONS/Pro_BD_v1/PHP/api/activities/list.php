<?php
// php/api/activities/list.php
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

$activity_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);

$response = ['success' => false, 'message' => ''];

try {
    if ($activity_id) {
        // Fetch specific activity details
        $stmt = $conn->prepare("SELECT ActivityID, Name, GradeID, EmpID, ImagePath FROM activity WHERE ActivityID = ?");
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta de actividad: " . $conn->error);
        }
        $stmt->bind_param("i", $activity_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $activity = $result->fetch_assoc();
        $stmt->close();

        if ($activity) {
            // Also fetch associated media
            $media_stmt = $conn->prepare("SELECT MediaID, FileName, FilePath, UploadDate FROM activity_media WHERE ActivityID = ? ORDER BY UploadDate DESC");
            if ($media_stmt === false) {
                throw new Exception("Error al preparar la consulta de medios de actividad: " . $conn->error);
            }
            $media_stmt->bind_param("i", $activity_id);
            $media_stmt->execute();
            $media_result = $media_stmt->get_result();
            $activity['media'] = $media_result->fetch_all(MYSQLI_ASSOC);
            $media_stmt->close();

            $response = ['success' => true, 'activity' => $activity];
        } else {
            $response = ['success' => false, 'message' => 'Actividad no encontrada.'];
        }
    } else {
        // Fetch all activities
        $stmt = $conn->prepare("SELECT ActivityID, Name, GradeID, EmpID, ImagePath FROM activity ORDER BY Name ASC");
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta de actividades: " . $conn->error);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $activities = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        $response = ['success' => true, 'activities' => $activities];
    }
} catch (Exception $e) {
    error_log("Error in activities/list.php: " . $e->getMessage());
    $response = ['success' => false, 'message' => 'Error interno del servidor al obtener actividades.'];
} finally {
    $db_instance->closeConnection();
}

echo json_encode($response);
?>