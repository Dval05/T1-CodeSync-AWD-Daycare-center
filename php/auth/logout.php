<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';
require_once __DIR__ . '/../middleware/auth_middleware.php';
send_cors_headers();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
error_reporting(0);

require_auth([]);

echo json_encode(['ok' => true]);
