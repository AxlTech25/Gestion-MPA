<?php
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../config/Database.php';

class UsuarioController {
    private $db;
    private $usuario;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->usuario = new Usuario($this->db);
    }

    public function index() {
        $stmt = $this->usuario->getAll();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $usuarios]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->nombre_completo) && !empty($data->usuario) && !empty($data->password) && !empty($data->rol)) {
            if ($this->usuario->create($data)) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Usuario creado exitosamente."]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "No se pudo crear el usuario. Quizás el nombre de usuario ya existe."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios para el usuario."]);
        }
    }
}
?>
