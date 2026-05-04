<?php
require_once __DIR__ . '/../models/Equipo.php';
require_once __DIR__ . '/../config/Database.php';

class EquipoController {
    private $db;
    private $equipo;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->equipo = new Equipo($this->db);
    }

    public function index() {
        $stmt = $this->equipo->getAll();
        $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $equipos]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->codigo_patrimonial) && !empty($data->tipo_equipo) && !empty($data->area_id)) {
            if ($this->equipo->create($data)) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Equipo registrado exitosamente."]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "No se pudo registrar el equipo. Revise duplicados o errores."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (Código patrimonial, Tipo y Área)."]);
        }
    }
}
?>
