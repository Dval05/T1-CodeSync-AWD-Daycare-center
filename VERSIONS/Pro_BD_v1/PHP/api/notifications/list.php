<?php
// php/api/notifications/list.php
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

$user_id = $_SESSION['user_id'];
// Optional filter: 'read' or 'unread'
$filter_status = filter_input(INPUT_GET, 'status', FILTER_SANITIZE_STRING);

$response = ['success' => false, 'message' => ''];

try {
    $query = "
        SELECT
            n.NotificationID,
            n.SenderID,
            n.Message,
            n.SentAt,
            u_sender.Username AS SenderUsername,
            (SELECT COUNT(*) FROM notification_read nr WHERE nr.NotificationID = n.NotificationID AND nr.UserID = ?) AS IsRead
        FROM notification n
        LEFT JOIN user u_sender ON n.SenderID = u_sender.UserID
        WHERE n.ReceiverID = ?
    ";

    $params = [$user_id, $user_id]; // Parameters for the subquery and main query
    $types = "ii"; // Initial types for parameters

    // Add status filter if specified
    if ($filter_status === 'unread') {
        $query .= " AND (SELECT COUNT(*) FROM notification_read nr WHERE nr.NotificationID = n.NotificationID AND nr.UserID = ?) = 0";
        $params[] = $user_id;
        $types .= "i";
    } elseif ($filter_status === 'read') {
        $query .= " AND (SELECT COUNT(*) FROM notification_read nr WHERE nr.NotificationID = n.NotificationID AND nr.UserID = ?) > 0";
        $params[] = $user_id;
        $types .= "i";
    }

    $query .= " ORDER BY n.SentAt DESC";

    $stmt = $conn->prepare($query);
    if ($stmt === false) {
        throw new Exception("Error al preparar la consulta de notificaciones: " . $conn->error);
    }

    // Dynamically bind parameters
    $stmt->bind_param($types, ...$params);

    $stmt->execute();
    $result = $stmt->get_result();
    $notifications = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $response = ['success' => true, 'notifications' => $notifications];

} catch (Exception $e) {
    error_log("Error in notifications/list.php: " . $e->getMessage());
    $response = ['success' => false, 'message' => 'Error interno del servidor al obtener notificaciones.'];
} finally {
    $db_instance->closeConnection();
}

echo json_encode($response);
?>