<?php
class Area {
    private $conn;
    private $table_name = 'v2_areas';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = 'SELECT a.id, a.nombre, a.jefe_encargado, a.descripcion, a.gerencia_id,
                         g.nombre AS gerencia, g.orden AS gerencia_orden
                  FROM ' . $this->table_name . ' a
                  LEFT JOIN v2_gerencias g ON g.id = a.gerencia_id
                  ORDER BY CASE WHEN a.gerencia_id IS NULL THEN 1 ELSE 0 END,
                           g.orden ASC, g.nombre ASC, a.nombre ASC';
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById(int $id): ?array {
        $stmt = $this->conn->prepare(
            'SELECT a.id, a.nombre, a.jefe_encargado, a.descripcion, a.gerencia_id,
                    g.nombre AS gerencia, g.orden AS gerencia_orden
             FROM ' . $this->table_name . ' a
             LEFT JOIN v2_gerencias g ON g.id = a.gerencia_id
             WHERE a.id = :id LIMIT 1'
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function countEquipos(int $id): int {
        $stmt = $this->conn->prepare('SELECT COUNT(*) FROM v2_equipos WHERE area_id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
    }

    public function create($data) {
        $query = 'INSERT INTO ' . $this->table_name
            . ' (nombre, jefe_encargado, descripcion, gerencia_id)
               VALUES (:nombre, :jefe_encargado, :descripcion, :gerencia_id)';
        $stmt = $this->conn->prepare($query);
        $nombre = trim((string) ($data->nombre ?? ''));
        $jefe = (string) ($data->jefe_encargado ?? '');
        $desc = (string) ($data->descripcion ?? '');
        $gerenciaId = $this->gerenciaIdDe($data);
        $stmt->bindValue(':nombre', $nombre);
        $stmt->bindValue(':jefe_encargado', $jefe);
        $stmt->bindValue(':descripcion', $desc);
        if ($gerenciaId === null) {
            $stmt->bindValue(':gerencia_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':gerencia_id', $gerenciaId, PDO::PARAM_INT);
        }

        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch (PDOException $e) {
            error_log('Error creando área: ' . $e->getMessage());
            return false;
        }
        return false;
    }

    public function update(int $id, object $data): mixed {
        if (!$this->getById($id)) {
            return ['error' => 'Área no encontrada.', 'status' => 404];
        }
        $nombre = trim((string) ($data->nombre ?? ''));
        if ($nombre === '') {
            return ['error' => 'El nombre del área es obligatorio.', 'status' => 400];
        }
        $jefe = (string) ($data->jefe_encargado ?? '');
        $desc = (string) ($data->descripcion ?? '');
        $gerenciaId = $this->gerenciaIdDe($data);
        $stmt = $this->conn->prepare(
            'UPDATE ' . $this->table_name . '
             SET nombre = :nombre, jefe_encargado = :jefe, descripcion = :descripcion,
                 gerencia_id = :gerencia_id
             WHERE id = :id'
        );
        $stmt->bindValue(':nombre', $nombre);
        $stmt->bindValue(':jefe', $jefe);
        $stmt->bindValue(':descripcion', $desc);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        if ($gerenciaId === null) {
            $stmt->bindValue(':gerencia_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':gerencia_id', $gerenciaId, PDO::PARAM_INT);
        }
        try {
            $stmt->execute();
            return $this->getById($id);
        } catch (PDOException $e) {
            error_log('Error actualizando área: ' . $e->getMessage());
            return ['error' => 'No se pudo actualizar el área. Verifique que el nombre no esté duplicado.', 'status' => 503];
        }
    }

    public function delete(int $id): mixed {
        if (!$this->getById($id)) {
            return ['error' => 'Área no encontrada.', 'status' => 404];
        }
        $n = $this->countEquipos($id);
        if ($n > 0) {
            return [
                'error' => 'No se puede eliminar: hay ' . $n . ' equipo(s) asignados. Reasígnelos o dé de baja antes.',
                'status' => 409,
            ];
        }
        $stmt = $this->conn->prepare('DELETE FROM ' . $this->table_name . ' WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            return ['eliminada' => true];
        }
        return ['error' => 'No se pudo eliminar el área.', 'status' => 503];
    }

    private function gerenciaIdDe(object $data): ?int {
        if (!isset($data->gerencia_id) || $data->gerencia_id === '' || $data->gerencia_id === null) {
            return null;
        }
        $id = (int) $data->gerencia_id;
        return $id > 0 ? $id : null;
    }
}
