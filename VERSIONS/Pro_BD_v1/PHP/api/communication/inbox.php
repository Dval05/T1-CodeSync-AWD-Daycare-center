<?php
// php/api/communication/inbox.php
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

$response = ['success' => false, 'message' => ''];

try {
    // Fetch messages where the logged-in user is the receiver
    // Join with user table to get sender's username
    $stmt = $conn->prepare("
        SELECT
            n.NotificationID, -- Reusing notification table for general messages
            n.SenderID,
            n.Message,
            n.SentAt,
            u_sender.Username AS SenderUsername,
            (SELECT COUNT(*) FROM notification_read nr WHERE nr.NotificationID = n.NotificationID AND nr.UserID = ?) AS IsRead
        FROM notification n
        LEFT JOIN user u_sender ON n.SenderID = u_sender.UserID
        WHERE n.ReceiverID = ?
        ORDER BY n.SentAt DESC
    ");
    // Note: Assuming 'notification' table is used for internal messaging based on SRS FR-12 and your DB schema.
    // If you need a separate 'message' table, the schema would need to be extended.

    if ($stmt === false) {
        throw new Exception("Error al preparar la consulta de bandeja de entrada: " . $conn->error);
    }

    $stmt->bind_param("ii", $user_id, $user_id); // Parameters for IsRead subquery and ReceiverID
    $stmt->execute();
    $result = $stmt->get_result();
    $inbox_messages = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $response = ['success' => true, 'messages' => $inbox_messages];

} catch (Exception $e) {
    error_log("Error in communication/inbox.php: " . $e->getMessage());
    $response = ['success' => false, 'message' => 'Error interno del servidor al obtener mensajes de la bandeja de entrada.'];
} finally {
    $db_instance->closeConnection();
}

echo json_encode($response);
?>