<?php
class Prediccion {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function guardar(array $data): bool {
        $query = "INSERT INTO v2_predicciones_ml
            (equipo_id, modelo_version, score_riesgo, nivel_riesgo, factores_json, categoria_sugerida_id)
            VALUES
            (:equipo_id, :modelo_version, :score_riesgo, :nivel_riesgo, :factores_json, :categoria_sugerida_id)";

        $stmt = $this->conn->prepare($query);
        $factores = isset($data['factores']) ? json_encode($data['factores'], JSON_UNESCAPED_UNICODE) : null;

        $stmt->bindValue(':equipo_id', (int) $data['equipo_id'], PDO::PARAM_INT);
        $stmt->bindValue(':modelo_version', $data['modelo_version'] ?? 'v1');
        $stmt->bindValue(':score_riesgo', $data['score_riesgo']);
        $stmt->bindValue(':nivel_riesgo', $data['nivel_riesgo']);
        $stmt->bindValue(':factores_json', $factores);
        $categoria = $data['categoria_sugerida_id'] ?? null;
        if ($categoria === null) {
            $stmt->bindValue(':categoria_sugerida_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':categoria_sugerida_id', (int) $categoria, PDO::PARAM_INT);
        }

        return $stmt->execute();
    }

    public function getAlertas(int $limit = 10): array {
        $query = "SELECT p.equipo_id, p.score_riesgo, p.nivel_riesgo, p.modelo_version,
                         p.factores_json, p.generado_en,
                         e.codigo_patrimonial, e.tipo_equipo, e.marca, e.modelo,
                         a.nombre AS area_nombre
                  FROM v2_predicciones_ml p
                  INNER JOIN (
                      SELECT equipo_id, MAX(generado_en) AS max_gen
                      FROM v2_predicciones_ml
                      GROUP BY equipo_id
                  ) ult ON ult.equipo_id = p.equipo_id AND ult.max_gen = p.generado_en
                  INNER JOIN v2_equipos e ON e.id = p.equipo_id
                  LEFT JOIN v2_areas a ON a.id = e.area_id
                  ORDER BY p.score_riesgo DESC, p.generado_en DESC
                  LIMIT :lim";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
