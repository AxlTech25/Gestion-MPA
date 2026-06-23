<?php
class Mantenimiento {
    private $conn;
    private $table_name = "v2_fichas_mantenimiento";

    public function __construct($db) {
        $this->conn = $db;
    }

    private const SELECT_BASE = "
        SELECT m.*, e.codigo_patrimonial, e.codigo_identificativo, e.tipo_equipo, e.marca, e.modelo,
               e.numero_serie, a.nombre AS area_nombre,
               c.nombre AS categoria_falla, u.nombre_completo AS tecnico
        FROM v2_fichas_mantenimiento m
        LEFT JOIN v2_equipos e ON m.equipo_id = e.id
        LEFT JOIN v2_areas a ON e.area_id = a.id
        LEFT JOIN v2_categorias_falla c ON m.categoria_falla_id = c.id
        LEFT JOIN v2_usuarios u ON m.tecnico_id = u.id
    ";

    public function getAll() {
        $query = self::SELECT_BASE . " ORDER BY m.fecha_intervencion DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById(int $id): ?array {
        $query = self::SELECT_BASE . " WHERE m.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getEquipoByCodigo(string $codigo): ?array {
        $query = "SELECT e.id, e.codigo_patrimonial, e.codigo_identificativo, e.tipo_equipo,
                         e.marca, e.modelo, e.numero_serie, e.estado_operativo, e.estado_conservacion,
                         e.fecha_ultimo_mantenimiento, a.nombre AS area_nombre
                  FROM v2_equipos e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
                  WHERE e.codigo_patrimonial = :codigo LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':codigo', trim($codigo));
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getByEquipoId(int $equipo_id) {
        $query = self::SELECT_BASE . " WHERE m.equipo_id = :equipo_id ORDER BY m.fecha_intervencion DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':equipo_id', $equipo_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                 (nro_orden, equipo_id, fecha_intervencion, tecnico_id, tipo_mantenimiento,
                  categoria_falla_id, sintoma_usuario, causa_raiz, componente_principal,
                  nivel_polvo, temperatura_cpu, temperatura_disco,
                  horas_uso_acumuladas, salud_bateria_pct, contador_paginas_lectura,
                  diagnostico_texto, actividades_realizadas, piezas_reemplazadas,
                  costo_reparacion, tiempo_inactividad_min, estado_post_mantenimiento)
                 VALUES
                 (:nro_orden, :equipo_id, :fecha_intervencion, :tecnico_id, :tipo_mantenimiento,
                  :categoria_falla_id, :sintoma_usuario, :causa_raiz, :componente_principal,
                  :nivel_polvo, :temperatura_cpu, :temperatura_disco,
                  :horas_uso_acumuladas, :salud_bateria_pct, :contador_paginas_lectura,
                  :diagnostico_texto, :actividades_realizadas, :piezas_reemplazadas,
                  :costo_reparacion, :tiempo_inactividad_min, :estado_post_mantenimiento)";

        $stmt = $this->conn->prepare($query);

        $nro_orden = $data->nro_orden ?? null;
        $equipo_id = (int) $data->equipo_id;
        $fecha_intervencion = $data->fecha_intervencion;
        $tecnico_id = $data->tecnico_id ?? null;
        $tipo_mantenimiento = $data->tipo_mantenimiento;
        $categoria_falla_id = $data->categoria_falla_id ?? null;
        $sintoma_usuario = $this->nullStr($data->sintoma_usuario ?? null);
        $causa_raiz = $this->nullStr($data->causa_raiz ?? null);
        $componente_principal = $this->nullStr($data->componente_principal ?? null);
        $nivel_polvo = $this->nullStr($data->nivel_polvo ?? null);
        $temperatura_cpu = $this->nullDecimal($data->temperatura_cpu ?? null);
        $temperatura_disco = $this->nullDecimal($data->temperatura_disco ?? null);
        $horas_uso_acumuladas = $this->nullInt($data->horas_uso_acumuladas ?? null);
        $salud_bateria_pct = $this->nullDecimal($data->salud_bateria_pct ?? null);
        $contador_paginas_lectura = $this->nullInt($data->contador_paginas_lectura ?? null);
        $diagnostico_texto = $this->nullStr($data->diagnostico_texto ?? null);
        $actividades_realizadas = $this->nullStr($data->actividades_realizadas ?? null);
        $piezas_reemplazadas = $this->nullStr($data->piezas_reemplazadas ?? null);
        $costo_reparacion = $data->costo_reparacion ?? 0;
        $tiempo_inactividad_min = (int) ($data->tiempo_inactividad_min ?? 0);
        $estado_post_mantenimiento = $data->estado_post_mantenimiento ?? 'Operativo';

