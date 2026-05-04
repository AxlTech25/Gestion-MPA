<?php
require_once __DIR__ . '/../models/Mantenimiento.php';
require_once __DIR__ . '/../config/Database.php';

class MantenimientoController {
    private $db;
    private $mantenimiento;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->mantenimiento = new Mantenimiento($this->db);
    }

    public function index() {
        $stmt = $this->mantenimiento->getAll();
        $mantenimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $mantenimientos]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        // Validación básica
        if (!empty($data->equipo_id) && !empty($data->fecha_intervencion) && !empty($data->tipo_mantenimiento)) {
            
            // Auto-generar número de orden si no viene
            if(empty($data->nro_orden)) {
                $data->nro_orden = "ORD-" . date("Ymd-His");
            }

            if ($this->mantenimiento->create($data)) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Mantenimiento registrado exitosamente."]);
            } else {
                http_response_code(503);
                echo json_encode(["success" => false, "message" => "No se pudo registrar el mantenimiento."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (Equipo, Fecha, Tipo)."]);
        }
    }
}
?>
