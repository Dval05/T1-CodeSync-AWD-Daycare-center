<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    $query = "SELECT s.*, g.GradeName FROM student s LEFT JOIN grade g ON s.GradeID = g.GradeID";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success"=>true,"data"=>$rows]);
} catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
