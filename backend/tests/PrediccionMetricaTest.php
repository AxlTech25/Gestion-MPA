<?php

use PHPUnit\Framework\TestCase;

final class PrediccionMetricaTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec('CREATE TABLE v2_areas (id INTEGER PRIMARY KEY, nombre TEXT)');
        $this->pdo->exec('CREATE TABLE v2_equipos (
            id INTEGER PRIMARY KEY,
            codigo_patrimonial TEXT,
            tipo_equipo TEXT,
            marca TEXT,
            modelo TEXT,
            area_id INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_predicciones_ml (
            id INTEGER PRIMARY KEY,
            equipo_id INTEGER,
            modelo_version TEXT,
            score_riesgo REAL,
            nivel_riesgo TEXT,
            factores_json TEXT,
            categoria_sugerida_id INTEGER,
            generado_en TEXT DEFAULT CURRENT_TIMESTAMP
        )');
        $this->pdo->exec('CREATE TABLE v2_metricas_equipo (
            id INTEGER PRIMARY KEY,
            equipo_id INTEGER,
            mantenimiento_id INTEGER,
            horas_uso INTEGER,
            errores_smart INTEGER,
            contador_paginas INTEGER,
            salud_bateria REAL,
            temp_cpu REAL,
            temp_disco REAL,
            nivel_polvo TEXT
        )');
        $this->pdo->exec("INSERT INTO v2_areas (id, nombre) VALUES (1, 'Sistemas')");
        $this->pdo->exec("INSERT INTO v2_equipos (id, codigo_patrimonial, tipo_equipo, marca, modelo, area_id)
            VALUES (7, 'P-7', 'Laptop', 'HP', 'X', 1)");
    }

    public function test_guarda_prediccion_con_y_sin_categoria(): void
    {
        $pred = new Prediccion($this->pdo);
        $this->assertTrue($pred->guardar([
            'equipo_id' => 7,
            'score_riesgo' => 80,
            'nivel_riesgo' => 'Alto',
            'factores' => [['feature' => 'horas_uso', 'importancia' => 0.4]],
            'categoria_sugerida_id' => 3,
        ]));
        $this->assertTrue($pred->guardar([
            'equipo_id' => 7,
            'score_riesgo' => 20,
            'nivel_riesgo' => 'Bajo',
        ]));
        $alertas = $pred->getAlertas(5);
        $this->assertNotEmpty($alertas);
        $this->assertSame('P-7', $alertas[0]['codigo_patrimonial']);
    }

    public function test_registra_metricas_completas_y_vacias(): void
    {
        $metrica = new MetricaEquipo($this->pdo);
        $this->assertTrue($metrica->registrarDesdeMantenimiento(7, 4, (object) [
            'horas_uso_acumuladas' => '120',
            'salud_bateria_pct' => '88.5',
            'contador_paginas_lectura' => '300',
            'temperatura_cpu' => '41.2',
            'temperatura_disco' => '33',
            'nivel_polvo' => 'Medio',
        ]));
        $this->assertTrue($metrica->registrarDesdeMantenimiento(7, null, (object) [
            'horas_uso_acumuladas' => '',
            'salud_bateria_pct' => '',
            'contador_paginas_lectura' => '',
            'temperatura_cpu' => '',
            'temperatura_disco' => '',
            'nivel_polvo' => '',
        ]));
        $n = (int) $this->pdo->query('SELECT COUNT(*) FROM v2_metricas_equipo')->fetchColumn();
        $this->assertSame(2, $n);
    }
}
