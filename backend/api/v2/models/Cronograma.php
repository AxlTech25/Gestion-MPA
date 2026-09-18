<?php
class Cronograma {
    public const CANTIDAD_MAX = 30;

    public const TURNOS = [
        'Manana' => [
            'codigo' => 'X1',
            'label' => 'Mañana',
            'hora_inicio' => '10:00:00',
            'hora_fin' => '13:00:00',
            'horario' => '10:00 a. m. — 01:00 p. m.',
        ],
        'Tarde' => [
            'codigo' => 'X2',
            'label' => 'Tarde',
            'hora_inicio' => '14:00:00',
            'hora_fin' => '17:00:00',
            'horario' => '02:00 p. m. — 05:00 p. m.',
        ],
    ];

    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public static function horasDeTurno(string $turno): array {
        return self::TURNOS[$turno] ?? self::TURNOS['Manana'];
    }

    public static function fechaPerteneceAlAnio(string $fechaIso, int $anio): bool {
        $dt = DateTime::createFromFormat('Y-m-d', $fechaIso);
        if (!$dt || $dt->format('Y-m-d') !== $fechaIso) {
            return false;
        }
        return (int) $dt->format('Y') === $anio;
    }

    public static function turnoValido(?string $turno): bool {
        return isset(self::TURNOS[$turno]);
    }

    public static function normalizarHora(string $hora): ?string {
        $hora = trim($hora);
        $dt = DateTime::createFromFormat('H:i:s', $hora);
        if ($dt && $dt->format('H:i:s') === $hora) {
            return $hora;
        }
        $dt = DateTime::createFromFormat('H:i', $hora);
        if ($dt && $dt->format('H:i') === $hora) {
            return $dt->format('H:i:s');
        }
        return null;
    }

    public static function rangoHorasValido(?string $inicio, ?string $fin): bool {
        $a = self::normalizarHora((string) $inicio);
        $b = self::normalizarHora((string) $fin);
        if ($a === null || $b === null) {
            return false;
        }
        return $a < $b;
    }

    public static function codigoCantidad(int $cantidad): string {
        return $cantidad > 0 ? 'X' . $cantidad : '';
    }

    public static function marcaEnFecha(int $cantidad): string {
        return self::codigoCantidad($cantidad);
    }

    public static function cantidadValida(int $cantidad): bool {
        return $cantidad >= 1 && $cantidad <= self::CANTIDAD_MAX;
    }

    public static function hayGerenciasAsignadas(array $filas): bool {
        foreach ($filas as $fila) {
            if (!empty($fila['gerencia_id'])) {
                return true;
            }
        }
        return false;
    }

    public static function claveGerencia(array $fila): string {
        $id = $fila['gerencia_id'] ?? null;
        if ($id === null || $id === '' || (int) $id === 0) {
            return 'ninguna';
        }
        return (string) (int) $id;
    }

    public static function etiquetaGerencia(array $fila): string {
        $nombre = trim((string) ($fila['gerencia'] ?? ''));
        if ($nombre === '') {
            return 'OTRAS ÁREAS';
        }
        if (function_exists('mb_strtoupper')) {
            return mb_strtoupper($nombre, 'UTF-8');
        }
        return strtoupper($nombre);
    }

    public static function debeMostrarBandaGerencia(array $filas, int $index): bool {
        if ($index < 0 || $index >= count($filas) || !self::hayGerenciasAsignadas($filas)) {
            return false;
        }
        if ($index === 0) {
            return true;
        }
        return self::claveGerencia($filas[$index]) !== self::claveGerencia($filas[$index - 1]);
    }

    public static function esFinDeSemana(string $fechaIso): bool {
        $dt = DateTime::createFromFormat('Y-m-d', $fechaIso);
        if (!$dt || $dt->format('Y-m-d') !== $fechaIso) {
            return false;
        }
        $n = (int) $dt->format('w');
        return $n === 0 || $n === 6;
    }

    public static function fechasLaborablesDeMeses(int $anio, array $meses): array {
        $fechas = [];
        foreach ($meses as $mes) {
            $mes = (int) $mes;
            if ($mes < 1 || $mes > 12) {
                continue;
            }
            $ultimo = (int) (new DateTime(sprintf('%04d-%02d-01', $anio, $mes)))->format('t');
            for ($d = 1; $d <= $ultimo; $d++) {
                $fecha = sprintf('%04d-%02d-%02d', $anio, $mes, $d);
                if (!self::esFinDeSemana($fecha)) {
                    $fechas[] = $fecha;
                }
            }
        }
        return $fechas;
    }

