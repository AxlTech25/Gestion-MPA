<?php
class Area {
    private $conn;
    private $table_name = "v2_areas";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT id, nombre, jefe_encargado, descripcion FROM " . $this->table_name . " ORDER BY nombre ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " (nombre, jefe_encargado, descripcion) VALUES (:nombre, :jefe_encargado, :descripcion)";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":jefe_encargado", $data->jefe_encargado);
        $stmt->bindParam(":descripcion", $data->descripcion);

        try {
            if($stmt->execute()) return true;
        } catch(PDOException $e) {
            error_log("Error creando área: " . $e->getMessage());
            return false;
        }
        return false;
    }
}
?>
