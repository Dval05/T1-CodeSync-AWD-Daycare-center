<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';
require_once __DIR__ . '/../middleware/auth_middleware.php';
send_cors_headers();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
error_reporting(0);

$cfg = supabase_config();
$AUTH = 'Authorization: Bearer ' . $cfg['service_key'];
$APIK = 'apikey: ' . $cfg['service_key'];
$rest = $cfg['url'] . '/rest/v1';
$auth_admin = $cfg['url'] . '/auth/v1/admin/users';
$auth_invite = $cfg['url'] . '/auth/v1/invite';

// Require authenticated caller with Staff or Admin role
require_auth(['Staff','Admin']);

$input = json_decode(file_get_contents('php://input'), true);
$type = $input['type'] ?? null; // 'employee' | 'guardian'
$id = (int)($input['id'] ?? 0);
$assignRole = $input['role'] ?? null; // 'Staff' | 'Guardian'
$preferPassword = isset($input['prefer_password']) ? (bool)$input['prefer_password'] : null;

if (!$type || !$id || !in_array($type, ['employee', 'guardian'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request: type and id are required.']);
    exit;
}

$table = $type === 'employee' ? 'employee' : 'guardian';
$key = $type === 'employee' ? 'EmpID' : 'GuardianID';

// 1) Fetch person
[$code, $resp, $err] = http_json('GET', "$rest/$table?$key=eq.$id&select=$key,FirstName,LastName,Email,UserID", [$AUTH, $APIK]);
if ($err) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'HTTP error', 'detail' => $err]);
    exit;
}
$data = json_decode($resp, true);
if ($code >= 400 || !is_array($data) || count($data) === 0) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Record not found']);
    exit;
}
$person = $data[0];
if (!empty($person['UserID'])) {
    echo json_encode(['ok' => true, 'message' => 'Already provisioned']);
    exit;
}
$email = $person['Email'] ?? '';
$first = $person['FirstName'] ?? '';
$last = $person['LastName'] ?? '';
if (!$email) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Email is required to create an account']);
    exit;
}

// 2) Generate username via RPC
[$c2, $r2, $e2] = http_json('POST', "$rest/rpc/gen_unique_username", [$AUTH, $APIK, 'Prefer: params=single-object'], [
    'first_name' => $first,
    'last_name' => $last,
]);
if ($e2) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Username generation failed', 'detail' => $e2]);
    exit;
}
if ($c2 >= 400) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Username generation failed', 'detail' => $r2]);
    exit;
}
$username = trim($r2, "\"\n\r");

// 3) Create/Invite Supabase Auth user (prefer invite)
$useInviteEnv = getenv('PROVISION_USE_INVITE');
$useInvite = ($useInviteEnv === false || $useInviteEnv === '') ? true : !in_array(strtolower($useInviteEnv), ['0','false','off'], true);
if ($preferPassword === true) { $useInvite = false; }
if ($preferPassword === false) { $useInvite = true; }
$password = null;
$authId = null;
if ($useInvite) {
    [$ci3, $ri3, $ei3] = http_json('POST', $auth_invite, [$AUTH, $APIK], [
        'email' => $email,
        'data' => [
            'first_name' => $first,
            'last_name' => $last,
            'provisioned_by' => $type,
        ],
    ]);
    if ($ei3) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Auth invite error', 'detail' => $ei3]);
        exit;
    }
    $inviteRes = json_decode($ri3, true);
    if ($ci3 >= 400 && $ci3 !== 422) { // 422 si ya existe
        http_response_code(500);
        echo json_encode(['error' => 'Auth invite failed', 'detail' => $ri3]);
        exit;
    }
    if (isset($inviteRes['user']) && isset($inviteRes['user']['id'])) {
        $authId = $inviteRes['user']['id'];
    }
    if (!$authId) {
        // Buscar usuario existente por email
        [$cg3, $rg3] = http_json('GET', $auth_admin . '?email=' . rawurlencode($email), [$AUTH, $APIK]);
        $found = json_decode($rg3, true);
        if (is_array($found) && count($found) && isset($found[0]['id'])) {
            $authId = $found[0]['id'];
        }
        if (!$authId) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'Auth user not created or found']);
            exit;
        }
    }
} else {
    $password = random_password(14);
    [$c3, $r3, $e3] = http_json('POST', $auth_admin, [$AUTH, $APIK], [
        'email' => $email,
        'password' => $password,
        'email_confirm' => true,
        'user_metadata' => [
            'first_name' => $first,
            'last_name' => $last,
            'provisioned_by' => $type,
            'must_change_password' => true,
        ],
    ]);
    if ($e3) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Auth admin error', 'detail' => $e3]);
        exit;
    }
    $authUser = json_decode($r3, true);
    if ($c3 >= 400 || !isset($authUser['id'])) {
        // Si ya existe el usuario en Auth (p.ej., 422), intentar recuperarlo por email
        [$cg3, $rg3] = http_json('GET', $auth_admin . '?email=' . rawurlencode($email), [$AUTH, $APIK]);
        $found = json_decode($rg3, true);
        if (is_array($found) && count($found) && isset($found[0]['id'])) {
            $authId = $found[0]['id'];
        } else {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'Auth user creation failed', 'detail' => $r3]);
            exit;
        }
    } else {
        $authId = $authUser['id'];
    }
}

