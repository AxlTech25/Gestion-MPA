<?php

use PHPUnit\Framework\TestCase;

final class GerenciaTest extends TestCase
{
    private PDO $pdo;
    private Gerencia $gerencia;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec('CREATE TABLE v2_gerencias (
            id INTEGER PRIMARY KEY,
            nombre TEXT UNIQUE,
            orden INTEGER
        )');
        $this->gerencia = new Gerencia($this->pdo);
    }

    public function test_crea_lista_y_calcula_el_siguiente_orden(): void
    {
        $creada = $this->gerencia->create((object) ['nombre' => '  Obras  ']);
        $this->assertSame('Obras', $creada['nombre']);
        $this->assertSame(1, $creada['orden']);

        $segunda = $this->gerencia->create((object) ['nombre' => 'Administración', 'orden' => 4]);
        $this->assertSame(4, $segunda['orden']);

        $nombres = array_column($this->gerencia->getAll(), 'nombre');
        $this->assertSame(['Obras', 'Administración'], $nombres);
        $this->assertSame('Obras', $this->gerencia->getById($creada['id'])['nombre']);
        $this->assertNull($this->gerencia->getById(99));
    }

    public function test_rechaza_nombre_vacio_y_duplicado(): void
    {
        $this->assertSame(400, $this->gerencia->create((object) [])['status']);
        $this->gerencia->create((object) ['nombre' => 'Obras']);
        $dup = $this->gerencia->create((object) ['nombre' => 'Obras']);
        $this->assertSame(409, $dup['status']);
    }

    public function test_actualiza_y_elimina(): void
    {
        $id = $this->gerencia->create((object) ['nombre' => 'Obras'])['id'];
        $this->assertSame(404, $this->gerencia->update(99, (object) ['nombre' => 'X'])['status']);
        $this->assertSame(400, $this->gerencia->update($id, (object) ['nombre' => '  '])['status']);

        $row = $this->gerencia->update($id, (object) ['nombre' => 'Obras públicas']);
        $this->assertSame('Obras públicas', $row['nombre']);
        $conOrden = $this->gerencia->update($id, (object) ['nombre' => 'Obras públicas', 'orden' => 8]);
        $this->assertSame(8, (int) $conOrden['orden']);

        $this->gerencia->create((object) ['nombre' => 'Caja']);
        $this->assertSame(409, $this->gerencia->update($id, (object) ['nombre' => 'Caja'])['status']);

        $this->assertSame(404, $this->gerencia->delete(99)['status']);
        $this->assertTrue($this->gerencia->delete($id)['eliminada']);
        $this->assertNull($this->gerencia->getById($id));
    }
}
