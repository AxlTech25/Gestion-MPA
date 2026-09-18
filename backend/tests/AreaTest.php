<?php

use PHPUnit\Framework\TestCase;

final class AreaTest extends TestCase
{
    private PDO $pdo;
    private Area $area;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec('CREATE TABLE v2_gerencias (id INTEGER PRIMARY KEY, nombre TEXT, orden INTEGER)');
        $this->pdo->exec('CREATE TABLE v2_areas (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            jefe_encargado TEXT,
            descripcion TEXT,
            gerencia_id INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_equipos (id INTEGER PRIMARY KEY, area_id INTEGER)');
        $this->pdo->exec("INSERT INTO v2_gerencias (id, nombre, orden) VALUES (1, 'Gerencia de Administración', 1)");
        $this->pdo->exec("INSERT INTO v2_areas (id, nombre, jefe_encargado, descripcion, gerencia_id)
            VALUES (1, 'Tesorería', 'Ana', '', 1), (2, 'Vacía', 'Luis', '', NULL)");
        $this->pdo->exec('INSERT INTO v2_equipos (id, area_id) VALUES (10, 1)');
        $this->area = new Area($this->pdo);
    }

    public function test_no_elimina_area_con_equipos(): void
    {
        $result = $this->area->delete(1);
        $this->assertSame(409, $result['status']);
        $this->assertSame(1, $this->area->countEquipos(1));
    }

    public function test_elimina_area_sin_equipos(): void
    {
        $result = $this->area->delete(2);
        $this->assertTrue($result['eliminada']);
        $this->assertNull($this->area->getById(2));
    }

    public function test_actualiza_nombre_y_gerencia(): void
    {
        $data = (object) [
            'nombre' => 'Tesorería Municipal',
            'jefe_encargado' => 'Ana',
            'descripcion' => '',
            'gerencia_id' => 1,
        ];
        $row = $this->area->update(1, $data);
        $this->assertSame('Tesorería Municipal', $row['nombre']);
        $this->assertSame(1, (int) $row['gerencia_id']);
    }
}
