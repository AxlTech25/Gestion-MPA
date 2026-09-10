<?php
class Usuario {
    public const ROLES_VALIDOS = ['Administrador', 'Tecnico', 'Practicante'];

    private $conn;
    private $table_name = "v2_usuarios";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT id, nombre_completo, usuario, rol 
                  FROM " . $this->table_name . " 
                  ORDER BY nombre_completo ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT id, nombre_completo, usuario, rol, area_id FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                 (nombre_completo, usuario, password_hash, rol) 
                 VALUES (:nombre_completo, :usuario, :password_hash, :rol)";
        $stmt = $this->conn->prepare($query);
        
        $hash = password_hash($data->password, PASSWORD_DEFAULT);
        
        $stmt->bindParam(":nombre_completo", $data->nombre_completo);
        $stmt->bindParam(":usuario", $data->usuario);
        $stmt->bindParam(":password_hash", $hash);
        $stmt->bindParam(":rol", $data->rol);

        try {
            if($stmt->execute()) return true;
        } catch(PDOException $e) {
            error_log("Error creando usuario: " . $e->getMessage());
            return false;
        }
        return false;
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        if (isset($data->nombre_completo)) {
            $fields[] = 'nombre_completo = :nombre_completo';
            $params[':nombre_completo'] = $data->nombre_completo;
        }
        if (isset($data->usuario)) {
            $fields[] = 'usuario = :usuario';
            $params[':usuario'] = $data->usuario;
        }
        if (isset($data->rol)) {
            $fields[] = 'rol = :rol';
            $params[':rol'] = $data->rol;
        }
        if (isset($data->area_id)) {
            $fields[] = 'area_id = :area_id';
            $params[':area_id'] = $data->area_id;
        }
        if (isset($data->password) && !empty($data->password)) {
            $fields[] = 'password_hash = :password_hash';
            $params[':password_hash'] = password_hash($data->password, PASSWORD_DEFAULT);
        }

        if (empty($fields)) return false;

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        try {
            if ($stmt->execute($params)) return true;
        } catch (PDOException $e) {
            error_log("Error actualizando usuario: " . $e->getMessage());
            return false;
        }
        return false;
    }

    public function countByRol(string $rol): int {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE rol = :rol";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':rol', $rol);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        try {
            if ($stmt->execute([':id' => $id])) return true;
        } catch (PDOException $e) {
            error_log("Error eliminando usuario: " . $e->getMessage());
            return false;
        }
        return false;
    }
}
?>
