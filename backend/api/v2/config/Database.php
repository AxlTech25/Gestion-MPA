<?php
require_once __DIR__ . '/LocalConfig.php';

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = LocalConfig::get('db_host', 'localhost');
        $this->db_name = LocalConfig::get('db_name', 'gestion_equipos_mpa_v2');
        $this->username = LocalConfig::get('db_user', 'root');
        $this->password = LocalConfig::get('db_pass', '');
    }

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
