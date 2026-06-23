<?php
class Dashboard {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getResumen(): array {
        return [
            'totales'              => $this->getTotales(),
            'por_estado_operativo' => $this->groupEquipos('estado_operativo'),
            'por_estado_conservacion' => $this->groupEquipos('estado_conservacion'),
            'por_tipo_equipo'      => $this->groupEquipos('tipo_equipo'),
            'por_area'             => $this->groupPorArea(),
            'fallas_por_categoria' => $this->getFallasPorCategoria(),
            'mantenimientos_recientes' => $this->getMantenimientosRecientes(),
        ];
    }

    private function getTotales(): array {
        $equipos = (int) $this->conn->query("SELECT COUNT(*) FROM v2_equipos")->fetchColumn();
        $mantenimientos = (int) $this->conn->query("SELECT COUNT(*) FROM v2_fichas_mantenimiento")->fetchColumn();
        $areas = (int) $this->conn->query("SELECT COUNT(*) FROM v2_areas")->fetchColumn();
        $danados = (int) $this->conn->query("SELECT COUNT(*) FROM v2_equipos WHERE estado_operativo = 'Dañado'")->fetchColumn();

        return compact('equipos', 'mantenimientos', 'areas', 'danados');
    }

    private function groupEquipos(string $column): array {
        $allowed = ['estado_operativo', 'estado_conservacion', 'tipo_equipo'];
        if (!in_array($column, $allowed, true)) {
            return [];
        }

        $stmt = $this->conn->query("
            SELECT {$column} AS label, COUNT(*) AS total
            FROM v2_equipos
            GROUP BY {$column}
            ORDER BY total DESC
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function groupPorArea(): array {
        $stmt = $this->conn->query("
            SELECT a.nombre AS label, COUNT(e.id) AS total
            FROM v2_areas a
            LEFT JOIN v2_equipos e ON e.area_id = a.id
            GROUP BY a.id, a.nombre
            ORDER BY total DESC
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getFallasPorCategoria(): array {
        $stmt = $this->conn->query("
            SELECT cf.nombre AS label, cf.severidad, COUNT(fm.id) AS total
            FROM v2_categorias_falla cf
            LEFT JOIN v2_fichas_mantenimiento fm ON fm.categoria_falla_id = cf.id
            GROUP BY cf.id, cf.nombre, cf.severidad
            HAVING total > 0
            ORDER BY total DESC
            LIMIT 8
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getMantenimientosRecientes(): array {
        $stmt = $this->conn->query("
            SELECT fm.nro_orden, fm.fecha_intervencion, fm.tipo_mantenimiento,
                   e.codigo_patrimonial, cf.nombre AS categoria_falla
            FROM v2_fichas_mantenimiento fm
            INNER JOIN v2_equipos e ON e.id = fm.equipo_id
            LEFT JOIN v2_categorias_falla cf ON cf.id = fm.categoria_falla_id
            ORDER BY fm.fecha_intervencion DESC
            LIMIT 5
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function consultarEquipos(
        ?string $tipo_equipo,
        ?string $estado_operativo,
        ?string $estado_conservacion,
        ?string $tipo_otro = null
    ): array {
        $standardTipos = ['Laptop', 'CPU', 'Impresora', 'Monitor'];
        $allowedOp = ['Operativo', 'Dañado', 'En Reparacion', 'Excedencia', 'Baja'];
        $allowedCons = ['Nuevo', 'Bueno', 'Regular', 'Malo'];

        $where = [];
        $params = [];

        if ($tipo_equipo !== null && $tipo_equipo !== '') {
            if ($tipo_equipo === 'Otro') {
                $where[] = "(e.tipo_equipo = 'Otro' OR e.tipo_equipo NOT IN ('Laptop','CPU','Impresora','Monitor'))";
                $term = trim((string) $tipo_otro);
                if ($term !== '') {
                    $like = '%' . $term . '%';
                    $where[] = '(e.tipo_equipo LIKE :tipo_otro_tipo OR e.marca LIKE :tipo_otro_marca OR e.modelo LIKE :tipo_otro_modelo)';
                    $params[':tipo_otro_tipo'] = $like;
                    $params[':tipo_otro_marca'] = $like;
                    $params[':tipo_otro_modelo'] = $like;
                }
            } elseif (in_array($tipo_equipo, $standardTipos, true)) {
                $where[] = 'e.tipo_equipo = :tipo_equipo';
                $params[':tipo_equipo'] = $tipo_equipo;
            }
        }
        if ($estado_operativo !== null && $estado_operativo !== '' && in_array($estado_operativo, $allowedOp, true)) {
            $where[] = 'e.estado_operativo = :estado_operativo';
            $params[':estado_operativo'] = $estado_operativo;
        }
        if ($estado_conservacion !== null && $estado_conservacion !== '' && in_array($estado_conservacion, $allowedCons, true)) {
            $where[] = 'e.estado_conservacion = :estado_conservacion';
            $params[':estado_conservacion'] = $estado_conservacion;
        }

        $sql = "
            SELECT e.id, e.codigo_patrimonial, e.codigo_identificativo, e.tipo_equipo,
                   e.marca, e.modelo, e.estado_operativo, e.estado_conservacion,
                   e.ubicacion_fisica, a.nombre AS area_nombre
            FROM v2_equipos e
            LEFT JOIN v2_areas a ON e.area_id = a.id
        ";

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY e.codigo_patrimonial ASC';

        $stmt = $this->conn->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
