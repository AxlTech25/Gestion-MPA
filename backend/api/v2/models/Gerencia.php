<?php
class Gerencia {
    private $conn;
    private $table_name = 'v2_gerencias';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll(): array {
        $stmt = $this->conn->prepare(
            'SELECT id, nombre, orden FROM ' . $this->table_name . ' ORDER BY orden ASC, nombre ASC'
        );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        $stmt = $this->conn->prepare(
            'SELECT id, nombre, orden FROM ' . $this->table_name . ' WHERE id = :id LIMIT 1'
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function create(object $data): mixed {
        $nombre = trim((string) ($data->nombre ?? ''));
        if ($nombre === '') {
            return ['error' => 'El nombre de la gerencia es obligatorio.', 'status' => 400];
        }
        $orden = isset($data->orden) ? (int) $data->orden : $this->siguienteOrden();
        $stmt = $this->conn->prepare(
            'INSERT INTO ' . $this->table_name . ' (nombre, orden) VALUES (:nombre, :orden)'
        );
        $stmt->bindValue(':nombre', $nombre);
        $stmt->bindValue(':orden', $orden, PDO::PARAM_INT);
        try {
            if ($stmt->execute()) {
                return ['id' => (int) $this->conn->lastInsertId(), 'nombre' => $nombre, 'orden' => $orden];
            }
        } catch (PDOException $e) {
            if ((int) $e->getCode() === 23000) {
                return ['error' => 'Ya existe una gerencia con ese nombre.', 'status' => 409];
            }
            error_log('Error creando gerencia: ' . $e->getMessage());
        }
        return ['error' => 'No se pudo crear la gerencia.', 'status' => 503];
    }

    public function update(int $id, object $data): mixed {
        if (!$this->getById($id)) {
            return ['error' => 'Gerencia no encontrada.', 'status' => 404];
        }
        $nombre = trim((string) ($data->nombre ?? ''));
        if ($nombre === '') {
            return ['error' => 'El nombre de la gerencia es obligatorio.', 'status' => 400];
        }
        $orden = isset($data->orden) ? (int) $data->orden : null;
        $sql = 'UPDATE ' . $this->table_name . ' SET nombre = :nombre';
        if ($orden !== null) {
            $sql .= ', orden = :orden';
        }
        $sql .= ' WHERE id = :id';
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nombre', $nombre);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        if ($orden !== null) {
            $stmt->bindValue(':orden', $orden, PDO::PARAM_INT);
        }
        try {
            $stmt->execute();
            return $this->getById($id);
        } catch (PDOException $e) {
            if ((int) $e->getCode() === 23000) {
                return ['error' => 'Ya existe una gerencia con ese nombre.', 'status' => 409];
            }
            error_log('Error actualizando gerencia: ' . $e->getMessage());
            return ['error' => 'No se pudo actualizar la gerencia.', 'status' => 503];
        }
    }

    public function delete(int $id): mixed {
        if (!$this->getById($id)) {
            return ['error' => 'Gerencia no encontrada.', 'status' => 404];
        }
        $stmt = $this->conn->prepare('DELETE FROM ' . $this->table_name . ' WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            return ['eliminada' => true];
        }
        return ['error' => 'No se pudo eliminar la gerencia.', 'status' => 503];
    }

    private function siguienteOrden(): int {
        $stmt = $this->conn->query('SELECT COALESCE(MAX(orden), 0) + 1 FROM ' . $this->table_name);
        return (int) $stmt->fetchColumn();
    }
}
