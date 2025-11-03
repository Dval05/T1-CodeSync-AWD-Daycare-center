<?php
// php/api/students/create.php
session_start();
require_once '../../config.php';
require_once '../../db_connection.php';
require_once '../../permissions.php';
require_once '../../controllers/StudentController.php';

header('Content-Type: application/json');

// Check if user is logged in and has permission to create students
if (!isLoggedIn() || !hasPermission($_SESSION['user_id'], 'create_students')) { // Define 'create_students' permission
    echo json_encode(['success' => false, 'message' => 'No autorizado para crear estudiantes.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = $_POST['FirstName'] ?? '';
    $lastName = $_POST['LastName'] ?? '';
    $gradeId = $_POST['GradeID'] ?? null;
    $documentNumber = $_POST['DocumentNumber'] ?? null;
    $address = $_POST['Address'] ?? null;
    $birthDate = $_POST['BirthDate'] ?? null;
    $gender = $_POST['Gender'] ?? null;
    $email = $_POST['Email'] ?? null;
    $phone = $_POST['Phone'] ?? null;

    if (empty($firstName) || empty($lastName)) {
        echo json_encode(['success' => false, 'message' => 'Nombre y apellido son requeridos.']);
        exit;
    }

    $studentController = new StudentController();
    $result = $studentController->createStudent($firstName, $lastName, $gradeId, $documentNumber, $address, $birthDate, $gender, $email, $phone);

    // Si se proporcionan datos de tutor, crearlo y vincularlo
    $guardianFirst = trim($_POST['GuardianFirstName'] ?? '');
    $guardianLast = trim($_POST['GuardianLastName'] ?? '');
    $guardianDoc = trim($_POST['GuardianDocumentNumber'] ?? '');

    // Validar que los datos del tutor sean obligatorios (cédula obligatoria solo si existe en la BD)
    $dbCheck = new Database();
    $connCheck = $dbCheck->getConnection();
    $guardianCols = [];
    $resCols = $connCheck->query("SHOW COLUMNS FROM guardian");
    if ($resCols) { while ($r = $resCols->fetch_assoc()) { $guardianCols[$r['Field']] = true; } }
    $dbCheck->closeConnection();

    $requireGuardianDoc = isset($guardianCols['DocumentNumber']);
    if ($guardianFirst === '' || $guardianLast === '' || ($requireGuardianDoc && $guardianDoc === '')) {
        echo json_encode(['success' => false, 'message' => $requireGuardianDoc ? 'Nombre, apellido y cédula del tutor son requeridos.' : 'Nombre y apellido del tutor son requeridos.']);
        exit;
    }
    if (!empty($guardianFirst) && !empty($guardianLast) && !empty($result['StudID'])) {
        $db = new Database();
        $conn = $db->getConnection();

        // Usar transacción para mantener consistencia (guardian, user, vínculo)
        $conn->begin_transaction();

        // Helper: generar username único basado en nombre/apellido
        $baseUsername = strtolower(substr(preg_replace('/[^a-zA-Z]/', '', $guardianFirst), 0, 1) . preg_replace('/[^a-zA-Z]/', '', $guardianLast));
        if ($baseUsername === '') { $baseUsername = 'parent'; }
        $username = $baseUsername;
        $suffix = 1;
        $checkStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM user WHERE Username = ?");
        while (true) {
            $checkStmt->bind_param('s', $username);
            $checkStmt->execute();
            $res = $checkStmt->get_result()->fetch_assoc();
            if ((int)$res['cnt'] === 0) break;
            $username = $baseUsername . $suffix;
            $suffix++;
        }
        $checkStmt->close();

        // Generar contraseña aleatoria y hash
        $plainPassword = substr(bin2hex(random_bytes(8)), 0, 10);
        $passwordHash = password_hash($plainPassword, PASSWORD_DEFAULT);

        // Crear usuario (Email opcional NULL)
        $userStmt = $conn->prepare("INSERT INTO user (Username, Password, Email, IsActive) VALUES (?, ?, NULL, 1)");
        $newUserId = null;
        if ($userStmt) {
            $userStmt->bind_param('ss', $username, $passwordHash);
            if ($userStmt->execute()) {
                $newUserId = $conn->insert_id;
            }
            $userStmt->close();
        }

        // Asignar rol 'Parent' (RoleID=3) si se creó el usuario
        if (!empty($newUserId)) {
            $roleId = 3; // Parent
            $urStmt = $conn->prepare("INSERT INTO user_role (UserID, RoleID) VALUES (?, ?)");
            if ($urStmt) {
                $urStmt->bind_param('ii', $newUserId, $roleId);
                $urStmt->execute();
                $urStmt->close();
            }
        }

        // Crear guardian vinculando con el UserID (si existe)
        // Buscar si ya existe guardian por cédula (si existe la columna)
        $guardId = null;
        if ($requireGuardianDoc && $guardianDoc !== '') {
            $findG = $conn->prepare("SELECT GuardID FROM guardian WHERE DocumentNumber = ?");
            if ($findG) {
                $findG->bind_param('s', $guardianDoc);
                $findG->execute();
                $resG = $findG->get_result()->fetch_assoc();
                if ($resG) { $guardId = (int)$resG['GuardID']; }
                $findG->close();
            }
        }

        if (!$guardId) {
            // Crear guardian con/ sin DocumentNumber y (opcional) UserID
            if ($requireGuardianDoc) {
                $stmt = $conn->prepare("INSERT INTO guardian (FirstName, LastName, DocumentNumber, UserID) VALUES (?, ?, ?, ?)");
                if ($stmt) {
                    $userIdParam = $newUserId ? (int)$newUserId : null;
                    if ($userIdParam) {
                        $stmt->bind_param('sssi', $guardianFirst, $guardianLast, $guardianDoc, $userIdParam);
                    } else {
                        $stmt = $conn->prepare("INSERT INTO guardian (FirstName, LastName, DocumentNumber, UserID) VALUES (?, ?, ?, NULL)");
                        $stmt->bind_param('sss', $guardianFirst, $guardianLast, $guardianDoc);
                    }
                    if ($stmt->execute()) {
                        $guardId = $conn->insert_id;
                        $stmt->close();
                    } else {
                        $stmt->close();
                    }
                }
            } else {
                $stmt = $conn->prepare("INSERT INTO guardian (FirstName, LastName, UserID) VALUES (?, ?, ?)");
                if ($stmt) {
                    $userIdParam = $newUserId ? (int)$newUserId : null;
                    if ($userIdParam) {
                        $stmt->bind_param('ssi', $guardianFirst, $guardianLast, $userIdParam);
                    } else {
                        $stmt = $conn->prepare("INSERT INTO guardian (FirstName, LastName, UserID) VALUES (?, ?, NULL)");
                        $stmt->bind_param('ss', $guardianFirst, $guardianLast);
                    }
                    if ($stmt->execute()) { $guardId = $conn->insert_id; }
                    $stmt->close();
                }
            }
        }

        if ($guardId) {
            // Vincular con student_guardian
            $linkStmt = $conn->prepare("INSERT INTO student_guardian (StudID, GuardID) VALUES (?, ?)");
            if ($linkStmt) {
                $studId = (int)$result['StudID'];
                $linkStmt->bind_param('ii', $studId, $guardId);
                $linkStmt->execute();
                $linkStmt->close();
                $result['guardian_linked'] = true;
                if ($newUserId) {
                    $result['guardian_user'] = ['username' => $username, 'temp_password' => $plainPassword];
                }
            }
                $conn->commit();
        } else { $conn->rollback(); }
        $db->closeConnection();
    }

    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido.']);
}
?>