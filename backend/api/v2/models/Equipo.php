<?php
class Equipo {
    private $conn;
    private $table_name = "v2_equipos";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT e.*, a.nombre as area_nombre 
                  FROM " . $this->table_name . " e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
                  ORDER BY e.fecha_registro DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create($data) {
        $this->conn->beginTransaction();
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                     (codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo, numero_serie, ram_gb, almacenamiento_gb, tipo_disco, fecha_adquisicion, area_id)
                     VALUES 
                     (:codigo_patrimonial, :codigo_identificativo, :tipo_equipo, :marca, :modelo, :numero_serie, :ram_gb, :almacenamiento_gb, :tipo_disco, :fecha_adquisicion, :area_id)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":codigo_patrimonial", $data->codigo_patrimonial);
            $stmt->bindParam(":codigo_identificativo", $data->codigo_identificativo);
            $stmt->bindParam(":tipo_equipo", $data->tipo_equipo);
            $stmt->bindParam(":marca", $data->marca);
            $stmt->bindParam(":modelo", $data->modelo);
            $stmt->bindParam(":numero_serie", $data->numero_serie);
            $stmt->bindParam(":ram_gb", $data->ram_gb);
            $stmt->bindParam(":almacenamiento_gb", $data->almacenamiento_gb);
            $stmt->bindParam(":tipo_disco", $data->tipo_disco);
            $stmt->bindParam(":fecha_adquisicion", $data->fecha_adquisicion);
            $stmt->bindParam(":area_id", $data->area_id);

            $stmt->execute();
            $equipo_id = $this->conn->lastInsertId();

            // Insertar en ficha técnica si es Laptop o CPU (PC)
            if (in_array($data->tipo_equipo, ['Laptop', 'CPU', 'PC'])) {
                $query_ficha = "INSERT INTO v2_fichas_tecnicas (equipo_id, procesador, sistema_operativo) 
                                VALUES (:equipo_id, :procesador, :sistema_operativo)";
                $stmt_ficha = $this->conn->prepare($query_ficha);
                $stmt_ficha->bindParam(":equipo_id", $equipo_id);
                $stmt_ficha->bindParam(":procesador", $data->procesador);
                $stmt_ficha->bindParam(":sistema_operativo", $data->sistema_operativo);
                $stmt_ficha->execute();
            }

            $this->conn->commit();
            return true;
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("Error creando equipo: " . $e->getMessage());
            return false;
        }
    }
}
?>
