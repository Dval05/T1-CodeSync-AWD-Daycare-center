<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("INSERT INTO student (FirstName, LastName, GradeID, Gender, BirthDate, IsActive) VALUES (?, ?, ?, ?, ?, 1)");
    $ok = $stmt->execute([
        sanitizeString($data['FirstName']),
        sanitizeString($data['LastName']),
        $data['GradeID'],
        sanitizeString($data['Gender']),
        $data['BirthDate']
    ]);
    echo json_encode(["success"=>$ok]);
} catch(Exception $e) {
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
