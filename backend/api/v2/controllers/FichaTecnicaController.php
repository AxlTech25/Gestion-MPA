<?php
require_once __DIR__ . '/../config/Database.php';

class FichaTecnicaController {
    private const P_EQUIPO = ':equipo_id';

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
               ft.funcionamiento, ft.obsolescencia_tecnologica, ft.repuestos_disponibles,
               ft.resultado_evaluacion, ft.numero_ficha,
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

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$data) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No se encontró equipo con ese código patrimonial."]);
            return;
        }

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

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$data) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No se encontró equipo con ese código patrimonial."]);
            return;
        }

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

    private function esEquipoDeComputo(int $equipoId): bool {
        $stmt = $this->db->prepare('SELECT tipo_equipo FROM v2_equipos WHERE id = :id');
        $stmt->bindValue(':id', $equipoId, PDO::PARAM_INT);
        $stmt->execute();
        $tipo = strtolower(trim((string) $stmt->fetchColumn()));
        foreach (['cpu', 'laptop', 'pc'] as $marca) {
            if ($tipo !== '' && str_contains($tipo, $marca)) {
                return true;
            }
        }
        return false;
    }

    private function numeroFichaActual(int $equipoId): ?string {
        $stmt = $this->db->prepare('SELECT numero_ficha FROM v2_fichas_tecnicas WHERE equipo_id = :equipo_id LIMIT 1');
        $stmt->bindValue(self::P_EQUIPO, $equipoId, PDO::PARAM_INT);
        $stmt->execute();
        $numero = $stmt->fetchColumn();
        $numero = trim((string) $numero);
        return $numero === '' ? null : $numero;
    }

    private function siguienteNumeroFicha(): string {
        $numeros = $this->db->query('SELECT numero_ficha FROM v2_fichas_tecnicas WHERE numero_ficha IS NOT NULL')
            ->fetchAll(PDO::FETCH_COLUMN);
        $max = 0;
        foreach ($numeros as $numero) {
            if (preg_match('/(\d+)/', (string) $numero, $coincide)) {
                $max = max($max, (int) $coincide[1]);
            }
        }
        return 'N° ' . ($max + 1);
    }

    /**
     * @return array{numero:?string,error:?string}
     */
    private function resolverNumeroFicha(int $equipoId, ?string $solicitado): array {
        $texto = trim((string) $solicitado);
        if ($texto === '') {
            $actual = $this->numeroFichaActual($equipoId);
            return ['numero' => $actual ?? $this->siguienteNumeroFicha(), 'error' => null];
        }
        if (!preg_match('/(\d+)/', $texto, $coincide)) {
            return ['numero' => null, 'error' => 'El número de orden debe contener dígitos.'];
        }
        $n = (int) $coincide[1];
        if ($n < 1 || $n > 999999) {
            return ['numero' => null, 'error' => 'El número de orden no es válido.'];
        }
        $numero = 'N° ' . $n;
        $ocupado = $this->db->prepare(
            'SELECT equipo_id FROM v2_fichas_tecnicas WHERE numero_ficha = :numero AND equipo_id <> :equipo_id LIMIT 1'
        );
        $ocupado->bindValue(':numero', $numero);
        $ocupado->bindValue(self::P_EQUIPO, $equipoId, PDO::PARAM_INT);
        $ocupado->execute();
        if ($ocupado->fetch(PDO::FETCH_ASSOC)) {
            return ['numero' => null, 'error' => 'Ese número de orden ya está registrado en otra ficha.'];
        }
        return ['numero' => $numero, 'error' => null];
    }

    private function parseFechaEvaluacion(?string $valor): ?string {
        $valor = trim((string) $valor);
        if ($valor === '') {
            return date('Y-m-d H:i:s');
        }
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $valor, $m)) {
            $fecha = sprintf('%04d-%02d-%02d', (int) $m[1], (int) $m[2], (int) $m[3]);
        } elseif (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $valor, $m)) {
            $fecha = sprintf('%04d-%02d-%02d', (int) $m[3], (int) $m[2], (int) $m[1]);
        } else {
            return null;
        }
        $partes = explode('-', $fecha);
        if (!checkdate((int) $partes[1], (int) $partes[2], (int) $partes[0])) {
            return null;
        }
        return $fecha . ' 00:00:00';
    }

    private function opcionPermitida(?string $valor, array $permitidos): ?string {
        $valor = $this->sanitizeString($valor);
        if ($valor === null) {
            return null;
        }
        foreach ($permitidos as $opcion) {
            if (strcasecmp($valor, $opcion) === 0) {
                return $opcion;
            }
        }
        return null;
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

    private function datosUpsert(bool &$invalido) {
        $invalido = false;
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'multipart/form-data') !== false || !empty($_POST)) {
            return $_POST;
        }
        $requestData = json_decode(v2CuerpoRaw(), true);
        if ($requestData === null && json_last_error() !== JSON_ERROR_NONE) {
            $invalido = true;
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "JSON inválido en la solicitud."]);
            return null;
        }
        return $requestData;
    }

    public function historial($equipo_id) {
        $equipo = $this->db->prepare('SELECT id FROM v2_equipos WHERE id = :id LIMIT 1');
        $equipo->bindValue(':id', $equipo_id, PDO::PARAM_INT);
        $equipo->execute();
        if (!$equipo->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No se encontró el equipo."]);
            return;
        }

        $stmt = $this->db->prepare(
            'SELECT h.id, h.accion, h.cambios, h.fecha, u.nombre_completo AS usuario
             FROM v2_ficha_tecnica_historial h
             LEFT JOIN v2_usuarios u ON u.id = h.usuario_id
             WHERE h.equipo_id = :id
             ORDER BY h.fecha DESC, h.id DESC'
        );
        $stmt->bindValue(':id', $equipo_id, PDO::PARAM_INT);
        $stmt->execute();
        $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($filas as &$fila) {
            $cambios = json_decode((string) ($fila['cambios'] ?? ''), true);
            $fila['cambios'] = is_array($cambios) ? $cambios : [];
        }
        unset($fila);

        echo json_encode(["success" => true, "data" => $filas]);
    }

    public function upsert($equipo_id) {
        $invalido = false;
        $requestData = $this->datosUpsert($invalido);
        if ($invalido) {
            return;
        }

        $procesador              = $this->sanitizeString($requestData['procesador']              ?? null);
        $sistema_operativo       = $this->sanitizeString($requestData['sistema_operativo']       ?? null);
        $licencia_so             = $this->sanitizeString($requestData['licencia_so']             ?? null);
        $mac_address             = $this->sanitizeString($requestData['mac_address']             ?? null);
        $ip_asignada             = $this->sanitizeString($requestData['ip_asignada']             ?? null);
        $software_base           = $this->sanitizeString($requestData['software_base']           ?? null);
        $diagnostico             = $this->sanitizeString($requestData['diagnostico']             ?? $requestData['observaciones_evaluacion'] ?? null);
        $conclusion_motivo       = $this->sanitizeString($requestData['conclusion_motivo']       ?? null);
        $funcionamiento          = $this->opcionPermitida($requestData['funcionamiento'] ?? null, ['Sin fallas', 'Con fallas']);
        $obsolescencia           = $this->opcionPermitida($requestData['obsolescencia_tecnologica'] ?? null, ['Si', 'No']);
        $repuestos               = $this->opcionPermitida($requestData['repuestos_disponibles'] ?? null, ['Si', 'No']);
        $resultado               = $this->opcionPermitida($requestData['resultado_evaluacion'] ?? null, [
            'Puede continuar en servicio',
            'Requiere mantenimiento',
            'Requiere reparación',
            'Técnicamente no resulta ser utilizado',
            'Se recomienda retirar del servicio',
        ]);
        $esComputo               = $this->esEquipoDeComputo((int) $equipo_id);
        $ram_gb                  = $esComputo ? $this->sanitizeInt($requestData['ram_gb'] ?? null) : null;
        $almacenamiento_gb       = $esComputo ? $this->sanitizeInt($requestData['almacenamiento_gb'] ?? null) : null;
        $tipo_disco              = null;
        if ($esComputo) {
            $pedidoDisco = $this->sanitizeString($requestData['tipo_disco'] ?? null);
            $tipo_disco = $this->opcionPermitida($pedidoDisco, ['HDD', 'SSD', 'NVMe']);
            if ($pedidoDisco !== null && $tipo_disco === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El tipo de disco no es válido."]);
                return;
            }
        }
        $estado_conservacion     = $this->sanitizeString($requestData['estado_conservacion']     ?? null);
        $imagen_1                = null;
        $imagen_2                = null;
        if (!$esComputo) {
            $procesador = $sistema_operativo = $licencia_so = $mac_address = $ip_asignada = $software_base = null;
        }

        $numeroResuelto = $this->resolverNumeroFicha((int) $equipo_id, $requestData['numero_ficha'] ?? null);
        if ($numeroResuelto['error'] !== null) {
            $duplicado = str_contains($numeroResuelto['error'], 'ya está registrado');
            http_response_code($duplicado ? 409 : 400);
            echo json_encode(["success" => false, "message" => $numeroResuelto['error']]);
            return;
        }
        $numero_ficha = $numeroResuelto['numero'];
        $fecha_evaluacion = $this->parseFechaEvaluacion($requestData['fecha_evaluacion'] ?? null);
        if ($fecha_evaluacion === null) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "La fecha de la ficha no es válida."]);
            return;
        }

        if (isset($_FILES['imagen_1']) && $_FILES['imagen_1']['error'] === UPLOAD_ERR_OK) {
            $imagen_1 = $this->saveUploadedImage($_FILES['imagen_1']);
        }
        if (isset($_FILES['imagen_2']) && $_FILES['imagen_2']['error'] === UPLOAD_ERR_OK) {
            $imagen_2 = $this->saveUploadedImage($_FILES['imagen_2']);
        }

        $check = $this->db->prepare("SELECT id FROM v2_fichas_tecnicas WHERE equipo_id = :eid");
        $check->bindParam(":eid", $equipo_id);
        $check->execute();
        $fichaExistente = $check->fetch(PDO::FETCH_ASSOC);
        $antes = $this->estadoParaHistorial((int) $equipo_id);

        try {
            $this->db->beginTransaction();
            if ($fichaExistente) {
                $query = "UPDATE v2_fichas_tecnicas SET
                            numero_ficha             = :numero_ficha,
                            procesador               = :procesador,
                            sistema_operativo        = :sistema_operativo,
                            licencia_so              = :licencia_so,
                            mac_address              = :mac_address,
                            ip_asignada              = :ip_asignada,
                            software_base            = :software_base,
                            observaciones_evaluacion = :diagnostico,
                            diagnostico              = :diagnostico,
                            conclusion_motivo        = :conclusion_motivo,
                            funcionamiento           = :funcionamiento,
                            obsolescencia_tecnologica = :obsolescencia,
                            repuestos_disponibles    = :repuestos,
                            resultado_evaluacion     = :resultado,
                            imagen_1                 = COALESCE(:imagen_1, imagen_1),
                            imagen_2                 = COALESCE(:imagen_2, imagen_2),
                            fecha_evaluacion         = :fecha_evaluacion
                          WHERE equipo_id = :equipo_id";
            } else {
                $query = "INSERT INTO v2_fichas_tecnicas
                            (equipo_id, numero_ficha, procesador, sistema_operativo, licencia_so,
                             mac_address, ip_asignada, software_base,
                             observaciones_evaluacion, diagnostico, conclusion_motivo,
                             funcionamiento, obsolescencia_tecnologica, repuestos_disponibles, resultado_evaluacion,
                             imagen_1, imagen_2, fecha_evaluacion)
                          VALUES
                            (:equipo_id, :numero_ficha, :procesador, :sistema_operativo, :licencia_so,
                             :mac_address, :ip_asignada, :software_base,
                             :diagnostico, :diagnostico, :conclusion_motivo,
                             :funcionamiento, :obsolescencia, :repuestos, :resultado,
                             :imagen_1, :imagen_2, :fecha_evaluacion)";
            }

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(self::P_EQUIPO, $equipo_id);
            $stmt->bindParam(":numero_ficha", $numero_ficha);
            $stmt->bindParam(":procesador", $procesador);
            $stmt->bindParam(":sistema_operativo", $sistema_operativo);
            $stmt->bindParam(":licencia_so", $licencia_so);
            $stmt->bindParam(":mac_address", $mac_address);
            $stmt->bindParam(":ip_asignada", $ip_asignada);
            $stmt->bindParam(":software_base", $software_base);
            $stmt->bindParam(":diagnostico", $diagnostico);
            $stmt->bindParam(":conclusion_motivo", $conclusion_motivo);
            $stmt->bindParam(":funcionamiento", $funcionamiento);
            $stmt->bindParam(":obsolescencia", $obsolescencia);
            $stmt->bindParam(":repuestos", $repuestos);
            $stmt->bindParam(":resultado", $resultado);
            $stmt->bindParam(":imagen_1", $imagen_1);
            $stmt->bindParam(":imagen_2", $imagen_2);
            $stmt->bindParam(":fecha_evaluacion", $fecha_evaluacion);
            $stmt->execute();

            if ($esComputo) {
                $upd = $this->db->prepare("UPDATE v2_equipos SET
                    ram_gb              = :ram_gb,
                    almacenamiento_gb   = :almacenamiento_gb,
                    tipo_disco          = :tipo_disco,
                    estado_conservacion = :estado_conservacion
                  WHERE id = :id");
                $upd->bindParam(":ram_gb", $ram_gb);
                $upd->bindParam(":almacenamiento_gb", $almacenamiento_gb);
                if ($tipo_disco === null) {
                    $upd->bindValue(':tipo_disco', null, PDO::PARAM_NULL);
                } else {
                    $upd->bindValue(':tipo_disco', $tipo_disco);
                }
            } else {
                $upd = $this->db->prepare("UPDATE v2_equipos SET
                    estado_conservacion = :estado_conservacion
                  WHERE id = :id");
            }
            $upd->bindParam(":estado_conservacion", $estado_conservacion);
            $upd->bindParam(":id", $equipo_id);
            $upd->execute();

            $this->registrarHistorial((int) $equipo_id, $antes, [
                'numero_ficha' => $numero_ficha,
                'fecha_evaluacion' => $fecha_evaluacion,
                'procesador' => $procesador,
                'sistema_operativo' => $sistema_operativo,
                'licencia_so' => $licencia_so,
                'mac_address' => $mac_address,
                'ip_asignada' => $ip_asignada,
                'software_base' => $software_base,
                'diagnostico' => $diagnostico,
                'conclusion_motivo' => $conclusion_motivo,
                'funcionamiento' => $funcionamiento,
                'obsolescencia_tecnologica' => $obsolescencia,
                'repuestos_disponibles' => $repuestos,
                'resultado_evaluacion' => $resultado,
                'imagen_1' => $imagen_1 ?? ($antes['imagen_1'] ?? null),
                'imagen_2' => $imagen_2 ?? ($antes['imagen_2'] ?? null),
                'ram_gb' => $esComputo ? $ram_gb : ($antes['ram_gb'] ?? null),
                'almacenamiento_gb' => $esComputo ? $almacenamiento_gb : ($antes['almacenamiento_gb'] ?? null),
                'tipo_disco' => $esComputo ? $tipo_disco : ($antes['tipo_disco'] ?? null),
                'estado_conservacion' => $estado_conservacion,
                'estado_operativo' => $antes['estado_operativo'] ?? null,
            ], !$fichaExistente);

            $this->db->commit();
            echo json_encode(["success" => true, "message" => "Ficha técnica guardada correctamente."]);
        } catch (PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            $duplicado = (int) ($e->errorInfo[1] ?? 0) === 1062
                && str_contains($e->getMessage(), 'numero_ficha');
            if ($duplicado) {
                http_response_code(409);
                echo json_encode(["success" => false, "message" => "Ese número de orden ya está registrado en otra ficha."]);
                return;
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    private function estadoParaHistorial(int $equipoId): array {
        $stmt = $this->db->prepare(
            'SELECT ft.numero_ficha, ft.fecha_evaluacion, ft.procesador, ft.sistema_operativo,
                    ft.licencia_so, ft.mac_address, ft.ip_asignada, ft.software_base,
                    ft.diagnostico, ft.conclusion_motivo, ft.funcionamiento,
                    ft.obsolescencia_tecnologica, ft.repuestos_disponibles, ft.resultado_evaluacion,
                    ft.imagen_1, ft.imagen_2,
                    e.ram_gb, e.almacenamiento_gb, e.tipo_disco,
                    e.estado_conservacion, e.estado_operativo
             FROM v2_equipos e
             LEFT JOIN v2_fichas_tecnicas ft ON ft.equipo_id = e.id
             WHERE e.id = :id
             LIMIT 1'
        );
        $stmt->bindValue(':id', $equipoId, PDO::PARAM_INT);
        $stmt->execute();
        $fila = $stmt->fetch(PDO::FETCH_ASSOC);
        return $fila ?: [];
    }

    private function textoHistorial($valor, bool $esFecha = false): string {
        if ($valor === null) {
            return '';
        }
        $texto = trim((string) $valor);
        if ($esFecha && preg_match('/^(\d{4}-\d{2}-\d{2})/', $texto, $coincide)) {
            return $coincide[1];
        }
        return $texto;
    }

    private function registrarHistorial(int $equipoId, array $antes, array $despues, bool $creacion): void {
        $cambios = [];
        foreach ($despues as $campo => $valor) {
            $esFecha = $campo === 'fecha_evaluacion';
            $anterior = $this->textoHistorial($antes[$campo] ?? null, $esFecha);
            $nuevo = $this->textoHistorial($valor, $esFecha);
            if ($anterior === $nuevo) {
                continue;
            }
            $cambios[] = ['campo' => $campo, 'antes' => $anterior, 'despues' => $nuevo];
        }
        if ($cambios === []) {
            return;
        }

        $accion = $creacion ? 'Creación' : 'Actualización';
        $json = json_encode($cambios, JSON_UNESCAPED_UNICODE);
        $usuarioId = $this->usuarioActualId();
        $stmt = $this->db->prepare(
            'INSERT INTO v2_ficha_tecnica_historial (equipo_id, usuario_id, accion, cambios)
             VALUES (:equipo_id, :usuario_id, :accion, :cambios)'
        );
        $stmt->bindValue(':equipo_id', $equipoId, PDO::PARAM_INT);
        if ($usuarioId === null) {
            $stmt->bindValue(':usuario_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':usuario_id', $usuarioId, PDO::PARAM_INT);
        }
        $stmt->bindValue(':accion', $accion);
        $stmt->bindValue(':cambios', $json);
        $stmt->execute();
    }

    private function usuarioActualId(): ?int {
        if (empty($_SERVER['HTTP_AUTHORIZATION'])
            && empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])
            && empty($_SERVER['Authorization'])) {
            return null;
        }
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $payload = AuthMiddleware::requireAuth();
        return isset($payload->sub) ? (int) $payload->sub : null;
    }
}
?>