        $stmt->bindValue(':nro_orden', $nro_orden);
        $stmt->bindValue(':equipo_id', $equipo_id, PDO::PARAM_INT);
        $stmt->bindValue(':fecha_intervencion', $fecha_intervencion);
        $stmt->bindValue(':tecnico_id', $tecnico_id, $tecnico_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':tipo_mantenimiento', $tipo_mantenimiento);
        $stmt->bindValue(':categoria_falla_id', $categoria_falla_id, $categoria_falla_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':sintoma_usuario', $sintoma_usuario);
        $stmt->bindValue(':causa_raiz', $causa_raiz);
        $stmt->bindValue(':componente_principal', $componente_principal);
        $stmt->bindValue(':nivel_polvo', $nivel_polvo);
        $stmt->bindValue(':temperatura_cpu', $temperatura_cpu);
        $stmt->bindValue(':temperatura_disco', $temperatura_disco);
        $stmt->bindValue(':horas_uso_acumuladas', $horas_uso_acumuladas, $horas_uso_acumuladas === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':salud_bateria_pct', $salud_bateria_pct);
        $stmt->bindValue(':contador_paginas_lectura', $contador_paginas_lectura, $contador_paginas_lectura === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':diagnostico_texto', $diagnostico_texto);
        $stmt->bindValue(':actividades_realizadas', $actividades_realizadas);
        $stmt->bindValue(':piezas_reemplazadas', $piezas_reemplazadas);
        $stmt->bindValue(':costo_reparacion', $costo_reparacion);
        $stmt->bindValue(':tiempo_inactividad_min', $tiempo_inactividad_min, PDO::PARAM_INT);
        $stmt->bindValue(':estado_post_mantenimiento', $estado_post_mantenimiento);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error creando mantenimiento: ' . $e->getMessage());
            return false;
        }
    }

    public function buildEquipoSyncPayload($data): array {
        $payload = [
            'fecha_ultimo_mantenimiento' => substr((string) $data->fecha_intervencion, 0, 10),
        ];

        if (isset($data->horas_uso_acumuladas) && $data->horas_uso_acumuladas !== '') {
            $payload['horas_uso'] = (int) $data->horas_uso_acumuladas;
        }
        if (isset($data->salud_bateria_pct) && $data->salud_bateria_pct !== '') {
            $payload['salud_bateria'] = round((float) $data->salud_bateria_pct, 2);
        }
        if (isset($data->contador_paginas_lectura) && $data->contador_paginas_lectura !== '') {
            $payload['contador_paginas'] = (int) $data->contador_paginas_lectura;
        }
        if (isset($data->temperatura_cpu) && $data->temperatura_cpu !== '') {
            $payload['ultima_temp_cpu'] = round((float) $data->temperatura_cpu, 2);
        }
        if (isset($data->temperatura_disco) && $data->temperatura_disco !== '') {
            $payload['ultima_temp_disco'] = round((float) $data->temperatura_disco, 2);
        }

        $estado = $data->estado_post_mantenimiento ?? 'Operativo';
        if ($estado === 'Dañado') {
            $payload['estado_operativo'] = 'En Reparacion';
        } elseif ($estado === 'Operativo') {
            $payload['estado_operativo'] = 'Operativo';
        } elseif ($estado === 'Baja') {
            $payload['estado_operativo'] = 'Baja';
        }

        return $payload;
    }

    private function nullStr($v): ?string {
        if ($v === null || $v === '') {
            return null;
        }
        $s = trim((string) $v);
        return $s === '' ? null : $s;
    }

    private function nullInt($v): ?int {
        if ($v === null || $v === '') {
            return null;
        }
        return (int) $v;
    }

    private function nullDecimal($v): ?string {
        if ($v === null || $v === '') {
            return null;
        }
        return (string) round((float) $v, 2);
    }
}
?>
