<?php
class Database {
    private $host = "localhost";
    private $db_name = "gestion_equipos_mpa_v2";
    private $username = "root"; // Ajustar según servidor
    private $password = ""; // Ajustar según servidor
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error de conexión BD: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
?>
