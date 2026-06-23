<?php
class Equipo {
    private $conn;
    private $table_name = "v2_equipos";

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

    public function create($data) {
        $fields = $this->fieldsFromObject($data);
        if (isset($fields['error'])) {
            return false;
        }
        return $this->insertEquipo($fields) !== false;
    }

    public function importRow(array $row): array {
        $fields = $this->fieldsFromArray($row);
        if (isset($fields['error'])) {
            return ['ok' => false, 'error' => $fields['error']];
        }
        $id = $this->insertEquipo($fields);
        if ($id === false) {
            return ['ok' => false, 'error' => 'No se pudo registrar (código patrimonial duplicado u otro error).'];
        }
        return ['ok' => true, 'id' => $id];
    }

    private function fieldsFromObject($data): array {
        if (empty($data->codigo_patrimonial) || empty($data->tipo_equipo) || empty($data->area_id)) {
            return ['error' => 'Faltan datos obligatorios.'];
        }
        $fields = $this->buildFields(
            (string) $data->codigo_patrimonial,
            $data->codigo_identificativo ?? null,
            (string) $data->tipo_equipo,
            $data->marca ?? null,
            $data->modelo ?? null,
            $data->numero_serie ?? null,
            $data->ram_gb ?? null,
            $data->almacenamiento_gb ?? null,
            $data->tipo_disco ?? null,
            $data->fecha_adquisicion ?? null,
            (int) $data->area_id,
            $data->procesador ?? null,
            $data->sistema_operativo ?? null
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

        return $this->buildFields(
            $patrimonial,
            $ident !== '' ? $ident : null,
            $tipoNorm,
            $this->nullableStr($row['marca'] ?? null),
            $this->nullableStr($row['modelo'] ?? null),
            $this->nullableStr($row['numero_serie'] ?? null),
            $this->nullableInt($row['ram_gb'] ?? null),
            $this->nullableInt($row['almacenamiento_gb'] ?? null),
            $this->nullableStr($row['tipo_disco'] ?? null) ?: 'SSD',
            $this->parseFecha($row['fecha_adquisicion'] ?? null),
            $areaId,
            $this->nullableStr($row['procesador'] ?? null),
            $this->nullableStr($row['sistema_operativo'] ?? null)
        );
    }

    private function buildFields(
        string $codigo_patrimonial,
        ?string $codigo_identificativo,
        string $tipo_equipo,
        ?string $marca,
        ?string $modelo,
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
            'codigo_patrimonial', 'codigo_identificativo', 'tipo_equipo', 'marca', 'modelo',
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
                     (codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo,
                      numero_serie, ram_gb, almacenamiento_gb, tipo_disco,
                      horas_uso, errores_smart, contador_paginas, salud_bateria,
                      ultima_temp_cpu, ultima_temp_disco,
                      fecha_adquisicion, area_id, ubicacion_fisica, responsable_nombre)
                     VALUES
                     (:codigo_patrimonial, :codigo_identificativo, :tipo_equipo, :marca, :modelo,
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
