<?php
// php/config.php

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'admin'); // Your database username
define('DB_PASSWORD', 'admin');     // Your database password
define('DB_NAME', 'daycarecenter'); // Your database name

define('BASE_URL', 'http://localhost:8080/PROJECT/');

// Kindergarten Name
define('KINDERGARTEN_NAME', 'NICEKIDS');

// Auto-logout inactivity period in seconds (FR-16)
define('INACTIVITY_TIMEOUT', 60); // 1 hour

// --- NEW DEFINITIONS FOR auth.php ---
define('SESSION_TIMEOUT_SECONDS', 60); // 1 hour
define('PASSWORD_HASH_ALGO', PASSWORD_DEFAULT); // Recommended for password_hash()
?>