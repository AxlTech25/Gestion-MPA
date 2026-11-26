<?php
require_once __DIR__ . '/LocalConfig.php';
require_once __DIR__ . '/Runtime.php';

class Database {
    public static ?PDO $conexionDePrueba = null;

    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $ssl;
    public $conn;

    public function __construct() {
        $this->host = LocalConfig::get('db_host', 'localhost');
        $this->port = LocalConfig::get('db_port', '');
        $this->db_name = LocalConfig::get('db_name', 'gestion_equipos_mpa_v2');
        $this->username = LocalConfig::get('db_user', 'root');
        $this->password = LocalConfig::get('db_pass', '');
        // Azure MySQL Flexible suele exigir SSL. Valores: '', '1', 'true', 'require'
        $this->ssl = strtolower((string) LocalConfig::get('db_ssl', ''));
    }

    public function getConnection() {
        if (self::$conexionDePrueba instanceof PDO) {
            $this->conn = self::$conexionDePrueba;
            return $this->conn;
        }

        $this->conn = null;
        try {
            $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=utf8mb4';
            if ($this->port !== null && $this->port !== '') {
                $dsn .= ';port=' . (int) $this->port;
            }
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ];
            if (in_array($this->ssl, ['1', 'true', 'require', 'yes'], true)) {
                // Azure MySQL Flexible: SSL obligatorio; en demo no verificamos CA local.
                if (defined('PDO::MYSQL_ATTR_SSL_CA')) {
                    $options[PDO::MYSQL_ATTR_SSL_CA] = '';
                }
                if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
                    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
                }
            }
            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                $options
            );
            $this->conn->exec("SET NAMES utf8mb4");
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error de conexión BD: " . $exception->getMessage()]);
            v2Detener();
        }
        return $this->conn;
    }
}
?>
