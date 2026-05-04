<?php
class Usuario {
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
}
?>
