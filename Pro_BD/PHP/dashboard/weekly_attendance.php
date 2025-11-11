<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();

    // Obtenemos los últimos 7 días
    $labels = [];
    $values = [];
    for ($i=6; $i>=0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $label = strftime('%a', strtotime($date));
        $count = $db->query("SELECT COUNT(*) FROM attendance WHERE Date='$date' AND Status='Presente'")->fetchColumn();
        $labels[] = ucfirst($label); // e.g., "Lun", "Mar", etc.
        $values[] = intval($count);
    }

    echo json_encode([
        "success"=>true,
        "data"=>[
            "days"=>$labels,
            "values"=>$values
        ]
    ]);
} catch(Exception $e) {
    echo json_encode(["success"=>false, "message"=>$e->getMessage()]);
}
?>
