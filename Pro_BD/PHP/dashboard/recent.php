<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT Name, Description, ScheduledDate as Date FROM activity ORDER BY ScheduledDate DESC LIMIT 5");
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success"=>true, "data"=>$res]);
} catch(Exception $e) {
    echo json_encode(["success"=>false, "message"=>$e->getMessage()]);
}
?>
