<?php

use PHPUnit\Framework\TestCase;

final class DashboardConsultaTest extends TestCase
{
    private PDO $pdo;
    private Dashboard $dashboard;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->seedSchema();
        $this->seedData();
        $this->dashboard = new Dashboard($this->pdo);
    }

    private function seedSchema(): void
    {
        $this->pdo->exec("
            CREATE TABLE v2_areas (id INTEGER PRIMARY KEY, nombre TEXT);
            CREATE TABLE v2_equipos (
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
            );
        ");
    }

    private function seedData(): void
    {
        $this->pdo->exec("INSERT INTO v2_areas (id, nombre) VALUES (1, 'Sistemas')");

        $rows = [
            [1, '740000001001', 'Laptop', 'Dell', 'Latitude', 'Operativo', 'Bueno'],
            [2, '740000001002', 'CPU', 'HP', 'ProDesk', 'Dañado', 'Regular'],
            [3, '740000001003', 'Plotter', 'Canon', 'IPF', 'Operativo', 'Bueno'],
            [4, '740000001004', 'Monitor', 'LG', '24MK', 'Excedencia', 'Bueno'],
            [5, '740000001005', 'Detector de billetes', 'Glory', 'GFS', 'Operativo', 'Nuevo'],
        ];

        $stmt = $this->pdo->prepare("
            INSERT INTO v2_equipos
            (id, codigo_patrimonial, tipo_equipo, marca, modelo, estado_operativo, estado_conservacion, area_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ");

        foreach ($rows as $row) {
            $stmt->execute($row);
        }
    }

    public function test_filtra_por_tipo_laptop(): void
    {
        $result = $this->dashboard->consultarEquipos('Laptop', null, null);

        $this->assertCount(1, $result);
        $this->assertSame('740000001001', $result[0]['codigo_patrimonial']);
    }

    public function test_filtra_por_estado_operativo_danado(): void
    {
        $result = $this->dashboard->consultarEquipos(null, 'Dañado', null);

        $this->assertCount(1, $result);
        $this->assertSame('CPU', $result[0]['tipo_equipo']);
    }

    public function test_filtro_combinado_tipo_y_estado(): void
    {
        $result = $this->dashboard->consultarEquipos('CPU', 'Dañado', null);

        $this->assertCount(1, $result);
        $this->assertSame('740000001002', $result[0]['codigo_patrimonial']);
    }

    public function test_otro_sin_texto_incluye_tipos_no_estandar(): void
    {
        $result = $this->dashboard->consultarEquipos('Otro', null, null);
        $tipos = array_column($result, 'tipo_equipo');

        $this->assertContains('Plotter', $tipos);
        $this->assertContains('Detector de billetes', $tipos);
        $this->assertNotContains('Laptop', $tipos);
    }

    public function test_otro_con_texto_filtra_por_coincidencia(): void
    {
        $result = $this->dashboard->consultarEquipos('Otro', null, null, 'plotter');

        $this->assertCount(1, $result);
        $this->assertSame('Plotter', $result[0]['tipo_equipo']);
    }

    public function test_rechaza_estado_operativo_invalido(): void
    {
        $result = $this->dashboard->consultarEquipos(null, 'Inventado', null);

        $this->assertCount(5, $result);
    }

    public function test_sin_filtros_devuelve_todos(): void
    {
        $result = $this->dashboard->consultarEquipos(null, null, null);

        $this->assertCount(5, $result);
    }
}
