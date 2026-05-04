<?php
require_once __DIR__ . '/../config/Database.php';

class FichaTecnicaController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // GET /api/v2/fichas-tecnicas/{equipo_id}
    public function show($equipo_id) {
        $query = "SELECT e.id, e.codigo_patrimonial, e.codigo_identificativo,
                         e.tipo_equipo, e.marca, e.modelo, e.numero_serie,
                         e.ram_gb, e.almacenamiento_gb, e.tipo_disco,
                         e.fecha_adquisicion, e.fecha_registro,
                         e.estado_conservacion, e.estado_operativo,
                         a.nombre as area_nombre, a.jefe_encargado,
                         ft.id as ficha_id, ft.procesador, ft.sistema_operativo,
                         ft.licencia_so, ft.mac_address, ft.ip_asignada, ft.software_base
                  FROM v2_equipos e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
                  LEFT JOIN v2_fichas_tecnicas ft ON e.id = ft.equipo_id
                  WHERE e.id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $equipo_id);
        $stmt->execute();

        if ($stmt->rowCount() == 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Equipo no encontrado."]);
            return;
        }

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);
    }

    // PUT /api/v2/fichas-tecnicas/{equipo_id} — crea o actualiza ficha
    public function upsert($equipo_id) {
        $input = json_decode(file_get_contents("php://input"));

        // Verificar si ya existe ficha
        $check = $this->db->prepare("SELECT id FROM v2_fichas_tecnicas WHERE equipo_id = :eid");
        $check->bindParam(":eid", $equipo_id);
        $check->execute();

        try {
            if ($check->rowCount() > 0) {
                // UPDATE
                $query = "UPDATE v2_fichas_tecnicas SET
                            procesador       = :procesador,
                            sistema_operativo = :sistema_operativo,
                            licencia_so      = :licencia_so,
                            mac_address      = :mac_address,
                            ip_asignada      = :ip_asignada,
                            software_base    = :software_base
                          WHERE equipo_id = :equipo_id";
            } else {
                // INSERT
                $query = "INSERT INTO v2_fichas_tecnicas
                            (equipo_id, procesador, sistema_operativo, licencia_so, mac_address, ip_asignada, software_base)
                          VALUES
                            (:equipo_id, :procesador, :sistema_operativo, :licencia_so, :mac_address, :ip_asignada, :software_base)";
            }

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":equipo_id",        $equipo_id);
            $stmt->bindParam(":procesador",        $input->procesador ?? null);
            $stmt->bindParam(":sistema_operativo", $input->sistema_operativo ?? null);
            $stmt->bindParam(":licencia_so",       $input->licencia_so ?? null);
            $stmt->bindParam(":mac_address",       $input->mac_address ?? null);
            $stmt->bindParam(":ip_asignada",       $input->ip_asignada ?? null);
            $stmt->bindParam(":software_base",     $input->software_base ?? null);
            $stmt->execute();

            // Actualizar también ram/disco/almacenamiento en v2_equipos si vienen
            if (isset($input->ram_gb) || isset($input->almacenamiento_gb) || isset($input->estado_conservacion)) {
                $upd = $this->db->prepare("UPDATE v2_equipos SET
                    ram_gb              = :ram_gb,
                    almacenamiento_gb   = :almacenamiento_gb,
                    tipo_disco          = :tipo_disco,
                    estado_conservacion = :estado_conservacion,
                    estado_operativo    = :estado_operativo
                  WHERE id = :id");
                $upd->bindParam(":ram_gb",              $input->ram_gb ?? null);
                $upd->bindParam(":almacenamiento_gb",   $input->almacenamiento_gb ?? null);
                $upd->bindParam(":tipo_disco",          $input->tipo_disco ?? null);
                $upd->bindParam(":estado_conservacion", $input->estado_conservacion ?? null);
                $upd->bindParam(":estado_operativo",    $input->estado_operativo ?? null);
                $upd->bindParam(":id",                  $equipo_id);
                $upd->execute();
            }

            echo json_encode(["success" => true, "message" => "Ficha técnica guardada correctamente."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }
}
?>
