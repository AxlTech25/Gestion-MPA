<?php
class MetricaEquipo {
    private PDO $conn;
    private string $table = 'v2_metricas_equipo';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function registrarDesdeMantenimiento(int $equipoId, ?int $mantenimientoId, object $data): bool {
        $query = "INSERT INTO {$this->table}
            (equipo_id, mantenimiento_id, horas_uso, errores_smart, contador_paginas,
             salud_bateria, temp_cpu, temp_disco, nivel_polvo)
            VALUES
            (:equipo_id, :mantenimiento_id, :horas_uso, :errores_smart, :contador_paginas,
             :salud_bateria, :temp_cpu, :temp_disco, :nivel_polvo)";

        $stmt = $this->conn->prepare($query);

        $horas = isset($data->horas_uso_acumuladas) && $data->horas_uso_acumuladas !== ''
            ? (int) $data->horas_uso_acumuladas : null;
        $bateria = isset($data->salud_bateria_pct) && $data->salud_bateria_pct !== ''
            ? round((float) $data->salud_bateria_pct, 2) : null;
        $paginas = isset($data->contador_paginas_lectura) && $data->contador_paginas_lectura !== ''
            ? (int) $data->contador_paginas_lectura : null;
        $tempCpu = isset($data->temperatura_cpu) && $data->temperatura_cpu !== ''
            ? round((float) $data->temperatura_cpu, 2) : null;
        $tempDisco = isset($data->temperatura_disco) && $data->temperatura_disco !== ''
            ? round((float) $data->temperatura_disco, 2) : null;
        $polvo = isset($data->nivel_polvo) && $data->nivel_polvo !== '' ? $data->nivel_polvo : null;

        $stmt->bindValue(':equipo_id', $equipoId, PDO::PARAM_INT);
        $stmt->bindValue(':mantenimiento_id', $mantenimientoId, $mantenimientoId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':horas_uso', $horas, $horas === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':errores_smart', null, PDO::PARAM_NULL);
        $stmt->bindValue(':contador_paginas', $paginas, $paginas === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':salud_bateria', $bateria, $bateria === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':temp_cpu', $tempCpu, $tempCpu === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':temp_disco', $tempDisco, $tempDisco === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':nivel_polvo', $polvo, $polvo === null ? PDO::PARAM_NULL : PDO::PARAM_STR);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('MetricaEquipo::registrarDesdeMantenimiento: ' . $e->getMessage());
            return false;
        }
    }
}
