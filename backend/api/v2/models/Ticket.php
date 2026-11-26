<?php

class Ticket {
    public const ESTADOS = ['Abierto', 'En atencion', 'Resuelto', 'Cerrado'];

    public const MOTIVOS = [
        'Equipo no enciende / no funciona',
        'Problema de red / internet',
        'Impresora / periféricos',
        'Software / aplicaciones',
        'Solicitud de mantenimiento',
        'Otro',
    ];

    private $conn;
    private $table = 'v2_tickets';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll(?string $estado = null): array {
        $sql = 'SELECT t.id, t.codigo, t.gerencia_id, t.area_id, t.motivo, t.descripcion,
                       t.solicitante_nombre, t.estado, t.asignado_a, t.creado_en, t.actualizado_en,
                       g.nombre AS gerencia, a.nombre AS area,
                       u.nombre_completo AS asignado_nombre
                FROM ' . $this->table . ' t
                INNER JOIN v2_gerencias g ON g.id = t.gerencia_id
                INNER JOIN v2_areas a ON a.id = t.area_id
                LEFT JOIN v2_usuarios u ON u.id = t.asignado_a';
        $params = [];
        if ($estado !== null && $estado !== '' && in_array($estado, self::ESTADOS, true)) {
            $sql .= ' WHERE t.estado = :estado';
            $params[':estado'] = $estado;
        }
        $sql .= ' ORDER BY t.creado_en DESC, t.id DESC';
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        $stmt = $this->conn->prepare(
            'SELECT t.id, t.codigo, t.gerencia_id, t.area_id, t.motivo, t.descripcion,
                    t.solicitante_nombre, t.estado, t.asignado_a, t.creado_en, t.actualizado_en,
                    g.nombre AS gerencia, a.nombre AS area,
                    u.nombre_completo AS asignado_nombre
             FROM ' . $this->table . ' t
             INNER JOIN v2_gerencias g ON g.id = t.gerencia_id
             INNER JOIN v2_areas a ON a.id = t.area_id
             LEFT JOIN v2_usuarios u ON u.id = t.asignado_a
             WHERE t.id = :id LIMIT 1'
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getByCodigo(string $codigo): ?array {
        $stmt = $this->conn->prepare(
            'SELECT t.codigo, t.motivo, t.estado, t.creado_en, t.actualizado_en,
                    g.nombre AS gerencia, a.nombre AS area
             FROM ' . $this->table . ' t
             INNER JOIN v2_gerencias g ON g.id = t.gerencia_id
             INNER JOIN v2_areas a ON a.id = t.area_id
             WHERE t.codigo = :codigo LIMIT 1'
        );
        $stmt->bindValue(':codigo', strtoupper(trim($codigo)));
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function areaPerteneceAGerencia(int $areaId, int $gerenciaId): bool {
        $stmt = $this->conn->prepare(
            'SELECT id FROM v2_areas WHERE id = :area_id AND gerencia_id = :gerencia_id LIMIT 1'
        );
        $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
        $stmt->bindValue(':gerencia_id', $gerenciaId, PDO::PARAM_INT);
        $stmt->execute();
        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * @return array{success?:bool, data?:array, error?:string, status?:int}
     */
    public function create(object $data, ?string $ip): array {
        $gerenciaId = (int) ($data->gerencia_id ?? 0);
        $areaId = (int) ($data->area_id ?? 0);
        $motivo = trim((string) ($data->motivo ?? ''));
        $descripcion = trim((string) ($data->descripcion ?? ''));
        $nombre = trim((string) ($data->solicitante_nombre ?? ''));

        if ($gerenciaId < 1 || $areaId < 1) {
            return ['error' => 'Seleccione gerencia y área.', 'status' => 400];
        }
        if (!in_array($motivo, self::MOTIVOS, true)) {
            return ['error' => 'Seleccione un motivo válido.', 'status' => 400];
        }
        if (!$this->areaPerteneceAGerencia($areaId, $gerenciaId)) {
            return ['error' => 'El área no pertenece a la gerencia indicada.', 'status' => 400];
        }
        if (mb_strlen($descripcion) > 500) {
            return ['error' => 'La descripción no puede superar 500 caracteres.', 'status' => 400];
        }
        if (mb_strlen($nombre) > 120) {
            return ['error' => 'El nombre es demasiado largo.', 'status' => 400];
        }

        $codigo = $this->generarCodigo();
        $stmt = $this->conn->prepare(
            'INSERT INTO ' . $this->table . '
             (codigo, gerencia_id, area_id, motivo, descripcion, solicitante_nombre, estado, ip_origen)
             VALUES (:codigo, :gerencia_id, :area_id, :motivo, :descripcion, :nombre, :estado, :ip)'
        );
        $stmt->bindValue(':codigo', $codigo);
        $stmt->bindValue(':gerencia_id', $gerenciaId, PDO::PARAM_INT);
        $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
        $stmt->bindValue(':motivo', $motivo);
        $stmt->bindValue(':descripcion', $descripcion !== '' ? $descripcion : null);
        $stmt->bindValue(':nombre', $nombre !== '' ? $nombre : null);
        $stmt->bindValue(':estado', 'Abierto');
        $stmt->bindValue(':ip', $ip);

        try {
            if (!$stmt->execute()) {
                return ['error' => 'No se pudo registrar la solicitud.', 'status' => 503];
            }
        } catch (PDOException $e) {
            error_log('Error creando ticket: ' . $e->getMessage());
            return ['error' => 'No se pudo registrar la solicitud.', 'status' => 503];
        }

        $id = (int) $this->conn->lastInsertId();
        return [
            'success' => true,
            'data' => [
                'id' => $id,
                'codigo' => $codigo,
                'estado' => 'Abierto',
            ],
        ];
    }

    /**
     * @return array{success?:bool, data?:array, error?:string, status?:int}
     */
    public function updateEstado(int $id, object $data, ?int $usuarioId): array {
        $actual = $this->getById($id);
        if (!$actual) {
            return ['error' => 'Ticket no encontrado.', 'status' => 404];
        }

        $estado = trim((string) ($data->estado ?? ''));
        if ($estado === '' || !in_array($estado, self::ESTADOS, true)) {
            return ['error' => 'Estado inválido.', 'status' => 400];
        }

        $asignado = array_key_exists('asignado_a', (array) $data)
            ? $data->asignado_a
            : $actual['asignado_a'];

        if ($asignado === '' || $asignado === null) {
            $asignadoId = null;
        } else {
            $asignadoId = (int) $asignado;
            if ($asignadoId < 1) {
                $asignadoId = null;
            }
        }

        // Si pasa a En atención y no hay asignado, asignar al usuario actual
        if ($estado === 'En atencion' && $asignadoId === null && $usuarioId) {
            $asignadoId = $usuarioId;
        }

        $stmt = $this->conn->prepare(
            'UPDATE ' . $this->table . '
             SET estado = :estado, asignado_a = :asignado_a
             WHERE id = :id'
        );
        $stmt->bindValue(':estado', $estado);
        if ($asignadoId === null) {
            $stmt->bindValue(':asignado_a', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':asignado_a', $asignadoId, PDO::PARAM_INT);
        }
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        try {
            if (!$stmt->execute()) {
                return ['error' => 'No se pudo actualizar el ticket.', 'status' => 503];
            }
        } catch (PDOException $e) {
            error_log('Error actualizando ticket: ' . $e->getMessage());
            return ['error' => 'No se pudo actualizar el ticket.', 'status' => 503];
        }

        $row = $this->getById($id);
        return ['success' => true, 'data' => $row];
    }

    private function generarCodigo(): string {
        $anio = date('Y');
        $prefijo = 'TK-' . $anio . '-';
        $stmt = $this->conn->prepare(
            "SELECT codigo FROM {$this->table}
             WHERE codigo LIKE :prefijo
             ORDER BY id DESC LIMIT 1"
        );
        $stmt->execute([':prefijo' => $prefijo . '%']);
        $ultimo = $stmt->fetchColumn();
        $n = 1;
        if (is_string($ultimo) && preg_match('/TK-\d{4}-(\d+)/', $ultimo, $m)) {
            $n = ((int) $m[1]) + 1;
        }
        return $prefijo . str_pad((string) $n, 4, '0', STR_PAD_LEFT);
    }
}
