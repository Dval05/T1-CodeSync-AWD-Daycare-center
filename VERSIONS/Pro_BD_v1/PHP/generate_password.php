<?php
// generate_password.php
$password_to_hash = 'admin123'; // Asegúrate de que esta sea LA CONTRASEÑA EXACTA que intentas usar para iniciar sesión
$hashedPassword = password_hash($password_to_hash, PASSWORD_DEFAULT);
echo "Contraseña original que intentas usar: " . $password_to_hash . "<br>";
echo "HASH que debes copiar en tu BD: " . $hashedPassword . "<br>";
?>