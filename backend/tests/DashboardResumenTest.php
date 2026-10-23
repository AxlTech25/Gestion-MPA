<?php

use PHPUnit\Framework\TestCase;

final class DashboardResumenTest extends TestCase
{
    public function test_arma_el_resumen(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('CREATE TABLE v2_areas (id INTEGER PRIMARY KEY, nombre TEXT)');
        $pdo->exec('CREATE TABLE v2_equipos (
            id INTEGER PRIMARY KEY,
            estado_operativo TEXT,
            estado_conservacion TEXT,
            tipo_equipo TEXT,
            area_id INTEGER,
            codigo_patrimonial TEXT
        )');
        $pdo->exec('CREATE TABLE v2_categorias_falla (id INTEGER PRIMARY KEY, nombre TEXT, severidad TEXT)');
        $pdo->exec('CREATE TABLE v2_fichas_mantenimiento (
            id INTEGER PRIMARY KEY,
            nro_orden TEXT,
            fecha_intervencion TEXT,
            tipo_mantenimiento TEXT,
            equipo_id INTEGER,
            categoria_falla_id INTEGER
        )');
        $pdo->exec("INSERT INTO v2_areas (id, nombre) VALUES (1, 'Sistemas')");
        $pdo->exec("INSERT INTO v2_equipos (id, estado_operativo, estado_conservacion, tipo_equipo, area_id, codigo_patrimonial)
            VALUES (1, 'Dañado', 'Regular', 'Laptop', 1, 'P1')");
        $pdo->exec("INSERT INTO v2_categorias_falla (id, nombre, severidad) VALUES (1, 'Disco', 'Alta'), (2, 'Sin uso', 'Baja')");
        $pdo->exec("INSERT INTO v2_fichas_mantenimiento (id, nro_orden, fecha_intervencion, tipo_mantenimiento, equipo_id, categoria_falla_id)
            VALUES (1, 'OT-1', '2026-01-02', 'Correctivo', 1, 1)");

        $resumen = (new Dashboard($pdo))->getResumen();
        $this->assertSame(1, $resumen['totales']['equipos']);
        $this->assertSame(1, $resumen['totales']['danados']);
        $this->assertSame(1, $resumen['totales']['mantenimientos']);
        $this->assertSame('Dañado', $resumen['por_estado_operativo'][0]['label']);
        $this->assertSame('Sistemas', $resumen['por_area'][0]['label']);
        $this->assertSame('Disco', $resumen['fallas_por_categoria'][0]['label']);
        $this->assertSame('P1', $resumen['mantenimientos_recientes'][0]['codigo_patrimonial']);
    }

    public function test_filtra_por_conservacion_e_ignora_valores_invalidos(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('CREATE TABLE v2_areas (id INTEGER PRIMARY KEY, nombre TEXT)');
        $pdo->exec('CREATE TABLE v2_equipos (
            id INTEGER PRIMARY KEY,
            codigo_patrimonial TEXT,
            codigo_identificativo TEXT,
            tipo_equipo TEXT,
            marca TEXT,
            modelo TEXT,
            estado_operativo TEXT,
            estado_conservacion TEXT,
            ubicacion_fisica TEXT,
            area_id INTEGER
        )');
        $pdo->exec("INSERT INTO v2_areas (id, nombre) VALUES (1, 'Sistemas')");
        $pdo->exec("INSERT INTO v2_equipos
            (id, codigo_patrimonial, tipo_equipo, marca, modelo, estado_operativo, estado_conservacion, area_id)
            VALUES (1, 'A', 'Laptop', 'HP', 'X', 'Operativo', 'Malo', 1)");
        $dash = new Dashboard($pdo);
        $this->assertCount(1, $dash->consultarEquipos(null, '', 'Malo'));
        $this->assertCount(1, $dash->consultarEquipos('Tipo Inventado', 'No existe', 'Tampoco'));
    }
}
