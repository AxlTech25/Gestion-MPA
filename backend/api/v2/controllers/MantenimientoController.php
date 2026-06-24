<?php
require_once __DIR__ . '/../models/Mantenimiento.php';
require_once __DIR__ . '/../models/Equipo.php';
require_once __DIR__ . '/../models/MetricaEquipo.php';
require_once __DIR__ . '/../services/MlService.php';
require_once __DIR__ . '/../config/Database.php';

class MantenimientoController {
    private $db;
    private $mantenimiento;
    private $equipo;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->mantenimiento = new Mantenimiento($this->db);
        $this->equipo = new Equipo($this->db);
    }

    public function index() {
        $stmt = $this->mantenimiento->getAll();
        $mantenimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $mantenimientos]);
    }

    public function historialByCodigo(string $codigo) {
        $codigo = trim(urldecode($codigo));
        if ($codigo === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Ingrese un código patrimonial."]);
            return;
        }

        $equipo = $this->mantenimiento->getEquipoByCodigo($codigo);
        if (!$equipo) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No se encontró equipo con ese código patrimonial."]);
            return;
        }

        $stmt = $this->mantenimiento->getByEquipoId((int) $equipo['id']);
        $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => [
                "equipo" => $equipo,
                "historial" => $historial,
            ],
        ]);
    }

    public function show(int $id) {
        $ficha = $this->mantenimiento->getById($id);
        if (!$ficha) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Intervención no encontrada."]);
            return;
        }
        echo json_encode(["success" => true, "data" => $ficha]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        // Validación básica
        if (!empty($data->equipo_id) && !empty($data->fecha_intervencion) && !empty($data->tipo_mantenimiento)) {
            
            // Auto-generar número de orden si no viene
            if(empty($data->nro_orden)) {
                $data->nro_orden = "ORD-" . date("Ymd-His");
            }

            $mantenimientoId = $this->mantenimiento->create($data);
            if ($mantenimientoId) {
                $sync = $this->mantenimiento->buildEquipoSyncPayload($data);
                $this->equipo->syncTelemetria((int) $data->equipo_id, $sync);

                $metrica = new MetricaEquipo($this->db);
                $metrica->registrarDesdeMantenimiento((int) $data->equipo_id, $mantenimientoId, $data);

                $ml = new MlService($this->db);
                $ml->recalcularEquipo((int) $data->equipo_id);

                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "message" => "Mantenimiento registrado exitosamente.",
                    "data"    => ["id" => $mantenimientoId],
                ]);
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
