<?php
// php/auth.php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';
require_once 'db_connection.php';

header('Content-Type: application/json');

$db_instance = new Database();
$conn = $db_instance->getConnection();

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function updateLastActivity() {
    $_SESSION['last_activity'] = time();
}

function sessionExpired() {
    if (!isset($_SESSION['last_activity'])) return false;
    return (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT_SECONDS;
}

// GET actions
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    if ($_GET['action'] === 'check_session') {
        if (sessionExpired()) {
            session_unset();
            session_destroy();
            echo json_encode(['active' => false, 'message' => 'Tu sesión ha expirado por inactividad.']);
        } elseif (isLoggedIn()) {
            updateLastActivity();
            echo json_encode(['active' => true, 'user_id' => $_SESSION['user_id'], 'username' => $_SESSION['username'] ?? '']);
        } else {
            echo json_encode(['active' => false, 'message' => 'No hay sesión activa.']);
        }
        $db_instance->closeConnection();
        exit();
    }
}

// POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    if ($action === 'login') {
        $username = trim($_POST['username'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if ($username === '' || $password === '') {
            echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos.']);
            $db_instance->closeConnection();
            exit();
        }

        // Autenticación: tabla `user` con campo `Password` (hash bcrypt)
        $stmt = $conn->prepare("SELECT UserID, Username, Email, Password FROM user WHERE (Username = ? OR Email = ?) AND IsActive = 1");
        if ($stmt === false) {
            echo json_encode(['success' => false, 'message' => 'Error interno.']);
            $db_instance->closeConnection();
            exit();
        }
        $stmt->bind_param('ss', $username, $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($password, $user['Password'])) {
            $_SESSION['user_id'] = (int)$user['UserID'];
            $_SESSION['username'] = $user['Username'] ?: $user['Email'];
            updateLastActivity();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Credenciales inválidas.']);
        }
        $db_instance->closeConnection();
        exit();
    }

    if ($action === 'logout') {
        session_unset();
        session_destroy();
        echo json_encode(['success' => true]);
        $db_instance->closeConnection();
        exit();
    }
}

// Fallback
echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
$db_instance->closeConnection();
?>