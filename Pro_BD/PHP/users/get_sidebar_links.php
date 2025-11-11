<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_middleware.php';

header('Content-Type: application/json');
$userId = require_auth();

$sql = "SELECT p.PermissionID, p.PermissionName, p.Link, p.Icon
	FROM user_role ur
	JOIN role_permission rp ON ur.RoleID = rp.RoleID
	JOIN permission p ON rp.PermissionID = p.PermissionID
	WHERE ur.UserID = ?
	ORDER BY p.PermissionID";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$res = $stmt->get_result();

$menu = [];
while ($row = $res->fetch_assoc()) {
	if (!empty($row['Link'])) {
		$menu[] = [
			"Link" => $row['Link'],
			"Icon" => !empty($row['Icon']) ? $row['Icon'] : 'fa-tachometer-alt',
			"Title" => $row['PermissionName']
		];
	}
}
$stmt->close();

echo json_encode([
	"success" => true,
	"links" => $menu
]);
?>
