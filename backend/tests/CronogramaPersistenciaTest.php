<?php

use PHPUnit\Framework\TestCase;

final class CronogramaPersistenciaTest extends TestCase
{
    private PDO $pdo;
    private Cronograma $cronograma;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec('CREATE TABLE v2_usuarios (id INTEGER PRIMARY KEY, nombre_completo TEXT)');
        $this->pdo->exec('CREATE TABLE v2_cronogramas (
            id INTEGER PRIMARY KEY,
            anio INTEGER,
            nombre TEXT,
            notas TEXT,
            creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
            creado_por INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_cronograma_celdas (id INTEGER PRIMARY KEY, cronograma_id INTEGER)');
        $this->pdo->exec('CREATE TABLE v2_cronograma_personal (
            id INTEGER PRIMARY KEY,
            cronograma_id INTEGER,
            nro INTEGER,
            nombre TEXT,
            hora_inicio TEXT,
            hora_fin TEXT
        )');
        $this->pdo->exec("INSERT INTO v2_usuarios (id, nombre_completo) VALUES (1, 'Ana')");
        $this->cronograma = new Cronograma($this->pdo);
    }

    public function test_rechaza_anio_y_nombre(): void
    {
        $this->assertSame(400, $this->cronograma->crear((object) ['anio' => 1990, 'nombre' => 'X'], null)['status']);
        $this->assertSame(400, $this->cronograma->crear((object) ['anio' => 2026, 'nombre' => '  '], null)['status']);
    }

    public function test_crea_lista_y_elimina(): void
    {
        $id = $this->cronograma->crear((object) ['anio' => 2026, 'nombre' => 'Anual', 'notas' => 'ok'], 1);
        $this->assertGreaterThan(0, $id);
        $this->assertSame('Ana', $this->cronograma->getById($id)['creado_por_nombre']);
        $this->assertNull($this->cronograma->getById(99));
        $this->assertCount(1, $this->cronograma->listar(2026));
        $this->assertCount(0, $this->cronograma->listar(2025));
        $this->assertCount(1, $this->cronograma->listar(null));
        $this->assertSame(2, (int) $this->pdo->query('SELECT COUNT(*) FROM v2_cronograma_personal')->fetchColumn());

        $this->assertSame(404, $this->cronograma->eliminar(99)['status']);
        $this->assertTrue($this->cronograma->eliminar($id));
        $this->assertNull($this->cronograma->getById($id));
    }
}
