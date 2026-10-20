<?php
class Equipo {
    private $conn;
    private $table_name = "v2_equipos";
    private ?string $lastError = null;

    private const TIPOS_VALIDOS = ['Laptop', 'CPU', 'Impresora', 'Monitor', 'Otro'];

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT e.*,
                         a.nombre AS area_nombre,
                         a.descripcion AS area_descripcion,
                         a.jefe_encargado AS area_jefe
                  FROM " . $this->table_name . " e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
                  ORDER BY e.fecha_registro DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById(int $id): ?array {
        $query = "SELECT e.*,
                         a.nombre AS area_nombre,
                         a.descripcion AS area_descripcion,
                         a.jefe_encargado AS area_jefe,
                         ft.procesador, ft.sistema_operativo
                  FROM " . $this->table_name . " e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
                  LEFT JOIN v2_fichas_tecnicas ft ON e.id = ft.equipo_id
                  WHERE e.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getLastError(): ?string {
        return $this->lastError;
    }

    public function create($data) {
        $this->lastError = null;
        $fields = $this->fieldsFromObject($data);
        if (isset($fields['error'])) {
            $this->lastError = $fields['error'];
            return false;
        }
        $unico = $this->mensajeUnicidad($fields, 0);
        if ($unico !== null) {
            $this->lastError = $unico;
            return false;
        }
        return $this->insertEquipo($fields) !== false;
    }

    public function delete(int $id): array {
        if (!$this->getById($id)) {
            return ['ok' => false, 'status' => 404, 'message' => 'Equipo no encontrado.'];
        }
        try {
            $this->conn->beginTransaction();
            $tablas = $this->conn->query("SHOW TABLES LIKE 'v2_hojas_baja'");
            if ($tablas && $tablas->fetch()) {
                $baja = $this->conn->prepare('DELETE FROM v2_hojas_baja WHERE equipo_id = :id');
                $baja->bindValue(':id', $id, PDO::PARAM_INT);
                $baja->execute();
            }
            $stmt = $this->conn->prepare('DELETE FROM ' . $this->table_name . ' WHERE id = :id');
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $this->conn->commit();
            return ['ok' => true];
        } catch (PDOException $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log('Error eliminando equipo: ' . $e->getMessage());
            return [
                'ok' => false,
                'status' => 409,
                'message' => 'No se pudo eliminar el equipo. Tiene registros asociados que lo impiden.',
            ];
        }
    }

    public function update(int $id, $data): bool {
        $this->lastError = null;
        if (!$this->getById($id)) {
            $this->lastError = 'Equipo no encontrado.';
            return false;
        }
        $fields = $this->fieldsFromObject($data);
        if (isset($fields['error'])) {
            $this->lastError = $fields['error'];
            return false;
        }
        $unico = $this->mensajeUnicidad($fields, $id);
        if ($unico !== null) {
            $this->lastError = $unico;
            return false;
        }
        return $this->updateEquipo($id, $fields);
    }

    public function importRow(array $row): array {
        $fields = $this->fieldsFromArray($row);
        if (isset($fields['error'])) {
            return ['ok' => false, 'error' => $fields['error']];
        }
        $unico = $this->mensajeUnicidad($fields, 0);
        if ($unico !== null) {
            return ['ok' => false, 'error' => $unico];
        }
        $id = $this->insertEquipo($fields);
        if ($id === false) {
            return ['ok' => false, 'error' => $this->lastError ?: 'No se pudo registrar (código patrimonial o identificativo duplicado).'];
        }
        return ['ok' => true, 'id' => $id];
    }

    private function fieldsFromObject($data): array {
        if (empty($data->codigo_patrimonial) || empty($data->tipo_equipo) || empty($data->area_id)) {
            return ['error' => 'Faltan datos obligatorios.'];
        }
        $fields = $this->buildFields(
            (string) $data->codigo_patrimonial,
            $this->nullableStr($data->codigo_identificativo ?? null),
            (string) $data->tipo_equipo,
            $this->nullableStr($data->marca ?? null),
            $this->nullableStr($data->modelo ?? null),
            $this->nullableStr($data->color ?? null),
            $this->nullableStr($data->numero_serie ?? null),
            $this->nullableInt($data->ram_gb ?? null),
            $this->nullableInt($data->almacenamiento_gb ?? null),
            $this->nullableStr($data->tipo_disco ?? null),
            $this->parseFecha($data->fecha_adquisicion ?? null),
            (int) $data->area_id,
            $this->nullableStr($data->procesador ?? null),
            $this->nullableStr($data->sistema_operativo ?? null)
        );
        $fields['horas_uso'] = isset($data->horas_uso) ? (int) $data->horas_uso : 0;
        $fields['errores_smart'] = isset($data->errores_smart) ? (int) $data->errores_smart : 0;
        $fields['contador_paginas'] = $this->nullableInt($data->contador_paginas ?? null);
        $fields['salud_bateria'] = $this->nullableDecimal($data->salud_bateria ?? null);
        $fields['ultima_temp_cpu'] = $this->nullableDecimal($data->ultima_temp_cpu ?? null);
        $fields['ultima_temp_disco'] = $this->nullableDecimal($data->ultima_temp_disco ?? null);
        return $fields;
    }

    private function fieldsFromArray(array $row): array {
        $patrimonial = $this->str($row['codigo_patrimonial'] ?? '');
        $tipo = $this->str($row['tipo_equipo'] ?? '');
        $areaNombre = $this->str($row['area'] ?? '');

        if ($patrimonial === '') {
            return ['error' => 'Código patrimonial obligatorio.'];
        }
        if (!preg_match('/^\d{12}$/', $patrimonial)) {
            return ['error' => "Código patrimonial '{$patrimonial}' debe tener 12 dígitos."];
        }
        if ($tipo === '') {
            return ['error' => 'Tipo de equipo obligatorio.'];
        }
        if ($areaNombre === '') {
            return ['error' => 'Área obligatoria.'];
        }

        $areaId = $this->resolveAreaId($areaNombre);
        if (!$areaId) {
            return ['error' => "Área '{$areaNombre}' no existe en el sistema."];
        }

        $tipoNorm = $this->normalizeTipo($tipo);
        if (!$tipoNorm) {
            return ['error' => "Tipo '{$tipo}' no válido. Use: " . implode(', ', self::TIPOS_VALIDOS)];
        }

        $ident = $this->str($row['codigo_identificativo'] ?? '');
        if ($ident !== '' && !preg_match('/^\d{1,6}$/', $ident)) {
            return ['error' => 'Código identificativo debe ser numérico (máx. 6 dígitos).'];
        }

        $fields = $this->buildFields(
            $patrimonial,
            $ident !== '' ? $ident : null,
            $tipoNorm,
            $this->nullableStr($row['marca'] ?? null),
            $this->nullableStr($row['modelo'] ?? null),
            $this->nullableStr($row['color'] ?? null),
            $this->nullableStr($row['numero_serie'] ?? null),
            $this->nullableInt($row['ram_gb'] ?? null),
            $this->nullableInt($row['almacenamiento_gb'] ?? null),
            $this->discoParaTipo($tipoNorm, $row['tipo_disco'] ?? null),
            $this->parseFecha($row['fecha_adquisicion'] ?? null),
            $areaId,
            $this->nullableStr($row['procesador'] ?? null),
            $this->nullableStr($row['sistema_operativo'] ?? null)
        );
        $esPc = in_array($tipoNorm, ['Laptop', 'CPU'], true);
        $fields['horas_uso'] = $esPc ? (int) ($this->nullableInt($row['horas_uso'] ?? null) ?? 0) : 0;
        $fields['errores_smart'] = $esPc ? (int) ($this->nullableInt($row['errores_smart'] ?? null) ?? 0) : 0;
        $fields['contador_paginas'] = $tipoNorm === 'Impresora'
            ? $this->nullableInt($row['contador_paginas'] ?? null)
            : null;
        $fields['salud_bateria'] = $tipoNorm === 'Laptop'
            ? $this->nullableDecimal($row['salud_bateria'] ?? null)
            : null;
        $fields['ultima_temp_cpu'] = $esPc ? $this->nullableDecimal($row['ultima_temp_cpu'] ?? null) : null;
        $fields['ultima_temp_disco'] = $esPc ? $this->nullableDecimal($row['ultima_temp_disco'] ?? null) : null;
        return $fields;
    }

    private function discoParaTipo(string $tipo, $valor): ?string {
        $disco = $this->nullableStr($valor);
        if (!in_array($tipo, ['Laptop', 'CPU'], true)) {
            return null;
        }
        return $disco ?: 'SSD';
    }

    private function buildFields(
        string $codigo_patrimonial,
        ?string $codigo_identificativo,
        string $tipo_equipo,
        ?string $marca,
        ?string $modelo,
        ?string $color,
        ?string $numero_serie,
        ?int $ram_gb,
        ?int $almacenamiento_gb,
        ?string $tipo_disco,
        ?string $fecha_adquisicion,
        int $area_id,
        ?string $procesador,
        ?string $sistema_operativo
    ): array {
        return compact(
            'codigo_patrimonial', 'codigo_identificativo', 'tipo_equipo', 'marca', 'modelo', 'color',
            'numero_serie', 'ram_gb', 'almacenamiento_gb', 'tipo_disco', 'fecha_adquisicion',
            'area_id', 'procesador', 'sistema_operativo'
        );
    }

    private function insertEquipo(array $f) {
        $this->conn->beginTransaction();
        try {
            $areaData = $this->datosDesdeArea($f['area_id']);
            $ubicacion_fisica = $areaData['ubicacion_fisica'];
            $responsable_nombre = $areaData['responsable_nombre'];

            $query = "INSERT INTO " . $this->table_name . "
                     (codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo, color,
                      numero_serie, ram_gb, almacenamiento_gb, tipo_disco,
                      horas_uso, errores_smart, contador_paginas, salud_bateria,
                      ultima_temp_cpu, ultima_temp_disco,
                      fecha_adquisicion, area_id, ubicacion_fisica, responsable_nombre)
                     VALUES
                     (:codigo_patrimonial, :codigo_identificativo, :tipo_equipo, :marca, :modelo, :color,
                      :numero_serie, :ram_gb, :almacenamiento_gb, :tipo_disco,
                      :horas_uso, :errores_smart, :contador_paginas, :salud_bateria,
                      :ultima_temp_cpu, :ultima_temp_disco,
                      :fecha_adquisicion, :area_id, :ubicacion_fisica, :responsable_nombre)";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':codigo_patrimonial', $f['codigo_patrimonial']);
            $stmt->bindValue(':codigo_identificativo', $f['codigo_identificativo']);
            $stmt->bindValue(':tipo_equipo', $f['tipo_equipo']);
            $stmt->bindValue(':marca', $f['marca']);
            $stmt->bindValue(':modelo', $f['modelo']);
            $stmt->bindValue(':color', $f['color']);
            $stmt->bindValue(':numero_serie', $f['numero_serie']);
            $stmt->bindValue(':ram_gb', $f['ram_gb'], $f['ram_gb'] === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindValue(':almacenamiento_gb', $f['almacenamiento_gb'], $f['almacenamiento_gb'] === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindValue(':tipo_disco', $f['tipo_disco']);
            $stmt->bindValue(':horas_uso', $f['horas_uso'] ?? 0, PDO::PARAM_INT);
            $stmt->bindValue(':errores_smart', $f['errores_smart'] ?? 0, PDO::PARAM_INT);
            $stmt->bindValue(':contador_paginas', $f['contador_paginas'] ?? null, ($f['contador_paginas'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindValue(':salud_bateria', $f['salud_bateria'] ?? null, ($f['salud_bateria'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':ultima_temp_cpu', $f['ultima_temp_cpu'] ?? null, ($f['ultima_temp_cpu'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':ultima_temp_disco', $f['ultima_temp_disco'] ?? null, ($f['ultima_temp_disco'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':fecha_adquisicion', $f['fecha_adquisicion']);
            $stmt->bindValue(':area_id', $f['area_id'], PDO::PARAM_INT);
            $stmt->bindValue(':ubicacion_fisica', $ubicacion_fisica);
            $stmt->bindValue(':responsable_nombre', $responsable_nombre);
            $stmt->execute();

            $equipo_id = (int) $this->conn->lastInsertId();

            if (in_array($f['tipo_equipo'], ['Laptop', 'CPU', 'PC'], true)) {
                $stmt_ficha = $this->conn->prepare(
                    "INSERT INTO v2_fichas_tecnicas (equipo_id, procesador, sistema_operativo)
                     VALUES (:equipo_id, :procesador, :sistema_operativo)"
                );
                $stmt_ficha->bindValue(':equipo_id', $equipo_id, PDO::PARAM_INT);
                $stmt_ficha->bindValue(':procesador', $f['procesador']);
                $stmt_ficha->bindValue(':sistema_operativo', $f['sistema_operativo']);
                $stmt_ficha->execute();
            }

            $this->conn->commit();
            return $equipo_id;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error insertando equipo: ' . $e->getMessage());
            return false;
        }
    }

    private function updateEquipo(int $id, array $f): bool {
        $this->conn->beginTransaction();
        try {
            $areaData = $this->datosDesdeArea($f['area_id']);
            $ubicacion_fisica = $areaData['ubicacion_fisica'];
            $responsable_nombre = $areaData['responsable_nombre'];

            $query = "UPDATE " . $this->table_name . " SET
                codigo_patrimonial = :codigo_patrimonial,
                codigo_identificativo = :codigo_identificativo,
                tipo_equipo = :tipo_equipo,
                marca = :marca,
                modelo = :modelo,
                color = :color,
                numero_serie = :numero_serie,
                ram_gb = :ram_gb,
                almacenamiento_gb = :almacenamiento_gb,
                tipo_disco = :tipo_disco,
                horas_uso = :horas_uso,
                errores_smart = :errores_smart,
                contador_paginas = :contador_paginas,
                salud_bateria = :salud_bateria,
                ultima_temp_cpu = :ultima_temp_cpu,
                ultima_temp_disco = :ultima_temp_disco,
                fecha_adquisicion = :fecha_adquisicion,
                area_id = :area_id,
                ubicacion_fisica = :ubicacion_fisica,
                responsable_nombre = :responsable_nombre
              WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':codigo_patrimonial', $f['codigo_patrimonial']);
            $stmt->bindValue(':codigo_identificativo', $f['codigo_identificativo']);
            $stmt->bindValue(':tipo_equipo', $f['tipo_equipo']);
            $stmt->bindValue(':marca', $f['marca']);
            $stmt->bindValue(':modelo', $f['modelo']);
            $stmt->bindValue(':color', $f['color']);
            $stmt->bindValue(':numero_serie', $f['numero_serie']);
            $stmt->bindValue(':ram_gb', $f['ram_gb'], $f['ram_gb'] === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindValue(':almacenamiento_gb', $f['almacenamiento_gb'], $f['almacenamiento_gb'] === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindValue(':tipo_disco', $f['tipo_disco']);
            $stmt->bindValue(':horas_uso', $f['horas_uso'] ?? 0, PDO::PARAM_INT);
            $stmt->bindValue(':errores_smart', $f['errores_smart'] ?? 0, PDO::PARAM_INT);
            $stmt->bindValue(':contador_paginas', $f['contador_paginas'] ?? null, ($f['contador_paginas'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindValue(':salud_bateria', $f['salud_bateria'] ?? null, ($f['salud_bateria'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':ultima_temp_cpu', $f['ultima_temp_cpu'] ?? null, ($f['ultima_temp_cpu'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':ultima_temp_disco', $f['ultima_temp_disco'] ?? null, ($f['ultima_temp_disco'] ?? null) === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':fecha_adquisicion', $f['fecha_adquisicion']);
            $stmt->bindValue(':area_id', $f['area_id'], PDO::PARAM_INT);
            $stmt->bindValue(':ubicacion_fisica', $ubicacion_fisica);
            $stmt->bindValue(':responsable_nombre', $responsable_nombre);
            $stmt->execute();

            if (in_array($f['tipo_equipo'], ['Laptop', 'CPU', 'PC'], true)) {
                $this->upsertFichaTecnicaBasica($id, $f['procesador'], $f['sistema_operativo']);
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error actualizando equipo: ' . $e->getMessage());
            return false;
        }
    }

    private function upsertFichaTecnicaBasica(int $equipoId, ?string $procesador, ?string $sistemaOperativo): void {
        $check = $this->conn->prepare("SELECT id FROM v2_fichas_tecnicas WHERE equipo_id = :eid LIMIT 1");
        $check->bindValue(':eid', $equipoId, PDO::PARAM_INT);
        $check->execute();

        if ($check->rowCount() > 0) {
            $stmt = $this->conn->prepare(
                "UPDATE v2_fichas_tecnicas SET procesador = :procesador, sistema_operativo = :sistema_operativo
                 WHERE equipo_id = :equipo_id"
            );
        } else {
            $stmt = $this->conn->prepare(
                "INSERT INTO v2_fichas_tecnicas (equipo_id, procesador, sistema_operativo)
                 VALUES (:equipo_id, :procesador, :sistema_operativo)"
            );
        }
        $stmt->bindValue(':equipo_id', $equipoId, PDO::PARAM_INT);
        $stmt->bindValue(':procesador', $procesador);
        $stmt->bindValue(':sistema_operativo', $sistemaOperativo);
        $stmt->execute();
    }

    private function mensajeUnicidad(array $fields, int $excludeId): ?string {
        if ($this->codigoPatrimonialEnUso($fields['codigo_patrimonial'], $excludeId)) {
            return 'El código patrimonial ya está registrado.';
        }
        $ident = trim((string) ($fields['codigo_identificativo'] ?? ''));
        if ($ident !== '' && $this->codigoIdentificativoEnUso($ident, $excludeId)) {
            return 'El código identificativo ya está registrado.';
        }
        return null;
    }

    private function codigoIdentificativoEnUso(string $codigo, int $excludeId): bool {
        $stmt = $this->conn->prepare(
            "SELECT id FROM " . $this->table_name . "
             WHERE codigo_identificativo = :codigo AND id != :id LIMIT 1"
        );
        $stmt->bindValue(':codigo', $codigo);
        $stmt->bindValue(':id', $excludeId, PDO::PARAM_INT);
        $stmt->execute();
        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function codigoPatrimonialEnUso(string $codigo, int $excludeId): bool {
        $stmt = $this->conn->prepare(
            "SELECT id FROM " . $this->table_name . " WHERE codigo_patrimonial = :codigo AND id != :id LIMIT 1"
        );
        $stmt->bindValue(':codigo', $codigo);
        $stmt->bindValue(':id', $excludeId, PDO::PARAM_INT);
        $stmt->execute();
        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function datosDesdeArea($area_id): array {
        $stmt = $this->conn->prepare(
            "SELECT nombre, jefe_encargado, descripcion FROM v2_areas WHERE id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $area_id]);
        $area = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$area) {
            return ['ubicacion_fisica' => null, 'responsable_nombre' => null];
        }

        $ubicacion = $area['nombre'];
        if (!empty($area['descripcion'])) {
            $ubicacion .= ' — ' . $area['descripcion'];
        }

        return [
            'ubicacion_fisica'   => $ubicacion,
            'responsable_nombre' => $area['jefe_encargado'] ?: null,
        ];
    }

    private function resolveAreaId(string $nombre): ?int {
        $stmt = $this->conn->prepare("SELECT id FROM v2_areas WHERE nombre = :nombre LIMIT 1");
        $stmt->execute([':nombre' => trim($nombre)]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int) $row['id'] : null;
    }

    private function normalizeTipo(string $tipo): ?string {
        $map = [
            'cpu'        => 'CPU',
            'laptop'     => 'Laptop',
            'impresora'  => 'Impresora',
            'monitor'    => 'Monitor',
            'otro'       => 'Otro',
            'escaner'    => 'Otro',
            'escáner'    => 'Otro',
            'pc'         => 'CPU',
        ];
        $key = mb_strtolower(trim($tipo));
        if (isset($map[$key])) {
            return $map[$key];
        }
        return in_array($tipo, self::TIPOS_VALIDOS, true) ? $tipo : null;
    }

    private function parseFecha($value): ?string {
        if ($value === null || $value === '') {
            return null;
        }
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }
        $v = trim((string) $value);
        if ($v === '') {
            return null;
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) {
            return $v;
        }
        if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $v, $m)) {
            return sprintf('%04d-%02d-%02d', $m[3], $m[2], $m[1]);
        }
        return null;
    }

    private function str($v): string {
        return trim((string) $v);
    }

    private function nullableStr($v): ?string {
        if ($v === null || $v === '') {
            return null;
        }
        $s = trim((string) $v);
        return $s === '' ? null : $s;
    }

    private function nullableInt($v): ?int {
        if ($v === null || $v === '') {
            return null;
        }
        return (int) $v;
    }

    private function nullableDecimal($v): ?float {
        if ($v === null || $v === '') {
            return null;
        }
        return round((float) $v, 2);
    }

    public function syncTelemetria(int $equipoId, array $data): bool {
        $sets = [];
        $params = [':id' => $equipoId];

        $map = [
            'horas_uso' => 'horas_uso',
            'errores_smart' => 'errores_smart',
            'contador_paginas' => 'contador_paginas',
            'salud_bateria' => 'salud_bateria',
            'ultima_temp_cpu' => 'ultima_temp_cpu',
            'ultima_temp_disco' => 'ultima_temp_disco',
            'fecha_ultimo_mantenimiento' => 'fecha_ultimo_mantenimiento',
            'estado_operativo' => 'estado_operativo',
        ];

        foreach ($map as $col => $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null && $data[$key] !== '') {
                $sets[] = "{$col} = :{$col}";
                $params[":{$col}"] = $data[$key];
            }
        }

        if (!$sets) {
            return true;
        }

        $sql = 'UPDATE ' . $this->table_name . ' SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($params);
    }
}
?>
