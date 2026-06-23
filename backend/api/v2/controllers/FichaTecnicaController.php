<?php
require_once __DIR__ . '/../config/Database.php';

class FichaTecnicaController {
    private $db;

    private const SELECT_QUERY = "
        SELECT e.id, e.codigo_patrimonial, e.codigo_identificativo,
               e.tipo_equipo, e.marca, e.modelo, e.numero_serie,
               e.ram_gb, e.almacenamiento_gb, e.tipo_disco,
               e.fecha_adquisicion, e.fecha_registro,
               e.costo_estimado, e.ubicacion_fisica,
               e.estado_conservacion, e.estado_operativo,
               a.nombre AS area_nombre,
               COALESCE(e.responsable_nombre, a.jefe_encargado) AS responsable_nombre,
               ft.id AS ficha_id, ft.procesador, ft.sistema_operativo,
               ft.licencia_so, ft.mac_address, ft.ip_asignada, ft.software_base,
               ft.observaciones_evaluacion, ft.fecha_evaluacion
        FROM v2_equipos e
        LEFT JOIN v2_areas a ON e.area_id = a.id
        LEFT JOIN v2_fichas_tecnicas ft ON e.id = ft.equipo_id
    ";

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function show($equipo_id) {
        $this->respondEquipo("e.id = :id", [':id' => $equipo_id]);
    }

    public function searchByCodigo($codigo) {
        $codigo = trim(urldecode($codigo));
        if ($codigo === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Ingrese un código patrimonial."]);
            return;
        }
        $this->respondEquipo("e.codigo_patrimonial = :codigo", [':codigo' => $codigo]);
    }

    private function respondEquipo(string $where, array $params) {
        $query = self::SELECT_QUERY . " WHERE {$where} LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No se encontró equipo con ese código patrimonial."]);
            return;
        }

        echo json_encode(["success" => true, "data" => $stmt->fetch(PDO::FETCH_ASSOC)]);
    }

    public function upsert($equipo_id) {
        $input = json_decode(file_get_contents("php://input"));

        $procesador              = $input->procesador              ?? null;
        $sistema_operativo       = $input->sistema_operativo       ?? null;
        $licencia_so             = $input->licencia_so             ?? null;
        $mac_address             = $input->mac_address             ?? null;
        $ip_asignada             = $input->ip_asignada             ?? null;
        $software_base           = $input->software_base           ?? null;
        $observaciones_evaluacion = $input->observaciones_evaluacion ?? null;
        $ram_gb                  = $input->ram_gb                  ?? null;
        $almacenamiento_gb       = $input->almacenamiento_gb       ?? null;
        $tipo_disco              = $input->tipo_disco              ?? null;
        $estado_conservacion     = $input->estado_conservacion     ?? null;
        $estado_operativo        = $input->estado_operativo        ?? null;

        $check = $this->db->prepare("SELECT id FROM v2_fichas_tecnicas WHERE equipo_id = :eid");
        $check->bindParam(":eid", $equipo_id);
        $check->execute();

        try {
            if ($check->rowCount() > 0) {
                $query = "UPDATE v2_fichas_tecnicas SET
                            procesador               = :procesador,
                            sistema_operativo        = :sistema_operativo,
                            licencia_so              = :licencia_so,
                            mac_address              = :mac_address,
                            ip_asignada              = :ip_asignada,
                            software_base            = :software_base,
                            observaciones_evaluacion = :observaciones_evaluacion,
                            fecha_evaluacion         = NOW()
                          WHERE equipo_id = :equipo_id";
            } else {
                $query = "INSERT INTO v2_fichas_tecnicas
                            (equipo_id, procesador, sistema_operativo, licencia_so,
                             mac_address, ip_asignada, software_base,
                             observaciones_evaluacion, fecha_evaluacion)
                          VALUES
                            (:equipo_id, :procesador, :sistema_operativo, :licencia_so,
                             :mac_address, :ip_asignada, :software_base,
                             :observaciones_evaluacion, NOW())";
            }

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":equipo_id", $equipo_id);
            $stmt->bindParam(":procesador", $procesador);
            $stmt->bindParam(":sistema_operativo", $sistema_operativo);
            $stmt->bindParam(":licencia_so", $licencia_so);
            $stmt->bindParam(":mac_address", $mac_address);
            $stmt->bindParam(":ip_asignada", $ip_asignada);
            $stmt->bindParam(":software_base", $software_base);
            $stmt->bindParam(":observaciones_evaluacion", $observaciones_evaluacion);
            $stmt->execute();

            $upd = $this->db->prepare("UPDATE v2_equipos SET
                ram_gb              = :ram_gb,
                almacenamiento_gb   = :almacenamiento_gb,
                tipo_disco          = :tipo_disco,
                estado_conservacion = :estado_conservacion,
                estado_operativo    = :estado_operativo
              WHERE id = :id");
            $upd->bindParam(":ram_gb", $ram_gb);
            $upd->bindParam(":almacenamiento_gb", $almacenamiento_gb);
            $upd->bindParam(":tipo_disco", $tipo_disco);
            $upd->bindParam(":estado_conservacion", $estado_conservacion);
            $upd->bindParam(":estado_operativo", $estado_operativo);
            $upd->bindParam(":id", $equipo_id);
            $upd->execute();

            echo json_encode(["success" => true, "message" => "Ficha técnica guardada correctamente."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }
}
?>
