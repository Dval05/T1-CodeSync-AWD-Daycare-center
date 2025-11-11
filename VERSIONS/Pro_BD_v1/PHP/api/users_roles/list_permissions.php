<?php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

// Solo admin
$p = new Permissions($_SESSION['user_id']);
$roles = $p->getUserRoles();
if (!(in_array('Administrator', $roles, true) || $_SESSION['user_id'] === 1)) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare('SELECT PermID, Name, MenuTitle, MenuIcon, MenuRoute, MenuOrder FROM permission ORDER BY MenuOrder ASC, Name ASC');
$stmt->execute();
$result = $stmt->get_result();
$perms = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$db->closeConnection();

// Agrupar por entidad inferida del Name (ej: view_students, edit_students)
$groups = [];
foreach ($perms as $perm) {
    $name = $perm['Name'];
    $parts = explode('_', $name, 2);
    $action = $parts[0];
    $entity = $parts[1] ?? $name; // fallback
    if (!isset($groups[$entity])) $groups[$entity] = ['entity' => $entity, 'read' => null, 'edit' => [], 'other' => []];
    if ($action === 'view') {
        $groups[$entity]['read'] = $perm;
    } elseif (in_array($action, ['create','edit','delete','manage','add'])) {
        $groups[$entity]['edit'][] = $perm;
    } else {
        $groups[$entity]['other'][] = $perm;
    }
}

echo json_encode(['success' => true, 'groups' => array_values($groups), 'raw' => $perms]);
?>

