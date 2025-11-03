<?php
// php/permissions.php (mysqli)
require_once 'db_connection.php';

class Permissions {
    private $conn;
    private $user_id;

    public function __construct($user_id) {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->user_id = $user_id;
    }

    public function getUserPermissions() {
        $query = "
            SELECT p.Name, p.MenuTitle, p.MenuIcon, p.MenuRoute, p.MenuOrder
            FROM user_role ur
            JOIN role_permission rp ON ur.RoleID = rp.RoleID
            JOIN permission p ON rp.PermID = p.PermID
            WHERE ur.UserID = ?
            ORDER BY p.MenuOrder ASC
        ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) return [];
        $stmt->bind_param('i', $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    public function hasPermission($permission_name) {
        $query = "
            SELECT COUNT(*) AS cnt
            FROM user_role ur
            JOIN role_permission rp ON ur.RoleID = rp.RoleID
            JOIN permission p ON rp.PermID = p.PermID
            WHERE ur.UserID = ? AND p.Name = ?
        ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) return false;
        $stmt->bind_param('is', $this->user_id, $permission_name);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return (int)($row['cnt'] ?? 0) > 0;
    }

    public function getUserRoles() {
        $query = "
            SELECT r.Name
            FROM user_role ur
            JOIN role r ON ur.RoleID = r.RoleID
            WHERE ur.UserID = ?
        ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) return [];
        $stmt->bind_param('i', $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $roles = [];
        while ($row = $result->fetch_assoc()) { $roles[] = $row['Name']; }
        $stmt->close();
        return $roles;
    }
}

// Helpers globales
function isLoggedIn() {
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
    return isset($_SESSION['user_id']);
    }

function hasPermission($userId, $permissionName) {
    $p = new Permissions($userId);
    return $p->hasPermission($permissionName);
}
?>