    public static function cantidadLaborablesDelMes(int $anio, int $mes): int {
        return count(self::fechasLaborablesDeMeses($anio, [$mes]));
    }

    /** Pares Ene–Feb … Nov–Dic del año del documento. Si hay marcas, solo los pares que cubren el rango. */
    public static function paresDeMesesParaPdf(array $filas, int $anio): array {
        $pares = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12]];
        $usados = [];
        foreach ($filas as $fila) {
            foreach ($fila['celdas'] ?? [] as $celda) {
                $fecha = (string) ($celda['fecha'] ?? '');
                if (strlen($fecha) < 7 || (int) substr($fecha, 0, 4) !== $anio) {
                    continue;
                }
                $usados[(int) substr($fecha, 5, 2)] = true;
            }
        }
        if ($usados === []) {
            return $pares;
        }
        $min = min(array_keys($usados));
        $max = max(array_keys($usados));
        $out = [];
        foreach ($pares as $par) {
            if ($par[1] < $min || $par[0] > $max) {
                continue;
            }
            $out[] = $par;
        }
        return $out !== [] ? $out : $pares;
    }

    public static function mesesDelRango(array $filas, int $anio): array {
        $meses = [];
        foreach ($filas as $fila) {
            foreach ($fila['celdas'] ?? [] as $celda) {
                $fecha = (string) ($celda['fecha'] ?? '');
                if (strlen($fecha) < 7 || (int) substr($fecha, 0, 4) !== $anio) {
                    continue;
                }
                $meses[(int) substr($fecha, 5, 2)] = true;
            }
        }
        if ($meses === []) {
            return range(1, 12);
        }
        return range(min(array_keys($meses)), max(array_keys($meses)));
    }

    public function listar(?int $anio = null): array {
        $sql = "SELECT c.id, c.anio, c.nombre, c.notas, c.creado_en, c.creado_por,
                       u.nombre_completo AS creado_por_nombre,
                       (SELECT COUNT(*) FROM v2_cronograma_celdas x WHERE x.cronograma_id = c.id) AS celdas
                FROM v2_cronogramas c
                LEFT JOIN v2_usuarios u ON c.creado_por = u.id";
        if ($anio !== null) {
            $sql .= " WHERE c.anio = :anio";
        }
        $sql .= " ORDER BY c.anio DESC, c.creado_en DESC";
        $stmt = $this->conn->prepare($sql);
        if ($anio !== null) {
            $stmt->bindValue(':anio', $anio, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        $stmt = $this->conn->prepare(
            "SELECT c.id, c.anio, c.nombre, c.notas, c.creado_en, c.creado_por,
                    u.nombre_completo AS creado_por_nombre
             FROM v2_cronogramas c
             LEFT JOIN v2_usuarios u ON c.creado_por = u.id
             WHERE c.id = :id LIMIT 1"
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function crear(object $data, ?int $creadoPor): mixed {
        $anio = (int) ($data->anio ?? 0);
        $nombre = trim((string) ($data->nombre ?? ''));
        if ($anio < 2000 || $anio > 2100) {
            return ['error' => 'El año debe estar entre 2000 y 2100.', 'status' => 400];
        }
        if ($nombre === '') {
            return ['error' => 'El nombre del cronograma es obligatorio.', 'status' => 400];
        }
        $notas = isset($data->notas) ? (string) $data->notas : null;
        $stmt = $this->conn->prepare(
            "INSERT INTO v2_cronogramas (anio, nombre, notas, creado_por)
             VALUES (:anio, :nombre, :notas, :creado_por)"
        );
        $stmt->bindValue(':anio', $anio, PDO::PARAM_INT);
        $stmt->bindValue(':nombre', $nombre);
        $stmt->bindValue(':notas', $notas);
        $stmt->bindValue(':creado_por', $creadoPor, $creadoPor === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        if (!$stmt->execute()) {
            return false;
        }
        $id = (int) $this->conn->lastInsertId();
        $this->sembrarPersonal($id);
        return $id;
    }

    public function eliminar(int $id): mixed {
        $doc = $this->getById($id);
        if (!$doc) {
            return ['error' => 'Cronograma no encontrado.', 'status' => 404];
        }
        $stmt = $this->conn->prepare('DELETE FROM v2_cronogramas WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function getMatriz(int $id): ?array {
        $doc = $this->getById($id);
        if (!$doc) {
            return null;
        }
        $areas = $this->areasConConteos();
        $celdas = $this->celdasDeCronograma($id);
        $equiposPorArea = $this->equiposPorArea();
        $porArea = [];
        foreach ($celdas as $celda) {
            $porArea[(int) $celda['area_id']][] = $celda;
        }

        $filas = [];
        foreach ($areas as $area) {
            $aid = (int) $area['id'];
            $pc = (int) $area['pc'];
            $laptop = (int) $area['laptop'];
            $impresora = (int) $area['impresora'];
            $celdasFila = $porArea[$aid] ?? [];
            $computadoras = $pc + $laptop;
            $programados = 0;
            foreach ($celdasFila as $celda) {
                $programados += (int) ($celda['cantidad'] ?? 0);
            }
            $filas[] = [
                'area_id' => $aid,
                'area' => $area['nombre'],
                'jefe_encargado' => $area['jefe_encargado'],
                'gerencia_id' => isset($area['gerencia_id']) ? ($area['gerencia_id'] !== null ? (int) $area['gerencia_id'] : null) : null,
                'gerencia' => $area['gerencia'] ?? null,
                'gerencia_orden' => isset($area['gerencia_orden']) ? (int) $area['gerencia_orden'] : null,
                'pc' => $pc,
                'laptop' => $laptop,
                'impresora' => $impresora,
                'computadoras' => $computadoras,
                'programados' => $programados,
                'pendientes' => max(0, $computadoras - $programados),
                'subtotal' => $pc + $laptop + $impresora,
                'total' => $pc + $laptop + $impresora,
                'equipos' => $equiposPorArea[$aid] ?? [],
                'celdas' => $celdasFila,
            ];
        }

        $totales = $this->totalesDeFilas($filas);
        $personal = $this->personalDeCronograma($id);
        if ($personal === []) {
            $this->sembrarPersonal($id);
            $personal = $this->personalDeCronograma($id);
        }

        return [
            'cronograma' => $doc,
            'filas' => $filas,
            'totales' => $totales,
            'personal' => $personal,
            'cobertura' => $this->coberturaDeFilas($filas),
        ];
    }

    public function cobertura(int $id): ?array {
        $matriz = $this->getMatriz($id);
        if (!$matriz) {
            return null;
        }
        return $matriz['cobertura'];
    }

    public function crearCelda(int $cronogramaId, object $data, ?int $creadoPor): mixed {
        $doc = $this->getById($cronogramaId);
        if (!$doc) {
            return ['error' => 'Cronograma no encontrado.', 'status' => 404];
        }
        $areaId = (int) ($data->area_id ?? 0);
        $fecha = (string) ($data->fecha ?? '');
        $cantidad = (int) ($data->cantidad ?? 0);
        if ($areaId <= 0 || $fecha === '') {
            return ['error' => 'Faltan área o fecha.', 'status' => 400];
        }
        if (!self::fechaPerteneceAlAnio($fecha, (int) $doc['anio'])) {
            return ['error' => 'La fecha debe pertenecer al año del cronograma.', 'status' => 400];
        }
        if ($cantidad < 1) {
            $this->eliminarCeldaPorFecha($cronogramaId, $areaId, $fecha);
            return ['liberada' => true];
        }
        if (self::esFinDeSemana($fecha)) {
            return ['error' => 'Solo se programan días laborables (lunes a viernes).', 'status' => 400];
        }
        if (!$this->areaExiste($areaId)) {
            return ['error' => 'El área no existe.', 'status' => 404];
        }

        $computadoras = $this->computadorasDeArea($areaId);
        if ($computadoras <= 0) {
            return ['error' => 'El área no tiene PCs ni laptops en inventario.', 'status' => 400];
        }
        if (!self::cantidadValida($cantidad) || $cantidad > $computadoras) {
            return [
                'error' => "En esta área hay {$computadoras} PC/laptop. Use X1 a X{$computadoras}.",
                'status' => 400,
            ];
        }

        $existente = $this->celdaPorFecha($cronogramaId, $areaId, $fecha);
        if ($existente) {
            $upd = $this->conn->prepare(
                'UPDATE v2_cronograma_celdas SET cantidad = :cantidad WHERE id = :id AND cronograma_id = :cronograma_id'
            );
            $upd->bindValue(':cantidad', $cantidad, PDO::PARAM_INT);
            $upd->bindValue(':id', (int) $existente['id'], PDO::PARAM_INT);
            $upd->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
            if (!$upd->execute()) {
                return false;
            }
            return (int) $existente['id'];
        }

        $meta = self::horasDeTurno('Manana');
        $stmt = $this->conn->prepare(
            "INSERT INTO v2_cronograma_celdas
                (cronograma_id, area_id, fecha, turno, cantidad, hora_inicio, hora_fin, creado_por)
             VALUES
                (:cronograma_id, :area_id, :fecha, 'Manana', :cantidad, :hora_inicio, :hora_fin, :creado_por)"
        );
        $stmt->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
        $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
        $stmt->bindValue(':fecha', $fecha);
        $stmt->bindValue(':cantidad', $cantidad, PDO::PARAM_INT);
        $stmt->bindValue(':hora_inicio', $meta['hora_inicio']);
        $stmt->bindValue(':hora_fin', $meta['hora_fin']);
        $stmt->bindValue(':creado_por', $creadoPor, $creadoPor === null ? PDO::PARAM_NULL : PDO::PARAM_INT);

        try {
            if (!$stmt->execute()) {
                return false;
            }
        } catch (PDOException $e) {
            if ((int) $e->getCode() === 23000) {
                return ['error' => 'Ese día ya está ocupado para el área.', 'status' => 409];
            }
            error_log('Error creando celda: ' . $e->getMessage());
            return false;
        }

        return (int) $this->conn->lastInsertId();
    }

    public function guardarHorarios(int $cronogramaId, int $celdaId, $items): mixed {
        $celda = $this->celdaDeCronograma($cronogramaId, $celdaId);
        if (!$celda) {
            return ['error' => 'Celda no encontrada.', 'status' => 404];
        }
        if (!is_array($items)) {
            return ['error' => 'Debe enviar la lista de horarios.', 'status' => 400];
        }
        $areaId = (int) $celda['area_id'];
        $permitidos = [];
        foreach ($this->equiposDeArea($areaId) as $eq) {
            $permitidos[(int) $eq['id']] = true;
        }

        $this->conn->beginTransaction();
        try {
            $del = $this->conn->prepare('DELETE FROM v2_cronograma_horarios WHERE celda_id = :celda_id');
            $del->bindValue(':celda_id', $celdaId, PDO::PARAM_INT);
            $del->execute();

            $ins = $this->conn->prepare(
                "INSERT INTO v2_cronograma_horarios (celda_id, equipo_id, hora_inicio, hora_fin)
                 VALUES (:celda_id, :equipo_id, :hora_inicio, :hora_fin)"
            );
            foreach ($items as $item) {
                $row = is_object($item) ? $item : (object) $item;
                $equipoId = (int) ($row->equipo_id ?? 0);
                if ($equipoId <= 0 || !isset($permitidos[$equipoId])) {
                    $this->conn->rollBack();
                    return ['error' => 'Hay un equipo que no pertenece al área de la visita.', 'status' => 400];
                }
                if (!self::rangoHorasValido($row->hora_inicio ?? '', $row->hora_fin ?? '')) {
                    $this->conn->rollBack();
                    return ['error' => 'Cada equipo necesita hora de inicio anterior a la de fin.', 'status' => 400];
                }
                $ins->bindValue(':celda_id', $celdaId, PDO::PARAM_INT);
                $ins->bindValue(':equipo_id', $equipoId, PDO::PARAM_INT);
                $ins->bindValue(':hora_inicio', self::normalizarHora((string) $row->hora_inicio));
                $ins->bindValue(':hora_fin', self::normalizarHora((string) $row->hora_fin));
                $ins->execute();
            }
            $this->conn->commit();
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error guardando horarios: ' . $e->getMessage());
            return false;
        }

        return $this->horariosDeCelda($celdaId);
    }

    public function guardarPersonal(int $cronogramaId, $items): mixed {
        if (!$this->getById($cronogramaId)) {
            return ['error' => 'Cronograma no encontrado.', 'status' => 404];
        }
        if (!is_array($items) || $items === []) {
            return ['error' => 'Indique al menos una persona del equipo de trabajo.', 'status' => 400];
        }

        $this->conn->beginTransaction();
        try {
            $del = $this->conn->prepare('DELETE FROM v2_cronograma_personal WHERE cronograma_id = :id');
            $del->bindValue(':id', $cronogramaId, PDO::PARAM_INT);
            $del->execute();

            $ins = $this->conn->prepare(
                "INSERT INTO v2_cronograma_personal (cronograma_id, nro, nombre, hora_inicio, hora_fin)
                 VALUES (:cronograma_id, :nro, :nombre, :hora_inicio, :hora_fin)"
            );
            $nro = 1;
            foreach ($items as $item) {
                $row = is_object($item) ? $item : (object) $item;
                $nombre = trim((string) ($row->nombre ?? ''));
                if ($nombre === '') {
                    $this->conn->rollBack();
                    return ['error' => 'Cada fila necesita el nombre de la persona (o etiqueta, p. ej. PC 01).', 'status' => 400];
                }
                if (!self::rangoHorasValido($row->hora_inicio ?? '', $row->hora_fin ?? '')) {
                    $this->conn->rollBack();
                    return ['error' => 'Cada persona necesita hora de inicio anterior a la de fin.', 'status' => 400];
                }
                $ins->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
                $ins->bindValue(':nro', $nro, PDO::PARAM_INT);
                $ins->bindValue(':nombre', $nombre);
                $ins->bindValue(':hora_inicio', self::normalizarHora((string) $row->hora_inicio));
                $ins->bindValue(':hora_fin', self::normalizarHora((string) $row->hora_fin));
                $ins->execute();
                $nro++;
            }
            $this->conn->commit();
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error guardando personal: ' . $e->getMessage());
            return false;
        }

        return $this->personalDeCronograma($cronogramaId);
    }

    public function eliminarCelda(int $cronogramaId, int $celdaId): mixed {
        if (!$this->getById($cronogramaId)) {
            return ['error' => 'Cronograma no encontrado.', 'status' => 404];
        }
        $stmt = $this->conn->prepare(
            "DELETE FROM v2_cronograma_celdas WHERE id = :id AND cronograma_id = :cronograma_id"
        );
        $stmt->bindValue(':id', $celdaId, PDO::PARAM_INT);
        $stmt->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
        $stmt->execute();
        if ($stmt->rowCount() === 0) {
            return ['error' => 'Celda no encontrada.', 'status' => 404];
        }
        return true;
    }

    private function personalDeCronograma(int $id): array {
        $stmt = $this->conn->prepare(
            "SELECT id, nro, nombre, hora_inicio, hora_fin
             FROM v2_cronograma_personal
             WHERE cronograma_id = :id
             ORDER BY nro ASC, id ASC"
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function sembrarPersonal(int $cronogramaId): void {
        $existe = $this->conn->prepare(
            'SELECT COUNT(*) FROM v2_cronograma_personal WHERE cronograma_id = :id'
        );
        $existe->bindValue(':id', $cronogramaId, PDO::PARAM_INT);
        $existe->execute();
        if ((int) $existe->fetchColumn() > 0) {
            return;
        }
        $ins = $this->conn->prepare(
            "INSERT INTO v2_cronograma_personal (cronograma_id, nro, nombre, hora_inicio, hora_fin)
             VALUES (:cronograma_id, :nro, :nombre, :hora_inicio, :hora_fin)"
        );
        $semilla = [
            [1, 'PC 01', '10:00:00', '13:00:00'],
            [2, 'PC 02', '14:00:00', '17:00:00'],
        ];
        foreach ($semilla as $fila) {
            $ins->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
            $ins->bindValue(':nro', $fila[0], PDO::PARAM_INT);
            $ins->bindValue(':nombre', $fila[1]);
            $ins->bindValue(':hora_inicio', $fila[2]);
            $ins->bindValue(':hora_fin', $fila[3]);
            $ins->execute();
        }
    }

    private function areaExiste(int $areaId): bool {
        $stmt = $this->conn->prepare('SELECT id FROM v2_areas WHERE id = :id LIMIT 1');
        $stmt->bindValue(':id', $areaId, PDO::PARAM_INT);
        $stmt->execute();
        return (bool) $stmt->fetchColumn();
    }

    private function areasConConteos(): array {
        $query = "SELECT a.id, a.nombre, a.jefe_encargado, a.gerencia_id,
                         g.nombre AS gerencia, g.orden AS gerencia_orden,
                         SUM(CASE WHEN e.tipo_equipo = 'CPU' AND e.estado_operativo <> 'Baja' THEN 1 ELSE 0 END) AS pc,
                         SUM(CASE WHEN e.tipo_equipo = 'Laptop' AND e.estado_operativo <> 'Baja' THEN 1 ELSE 0 END) AS laptop,
                         SUM(CASE WHEN e.tipo_equipo = 'Impresora' AND e.estado_operativo <> 'Baja' THEN 1 ELSE 0 END) AS impresora
                  FROM v2_areas a
                  LEFT JOIN v2_gerencias g ON g.id = a.gerencia_id
                  LEFT JOIN v2_equipos e ON e.area_id = a.id
                    AND e.tipo_equipo IN ('CPU', 'Laptop', 'Impresora')
                  GROUP BY a.id, a.nombre, a.jefe_encargado, a.gerencia_id, g.nombre, g.orden
                  ORDER BY CASE WHEN a.gerencia_id IS NULL THEN 1 ELSE 0 END,
                           g.orden ASC, g.nombre ASC, a.nombre ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function celdasDeCronograma(int $id): array {
        $stmt = $this->conn->prepare(
            "SELECT id, area_id, fecha, turno, cantidad, hora_inicio, hora_fin
             FROM v2_cronograma_celdas
             WHERE cronograma_id = :id
             ORDER BY fecha ASC"
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $horarios = $this->horariosDeCronograma($id);
        foreach ($rows as &$row) {
            $cantidad = (int) ($row['cantidad'] ?? 1);
            $row['cantidad'] = $cantidad;
            $row['codigo'] = self::codigoCantidad($cantidad);
            $row['horarios'] = $horarios[(int) $row['id']] ?? [];
        }
        return $rows;
    }

    private function celdaPorFecha(int $cronogramaId, int $areaId, string $fecha): ?array {
        $stmt = $this->conn->prepare(
            "SELECT id, cronograma_id, area_id, fecha, cantidad
             FROM v2_cronograma_celdas
             WHERE cronograma_id = :cronograma_id AND area_id = :area_id AND fecha = :fecha
             LIMIT 1"
        );
        $stmt->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
        $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
        $stmt->bindValue(':fecha', $fecha);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    private function eliminarCeldaPorFecha(int $cronogramaId, int $areaId, string $fecha): void {
        $stmt = $this->conn->prepare(
            "DELETE FROM v2_cronograma_celdas
             WHERE cronograma_id = :cronograma_id AND area_id = :area_id AND fecha = :fecha"
        );
        $stmt->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
        $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
        $stmt->bindValue(':fecha', $fecha);
        $stmt->execute();
    }

    private function computadorasDeArea(int $areaId): int {
        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM v2_equipos
             WHERE area_id = :area_id
               AND tipo_equipo IN ('CPU', 'Laptop')
               AND estado_operativo <> 'Baja'"
        );
        $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
    }

    private function celdaDeCronograma(int $cronogramaId, int $celdaId): ?array {
        $stmt = $this->conn->prepare(
            "SELECT id, cronograma_id, area_id, fecha, turno, hora_inicio, hora_fin
             FROM v2_cronograma_celdas
             WHERE id = :id AND cronograma_id = :cronograma_id LIMIT 1"
        );
        $stmt->bindValue(':id', $celdaId, PDO::PARAM_INT);
        $stmt->bindValue(':cronograma_id', $cronogramaId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    private function sembrarHorarios(int $celdaId, int $areaId, string $turno): void {
        $meta = self::horasDeTurno($turno);
        $equipos = $this->equiposDeArea($areaId);
        if (!$equipos) {
            return;
        }
        $stmt = $this->conn->prepare(
            "INSERT IGNORE INTO v2_cronograma_horarios (celda_id, equipo_id, hora_inicio, hora_fin)
             VALUES (:celda_id, :equipo_id, :hora_inicio, :hora_fin)"
        );
        foreach ($equipos as $eq) {
            $stmt->bindValue(':celda_id', $celdaId, PDO::PARAM_INT);
            $stmt->bindValue(':equipo_id', (int) $eq['id'], PDO::PARAM_INT);
            $stmt->bindValue(':hora_inicio', $meta['hora_inicio']);
            $stmt->bindValue(':hora_fin', $meta['hora_fin']);
            $stmt->execute();
        }
    }

    private function equiposDeArea(int $areaId): array {
        $stmt = $this->conn->prepare(
            "SELECT id, codigo_patrimonial, tipo_equipo, marca, modelo
             FROM v2_equipos
             WHERE area_id = :area_id
               AND tipo_equipo IN ('CPU', 'Laptop', 'Impresora')
               AND estado_operativo <> 'Baja'
             ORDER BY tipo_equipo ASC, codigo_patrimonial ASC"
        );
        $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function equiposPorArea(): array {
        $stmt = $this->conn->prepare(
            "SELECT id, area_id, codigo_patrimonial, tipo_equipo, marca, modelo
             FROM v2_equipos
             WHERE tipo_equipo IN ('CPU', 'Laptop', 'Impresora')
               AND estado_operativo <> 'Baja'
             ORDER BY tipo_equipo ASC, codigo_patrimonial ASC"
        );
        $stmt->execute();
        $map = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $map[(int) $row['area_id']][] = $row;
        }
        return $map;
    }

    private function horariosDeCelda(int $celdaId): array {
        $stmt = $this->conn->prepare(
            "SELECT h.id, h.celda_id, h.equipo_id, h.hora_inicio, h.hora_fin,
                    e.codigo_patrimonial, e.tipo_equipo, e.marca, e.modelo
             FROM v2_cronograma_horarios h
             INNER JOIN v2_equipos e ON e.id = h.equipo_id
             WHERE h.celda_id = :celda_id
             ORDER BY e.tipo_equipo ASC, e.codigo_patrimonial ASC"
        );
        $stmt->bindValue(':celda_id', $celdaId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function horariosDeCronograma(int $cronogramaId): array {
        $stmt = $this->conn->prepare(
            "SELECT h.id, h.celda_id, h.equipo_id, h.hora_inicio, h.hora_fin,
                    e.codigo_patrimonial, e.tipo_equipo, e.marca, e.modelo
             FROM v2_cronograma_horarios h
             INNER JOIN v2_cronograma_celdas c ON c.id = h.celda_id
             INNER JOIN v2_equipos e ON e.id = h.equipo_id
             WHERE c.cronograma_id = :id
             ORDER BY e.tipo_equipo ASC, e.codigo_patrimonial ASC"
        );
        $stmt->bindValue(':id', $cronogramaId, PDO::PARAM_INT);
        $stmt->execute();
        $map = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $map[(int) $row['celda_id']][] = $row;
        }
        return $map;
    }

    private function totalesDeFilas(array $filas): array {
        $pc = 0;
        $laptop = 0;
        $impresora = 0;
        foreach ($filas as $fila) {
            $pc += (int) $fila['pc'];
            $laptop += (int) $fila['laptop'];
            $impresora += (int) $fila['impresora'];
        }
        return [
            'pc' => $pc,
            'laptop' => $laptop,
            'impresora' => $impresora,
            'subtotal' => $pc + $laptop + $impresora,
            'total' => $pc + $laptop + $impresora,
        ];
    }

    private function coberturaDeFilas(array $filas): array {
        $out = [];
        foreach ($filas as $fila) {
            $computadoras = (int) ($fila['computadoras'] ?? 0);
            $programados = (int) ($fila['programados'] ?? 0);
            if ($computadoras > 0 && $programados < $computadoras) {
                $out[] = [
                    'area_id' => $fila['area_id'],
                    'area' => $fila['area'],
                    'pc' => $fila['pc'],
                    'laptop' => $fila['laptop'],
                    'impresora' => $fila['impresora'],
                    'computadoras' => $computadoras,
                    'programados' => $programados,
                    'pendientes' => $computadoras - $programados,
                    'total' => $fila['total'],
                ];
            }
        }
        return $out;
    }
}
