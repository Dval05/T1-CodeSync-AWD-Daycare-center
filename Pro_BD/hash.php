<?php
$clave = 'admin1234';
$hash = '$2y$10$RB3GHK0tnk3XOBhlgYgpx.osqFJVAGTjvvdIVe.edey3Vlv3DbOOu';
var_dump(password_verify($clave, $hash));
?>
