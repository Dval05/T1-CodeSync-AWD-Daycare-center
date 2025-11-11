<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'view_observations')) { echo json_encode(['success'=>false,'message'=>'No autorizado']); exit; }

$studId = intval($_GET['studid'] ?? 0);
$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare("SELECT ObservationID, StudID, EmpID, ObservationText, ObservationDate FROM student_observation WHERE StudID = ? ORDER BY ObservationDate DESC");
$stmt->bind_param('i', $studId);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$db->closeConnection();
echo json_encode($rows);
?>
<?php
// php/api/observations/list.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

if (!hasPermission($_SESSION['user_id'], 'view_observations')) {
    echo json_encode(['error' => 'No tienes permiso para ver las observaciones.']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$studId = isset($_GET['studid']) ? intval($_GET['studid']) : 0;

$observations = [];

if ($studId > 0) {
    $stmt = $conn->prepare("
        SELECT so.ObservationID, so.ObservationText, so.ObservationDate, e.FirstName, e.LastName
        FROM student_observation so
        LEFT JOIN employee e ON so.EmpID = e.EmpID
        WHERE so.StudID = ?
        ORDER BY so.ObservationDate DESC
    ");
    $stmt->bind_param("i", $studId);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $row['EmployeeName'] = $row['FirstName'] . ' ' . $row['LastName'];
        unset($row['FirstName'], $row['LastName']);
        $observations[] = $row;
    }
    $stmt->close();
}

$conn->close();
echo json_encode($observations);
?>