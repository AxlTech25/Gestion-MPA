<?php
require_once __DIR__ . '/../models/Area.php';
require_once __DIR__ . '/../config/Database.php';

class AreaController {
    private $db;
    private $area;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->area = new Area($this->db);
    }

    public function index() {
        $stmt = $this->area->getAll();
        $areas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $areas]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->nombre)) {
            if ($this->area->create($data)) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Área creada exitosamente."]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "No se pudo crear el área. Verifique que no esté duplicada."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "El nombre del área es obligatorio."]);
        }
    }
}
?>
