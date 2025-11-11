<?php
require_once __DIR__ . '/../config/database.php';
header("Content-Type: application/json");

try {
    $db = Database::getInstance()->getConnection();

    // Total de estudiantes
    $students = $db->query("SELECT COUNT(*) FROM student")->fetchColumn();

    // Estudiantes activos/inactivos
    $activeStudents = $db->query("SELECT COUNT(*) FROM student WHERE IsActive=1")->fetchColumn();
    $inactiveStudents = $db->query("SELECT COUNT(*) FROM student WHERE IsActive=0")->fetchColumn();

    // Total docentes
    $totalTeachers = $db->query("SELECT COUNT(*) FROM employee WHERE Position='Docente'")->fetchColumn();

    // Recaudación del mes actual
    $monthRevenue = $db->query("SELECT IFNULL(SUM(TotalAmount),0) FROM student_payment WHERE MONTH(PaymentDate)=MONTH(CURDATE()) AND YEAR(PaymentDate)=YEAR(CURDATE()) AND Status='Pagado'")->fetchColumn();

    // Porcentaje de asistencia del día
    $asistencias = $db->query("SELECT COUNT(*) FROM attendance WHERE Date=CURDATE() AND Status='Presente'")->fetchColumn();
    $matricula = $db->query("SELECT COUNT(*) FROM student WHERE IsActive=1")->fetchColumn();
    $todayAttendancePercent = $matricula > 0 ? round($asistencias * 100 / $matricula, 1) : 0;

    echo json_encode([
        "success"=>true,
        "data"=>[
            "totalStudents"=>$students,
            "activeStudents"=>$activeStudents,
            "inactiveStudents"=>$inactiveStudents,
            "totalTeachers"=>$totalTeachers,
            "monthlyRevenue"=>$monthRevenue,
            "todayAttendancePercent"=>$todayAttendancePercent
        ]
    ]);
} catch(Exception $e) {
    echo json_encode(["success"=>false, "message"=>$e->getMessage()]);
}
?>
