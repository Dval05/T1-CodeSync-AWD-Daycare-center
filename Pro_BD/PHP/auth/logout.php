<?php
error_log('Session UserID: ' . ($_SESSION['UserID'] ?? 'NULL'));
error_log('Session RoleID: ' . ($_SESSION['RoleID'] ?? 'NULL'));

session_start();
session_destroy();
echo json_encode(['success'=>true, 'msg'=>'Session closed']);
?>
