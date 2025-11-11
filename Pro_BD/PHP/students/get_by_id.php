<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');
$id = $_GET["id"] ?? null;

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT * FROM student WHERE StudentID = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["success"=>(bool)$row,"data"=>$row]);
} catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
