<?php
require_once __DIR__ . '/../../config/database.php';
header('Content-Type: application/json');
try {
    $db = Database::getInstance()->getConnection();
    $query = "SELECT s.FirstName, s.LastName, p.TotalAmount as Amount, p.DueDate
        FROM student_payment p JOIN student s ON p.StudentID=s.StudentID
        WHERE p.Status='Pendiente' ORDER BY p.DueDate ASC LIMIT 5";
    $rows = [];
    foreach ($db->query($query) as $row) {
        $row['StudentName'] = $row['FirstName'] . ' ' . $row['LastName'];
        $rows[] = $row;
    }
    echo json_encode(["success"=>true, "data"=>$rows]);
} catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
