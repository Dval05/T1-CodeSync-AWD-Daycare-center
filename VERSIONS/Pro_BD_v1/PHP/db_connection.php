<?php
// php/db_connection.php
require_once 'config.php';

class Database {
    private $conn; // Make it private, accessed via getter

    public function __construct() {
        $this->conn = null;
        try {
            $this->conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
            if ($this->conn->connect_error) {
                // Log the error and die if connection fails.
                // For API endpoints, it's better to return a JSON error.
                error_log("Database connection failed: " . $this->conn->connect_error);
                header('Content-Type: application/json');
                die(json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.']));
            }
            $this->conn->set_charset("utf8mb4");
        } catch (Exception $e) {
            error_log("Database connection exception: " . $e->getMessage());
            header('Content-Type: application/json');
            die(json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.']));
        }
    }

    public function getConnection() {
        return $this->conn;
    }

    public function closeConnection() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
?>