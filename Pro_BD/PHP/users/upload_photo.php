<?php
require_once('../config/database.php');
require_once('../middleware/auth_middleware.php');
session_start();
if (!isset($_SESSION['UserID'])) {
    echo json_encode(['success'=>false, 'msg'=>'No autenticado']);
    exit();
}
$userID = $_SESSION['UserID'];

if(isset($_FILES['photo'])){
    $targetDir = "../../uploads/profiles/";
    $fileName = $userID.'_'.basename($_FILES["photo"]["name"]);
    $targetFile = $targetDir . $fileName;
    if(move_uploaded_file($_FILES["photo"]["tmp_name"], $targetFile)){
        $query = "UPDATE user SET ProfilePicture=?, UpdatedAt=NOW() WHERE UserID=?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("si", $fileName, $userID);
        $stmt->execute();
        $stmt->close();
        echo json_encode(['success'=>true, 'file'=>$fileName]);
    }else{
        echo json_encode(['success'=>false, 'msg'=>'No se pudo subir']);
    }
    $conn->close();
}else{
    echo json_encode(['success'=>false, 'msg'=>'No hay archivo']);
}
?>
