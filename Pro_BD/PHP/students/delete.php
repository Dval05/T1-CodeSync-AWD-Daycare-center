<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['StudentID'] ?? null;
try {
    $db = Database::getInstance()->getConnection();
    // Borrado lógico:
    $stmt = $db->prepare("UPDATE student SET IsActive=0 WHERE StudentID=?");
    // O si usas IsDeleted: $stmt = $db->prepare("UPDATE student SET IsDeleted=1 WHERE StudentID=?");
    $ok = $stmt->execute([$id]);
    echo json_encode(["success"=>$ok]);
} catch(Exception $e) {
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
