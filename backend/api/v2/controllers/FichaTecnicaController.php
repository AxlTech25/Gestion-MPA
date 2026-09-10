<?php
require_once __DIR__ . '/../config/Database.php';

class FichaTecnicaController {
    private $db;

    private const SELECT_QUERY = "
        SELECT e.id AS equipo_id, e.codigo_patrimonial, e.codigo_identificativo,
               e.tipo_equipo, e.marca, e.modelo, e.numero_serie,
               e.ram_gb, e.almacenamiento_gb, e.tipo_disco,
               e.fecha_adquisicion, e.fecha_registro,
               e.costo_estimado, e.ubicacion_fisica,
               e.estado_conservacion, e.estado_operativo,
               a.nombre AS area_nombre,
               COALESCE(e.responsable_nombre, a.jefe_encargado) AS responsable_nombre,
               ft.id AS ficha_id, ft.procesador, ft.sistema_operativo,
               ft.licencia_so, ft.mac_address, ft.ip_asignada, ft.software_base,
               ft.observaciones_evaluacion, ft.diagnostico, ft.conclusion_motivo,
               ft.imagen_1, ft.imagen_2, ft.fecha_evaluacion
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
        $codigo = trim(urldecode((string) $codigo));
        if ($codigo === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Ingrese un código patrimonial."]);
            return;
        }
        $this->findByPatrimonialCode($codigo);
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

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($data['equipo_id']) && !isset($data['id'])) {
            $data['id'] = $data['equipo_id'];
        }

        echo json_encode(["success" => true, "data" => $data]);
    }

    private function findByPatrimonialCode(string $codigo): void {
        $codigo = trim((string) $codigo);
        if ($codigo === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Código patrimonial requerido."]);
            return;
        }

        $query = self::SELECT_QUERY . " WHERE TRIM(CAST(e.codigo_patrimonial AS CHAR)) = :codigo
                                      OR TRIM(CAST(e.codigo_identificativo AS CHAR)) = :codigo
                                      LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':codigo', $codigo);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No se encontró equipo con ese código patrimonial."]);
            return;
        }

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($data['equipo_id']) && !isset($data['id'])) {
            $data['id'] = $data['equipo_id'];
        }

        echo json_encode(["success" => true, "data" => $data]);
    }

    private function sanitizeString($value): ?string {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);
        return $value === '' ? null : $value;
    }

    private function resolveNumeroFicha(int $equipo_id, ?int $fichaId = null): ?string {
        $columnCheck = $this->db->query("SHOW COLUMNS FROM v2_fichas_tecnicas LIKE 'numero_ficha'");
        if ($columnCheck->rowCount() === 0) {
            return null;
        }

        $existing = $this->db->prepare("SELECT id, numero_ficha FROM v2_fichas_tecnicas WHERE equipo_id = :equipo_id LIMIT 1");
        $existing->bindParam(':equipo_id', $equipo_id, PDO::PARAM_INT);
        $existing->execute();
        $row = $existing->fetch(PDO::FETCH_ASSOC);

        if ($row && !empty($row['numero_ficha'])) {
            return trim((string) $row['numero_ficha']);
        }

        $nextNumber = (int) $this->db->query(
            "SELECT COALESCE(MAX(CAST(SUBSTRING(numero_ficha, 3) AS UNSIGNED)), 0)
             FROM v2_fichas_tecnicas
             WHERE numero_ficha REGEXP '^N[°º][[:space:]]*[0-9]+$'"
        )->fetchColumn() + 1;

        $numero = 'N° ' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
        $update = $this->db->prepare("UPDATE v2_fichas_tecnicas SET numero_ficha = :numero WHERE equipo_id = :equipo_id");
        $update->bindParam(':numero', $numero);
        $update->bindParam(':equipo_id', $equipo_id, PDO::PARAM_INT);
        $update->execute();

        return $numero;
    }

    private function sanitizeInt($value): ?int {
        if ($value === null || $value === '') {
            return null;
        }

        $intValue = filter_var($value, FILTER_VALIDATE_INT);
        return $intValue === false ? null : (int) $intValue;
    }

    private function saveUploadedImage(array $file): ?string {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $allowedExt = ['jpg', 'jpeg', 'png'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true)) {
            throw new Exception('Solo se permiten imágenes JPG/JPEG/PNG.');
        }

        $uploadDir = __DIR__ . '/../../../uploads/fichas_tecnicas';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
            throw new Exception('No se pudo crear el directorio de imágenes.');
        }

        $baseName = pathinfo($file['name'], PATHINFO_FILENAME);
        $baseName = preg_replace('/[^A-Za-z0-9_-]+/', '_', $baseName);
        $fileName = sprintf('%s_%s.%s', $baseName, bin2hex(random_bytes(4)), $ext);
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new Exception('No se pudo guardar la imagen.');
        }

        return $fileName;
    }

    public function upsert($equipo_id) {
        $requestData = null;
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'multipart/form-data') !== false || !empty($_POST)) {
            $requestData = $_POST;
        } else {
            $requestData = json_decode(file_get_contents("php://input"), true);
            if ($requestData === null && json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "JSON inválido en la solicitud."]);
                return;
            }
        }

        $procesador              = $this->sanitizeString($requestData['procesador']              ?? null);
        $sistema_operativo       = $this->sanitizeString($requestData['sistema_operativo']       ?? null);
        $licencia_so             = $this->sanitizeString($requestData['licencia_so']             ?? null);
        $mac_address             = $this->sanitizeString($requestData['mac_address']             ?? null);
        $ip_asignada             = $this->sanitizeString($requestData['ip_asignada']             ?? null);
        $software_base           = $this->sanitizeString($requestData['software_base']           ?? null);
        $diagnostico             = $this->sanitizeString($requestData['diagnostico']             ?? $requestData['observaciones_evaluacion'] ?? null);
        $conclusion_motivo       = $this->sanitizeString($requestData['conclusion_motivo']       ?? null);
        $ram_gb                  = $this->sanitizeInt($requestData['ram_gb']                  ?? null);
        $almacenamiento_gb       = $this->sanitizeInt($requestData['almacenamiento_gb']       ?? null);
        $tipo_disco              = $this->sanitizeString($requestData['tipo_disco']              ?? null);
        $estado_conservacion     = $this->sanitizeString($requestData['estado_conservacion']     ?? null);
        $estado_operativo        = $this->sanitizeString($requestData['estado_operativo']        ?? null);
        $imagen_1                = null;
        $imagen_2                = null;

        if (isset($_FILES['imagen_1']) && $_FILES['imagen_1']['error'] === UPLOAD_ERR_OK) {
            $imagen_1 = $this->saveUploadedImage($_FILES['imagen_1']);
        }
        if (isset($_FILES['imagen_2']) && $_FILES['imagen_2']['error'] === UPLOAD_ERR_OK) {
            $imagen_2 = $this->saveUploadedImage($_FILES['imagen_2']);
        }

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
                            observaciones_evaluacion = :diagnostico,
                            diagnostico              = :diagnostico,
                            conclusion_motivo        = :conclusion_motivo,
                            imagen_1                 = COALESCE(:imagen_1, imagen_1),
                            imagen_2                 = COALESCE(:imagen_2, imagen_2),
                            fecha_evaluacion         = NOW()
                          WHERE equipo_id = :equipo_id";
            } else {
                $query = "INSERT INTO v2_fichas_tecnicas
                            (equipo_id, procesador, sistema_operativo, licencia_so,
                             mac_address, ip_asignada, software_base,
                             observaciones_evaluacion, diagnostico, conclusion_motivo,
                             imagen_1, imagen_2, fecha_evaluacion)
                          VALUES
                            (:equipo_id, :procesador, :sistema_operativo, :licencia_so,
                             :mac_address, :ip_asignada, :software_base,
                             :diagnostico, :diagnostico, :conclusion_motivo,
                             :imagen_1, :imagen_2, NOW())";
            }

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":equipo_id", $equipo_id);
            $stmt->bindParam(":procesador", $procesador);
            $stmt->bindParam(":sistema_operativo", $sistema_operativo);
            $stmt->bindParam(":licencia_so", $licencia_so);
            $stmt->bindParam(":mac_address", $mac_address);
            $stmt->bindParam(":ip_asignada", $ip_asignada);
            $stmt->bindParam(":software_base", $software_base);
            $stmt->bindParam(":diagnostico", $diagnostico);
            $stmt->bindParam(":conclusion_motivo", $conclusion_motivo);
            $stmt->bindParam(":imagen_1", $imagen_1);
            $stmt->bindParam(":imagen_2", $imagen_2);
            $stmt->execute();

            $fichaId = (int) $this->db->lastInsertId();
            if ($check->rowCount() > 0) {
                $fichaId = $this->db->query("SELECT id FROM v2_fichas_tecnicas WHERE equipo_id = {$equipo_id} LIMIT 1")->fetchColumn();
            }
            $this->resolveNumeroFicha((int) $equipo_id, $fichaId ? (int) $fichaId : null);

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
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}
?>