// 4) Upsert en tabla de aplicación `user` por Email
// Intentar encontrar usuario existente por Email
[$cs0, $rs0] = http_json('GET', "$rest/user?Email=eq." . rawurlencode($email) . '&select=UserID,AuthUserID,UserName', [$AUTH, $APIK]);
$existing = json_decode($rs0, true);
$appUserId = null;
if (is_array($existing) && count($existing) > 0) {
    $appUserId = $existing[0]['UserID'];
    $currentAuth = $existing[0]['AuthUserID'] ?? null;
    if (!$currentAuth) {
        // actualizar AuthUserID y datos básicos si faltan
        [$cu, $ru, $eu] = http_json('PATCH', "$rest/user?UserID=eq.$appUserId", [$AUTH, $APIK, 'Prefer: return=representation'], [
            [ 'AuthUserID' => $authId, 'FirstName' => $first, 'LastName' => $last, 'IsActive' => 1 ]
        ]);
        if ($eu || $cu >= 400) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'App user update failed', 'detail' => $ru ?: $eu]);
            exit;
        }
    }
    // mantener UserName existente para evitar conflictos
    $username = $existing[0]['UserName'] ?? $username;
} else {
    // Insertar nuevo usuario de aplicación
    [$c4, $r4, $e4] = http_json('POST', "$rest/user", [$AUTH, $APIK, 'Prefer: return=representation'], [[
        'UserName' => $username,
        'Email' => $email,
        'FirstName' => $first,
        'LastName' => $last,
        'IsActive' => 1,
        'AuthUserID' => $authId,
    ]]);
    if ($e4) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'App user insert error', 'detail' => $e4]);
        exit;
    }
    $appUsers = json_decode($r4, true);
    if ($c4 >= 400 || !is_array($appUsers) || count($appUsers) === 0) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'App user insert failed', 'detail' => $r4]);
        exit;
    }
    $appUserId = $appUsers[0]['UserID'];
}

// 5) Link to employee/guardian
[$c5, $r5, $e5] = http_json('PATCH', "$rest/$table?$key=eq.$id", [$AUTH, $APIK], [ 'UserID' => $appUserId ]);
if ($e5 || $c5 >= 400) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Linking failed', 'detail' => $r5 ?: $e5]);
    exit;
}

// 6) Optional: assign role
if ($assignRole) {
    // get role id
    [$cr, $rr, $er] = http_json('GET', "$rest/role?RoleName=eq." . rawurlencode($assignRole) . '&select=RoleID', [$AUTH, $APIK]);
    if (!$er && $cr < 400) {
        $roles = json_decode($rr, true);
        if (is_array($roles) && count($roles) > 0) {
            $roleId = $roles[0]['RoleID'];
            [$crp, $rrp, $erp] = http_json('POST', "$rest/user_role", [$AUTH, $APIK], [[ 'UserID' => $appUserId, 'RoleID' => $roleId ]]);
            // no fatal si ya existe, ignorar errores aquí
        }
    }
}

echo json_encode([
    'ok' => true,
    'user' => [
        'UserID' => $appUserId,
        'UserName' => $username,
        'Email' => $email,
    ],
    'invited' => $useInvite,
    'temp_password' => $useInvite ? null : $password,
]);

// Fire-and-forget audit log
try {
    $caller = validate_supabase_user();
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $action = 'Provision User';
    $newData = [
        'UserID' => $appUserId,
        'Email' => $email,
        'AssignedRole' => $assignRole,
        'LinkedTable' => $table,
        'LinkedId' => $id
    ];
    http_json('POST', "$rest/audit_log", [ $AUTH, $APIK ], [[
        'UserID' => $caller['app_user_id'] ?? null,
        'Action' => $action,
        'TableName' => 'user',
        'RecordID' => $appUserId,
        'OldData' => null,
        'NewData' => $newData,
        'IPAddress' => $ip,
        'UserAgent' => $ua
    ]]);
} catch (\Throwable $e) { /* ignore */ }
