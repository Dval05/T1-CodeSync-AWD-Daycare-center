<?php
// php/api/get_menu.php
session_start();
require_once '../permissions.php';
require_once '../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa.']);
    exit();
}

try {
    $user_id = (int)$_SESSION['user_id'];
    $permissions_handler = new Permissions($user_id);

    // Si es Administrador (tiene rol 'Administrator') o es user_id 1, devolver TODO el menú
    $roles = $permissions_handler->getUserRoles();
    $isAdmin = in_array('Administrator', $roles, true) || $user_id === 1;
    if ($isAdmin) {
        // Obtener todos los permisos con menú
        require_once '../db_connection.php';
        $db = new Database();
        $conn = $db->getConnection();
        $stmt = $conn->prepare("SELECT Name, MenuTitle, MenuIcon, MenuRoute, MenuOrder FROM permission WHERE MenuTitle IS NOT NULL AND MenuRoute IS NOT NULL ORDER BY MenuOrder ASC");
        $stmt->execute();
        $result = $stmt->get_result();
        $menu_items = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        $db->closeConnection();
    } else {
    $menu_items = $permissions_handler->getUserPermissions();
    }
    $filtered_menu = array_filter($menu_items, function($item) {
        return !empty($item['MenuTitle']) && !empty($item['MenuRoute']);
    });

    $processed_menu = [];
    foreach ($filtered_menu as $item) {
        $route = $item['MenuRoute'];
        $route = str_replace(['html/', 'HTML/'], '', $route);
        $processed_menu[] = [
            'Name' => $item['Name'],
            'MenuTitle' => $item['MenuTitle'],
            'MenuIcon' => $item['MenuIcon'] ?: 'fas fa-circle',
            'MenuRoute' => $route,
            'MenuOrder' => (int)($item['MenuOrder'] ?? 0),
        ];
    }

    if (count($processed_menu) === 0) {
        // Menú por defecto si el usuario no tiene roles/permisos asignados aún
        $processed_menu = [
            ['Name'=>'access_dashboard','MenuTitle'=>'Dashboard','MenuIcon'=>'fas fa-fw fa-tachometer-alt','MenuRoute'=>'dashboard.html','MenuOrder'=>10],
            ['Name'=>'view_students','MenuTitle'=>'Estudiantes','MenuIcon'=>'fas fa-fw fa-users','MenuRoute'=>'students.html','MenuOrder'=>20],
            ['Name'=>'view_attendance','MenuTitle'=>'Asistencia','MenuIcon'=>'fas fa-fw fa-clipboard-check','MenuRoute'=>'attendance.html','MenuOrder'=>40],
            ['Name'=>'view_activities','MenuTitle'=>'Actividades','MenuIcon'=>'fas fa-fw fa-calendar-alt','MenuRoute'=>'activities.html','MenuOrder'=>30],
            ['Name'=>'view_notifications','MenuTitle'=>'Notificaciones','MenuIcon'=>'fas fa-fw fa-bell','MenuRoute'=>'notifications.html','MenuOrder'=>110]
        ];
    }

    echo json_encode(['success' => true, 'menu' => array_values($processed_menu)]);
} catch (Exception $e) {
    error_log('Error in get_menu.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor al obtener el menú.']);
}
?>