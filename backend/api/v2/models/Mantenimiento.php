<?php
class Mantenimiento {
    private $conn;
    private $table_name = "v2_fichas_mantenimiento";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT m.*, e.codigo_patrimonial, c.nombre as categoria_falla, u.nombre_completo as tecnico
                  FROM " . $this->table_name . " m
                  LEFT JOIN v2_equipos e ON m.equipo_id = e.id
                  LEFT JOIN v2_categorias_falla c ON m.categoria_falla_id = c.id
                  LEFT JOIN v2_usuarios u ON m.tecnico_id = u.id
                  ORDER BY m.fecha_intervencion DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                 (nro_orden, equipo_id, fecha_intervencion, tecnico_id, tipo_mantenimiento, categoria_falla_id, diagnostico_texto, actividades_realizadas, piezas_reemplazadas, costo_reparacion, estado_post_mantenimiento)
                 VALUES 
                 (:nro_orden, :equipo_id, :fecha_intervencion, :tecnico_id, :tipo_mantenimiento, :categoria_falla_id, :diagnostico_texto, :actividades_realizadas, :piezas_reemplazadas, :costo_reparacion, :estado_post_mantenimiento)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":nro_orden", $data->nro_orden);
        $stmt->bindParam(":equipo_id", $data->equipo_id);
        $stmt->bindParam(":fecha_intervencion", $data->fecha_intervencion);
        $stmt->bindParam(":tecnico_id", $data->tecnico_id);
        $stmt->bindParam(":tipo_mantenimiento", $data->tipo_mantenimiento);
        $stmt->bindParam(":categoria_falla_id", $data->categoria_falla_id);
        $stmt->bindParam(":diagnostico_texto", $data->diagnostico_texto);
        $stmt->bindParam(":actividades_realizadas", $data->actividades_realizadas);
        $stmt->bindParam(":piezas_reemplazadas", $data->piezas_reemplazadas);
        $stmt->bindParam(":costo_reparacion", $data->costo_reparacion);
        $stmt->bindParam(":estado_post_mantenimiento", $data->estado_post_mantenimiento);

        try {
            if($stmt->execute()) return true;
        } catch(PDOException $e) {
            error_log("Error creando mantenimiento: " . $e->getMessage());
            return false;
        }
        return false;
    }
}
?>
