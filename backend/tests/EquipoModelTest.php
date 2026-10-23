<?php

use PHPUnit\Framework\TestCase;

final class EquipoModelTest extends TestCase
{
    private PDO $pdo;
    private Equipo $equipo;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec('CREATE TABLE v2_areas (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            jefe_encargado TEXT,
            descripcion TEXT
        )');
        $this->pdo->exec('CREATE TABLE v2_equipos (
            id INTEGER PRIMARY KEY,
            codigo_patrimonial TEXT,
            codigo_identificativo TEXT,
            tipo_equipo TEXT,
            marca TEXT,
            modelo TEXT,
            color TEXT,
            numero_serie TEXT,
            ram_gb INTEGER,
            almacenamiento_gb INTEGER,
            tipo_disco TEXT,
            horas_uso INTEGER,
            errores_smart INTEGER,
            contador_paginas INTEGER,
            salud_bateria REAL,
            ultima_temp_cpu REAL,
            ultima_temp_disco REAL,
            fecha_adquisicion TEXT,
            area_id INTEGER,
            ubicacion_fisica TEXT,
            responsable_nombre TEXT,
            fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP,
            fecha_ultimo_mantenimiento TEXT,
            estado_operativo TEXT
        )');
        $this->pdo->exec('CREATE TABLE v2_fichas_tecnicas (
            id INTEGER PRIMARY KEY,
            equipo_id INTEGER,
            procesador TEXT,
            sistema_operativo TEXT
        )');
        $this->pdo->exec("INSERT INTO v2_areas (id, nombre, jefe_encargado, descripcion)
            VALUES (1, 'Sistemas', 'Ana', 'Piso 2'), (2, 'Caja', '', '')");
        $this->equipo = new Equipo($this->pdo);
    }

    private function fila(array $extra = []): array
    {
        return array_merge([
            'codigo_patrimonial' => '740000000001',
            'codigo_identificativo' => '15',
            'tipo_equipo' => 'laptop',
            'area' => 'Sistemas',
            'marca' => 'HP',
            'modelo' => 'X',
            'fecha_adquisicion' => '02/03/2024',
            'ram_gb' => '8',
            'tipo_disco' => '',
            'procesador' => 'i5',
            'sistema_operativo' => 'Windows 11',
            'horas_uso' => '10',
            'salud_bateria' => '90',
            'ultima_temp_cpu' => '40',
        ], $extra);
    }

    public function test_importa_laptop_monitor_e_impresora(): void
    {
        $laptop = $this->equipo->importRow($this->fila());
        $this->assertTrue($laptop['ok']);
        $guardado = $this->equipo->getById($laptop['id']);
        $this->assertSame('Laptop', $guardado['tipo_equipo']);
        $this->assertSame('SSD', $guardado['tipo_disco']);
        $this->assertSame('Sistemas — Piso 2', $guardado['ubicacion_fisica']);
        $this->assertSame('i5', $guardado['procesador']);

        $monitor = $this->equipo->importRow($this->fila([
            'codigo_patrimonial' => '740000000002',
            'codigo_identificativo' => '',
            'tipo_equipo' => 'Monitor',
            'area' => 'Caja',
            'fecha_adquisicion' => '2024-05-01',
        ]));
        $this->assertTrue($monitor['ok']);

        $impresora = $this->equipo->importRow($this->fila([
            'codigo_patrimonial' => '740000000003',
            'codigo_identificativo' => '16',
            'tipo_equipo' => 'Impresora',
            'contador_paginas' => '1200',
        ]));
        $this->assertTrue($impresora['ok']);
        $this->assertNotEmpty($this->equipo->getAll()->fetchAll(PDO::FETCH_ASSOC));
    }

    public function test_rechaza_filas_invalidas_y_duplicados(): void
    {
        $this->assertStringContainsString('obligatorio', $this->equipo->importRow(['codigo_patrimonial' => ''])['error']);
        $this->assertStringContainsString('12 dígitos', $this->equipo->importRow($this->fila(['codigo_patrimonial' => '123']))['error']);
        $this->assertStringContainsString('Tipo de equipo', $this->equipo->importRow($this->fila(['tipo_equipo' => '']))['error']);
        $this->assertStringContainsString('Área obligatoria', $this->equipo->importRow($this->fila(['area' => '']))['error']);
        $this->assertStringContainsString('no existe', $this->equipo->importRow($this->fila(['area' => 'Fantasma']))['error']);
        $this->assertStringContainsString('no válido', $this->equipo->importRow($this->fila(['tipo_equipo' => 'Robot']))['error']);
        $this->assertStringContainsString('identificativo', $this->equipo->importRow($this->fila(['codigo_identificativo' => 'ABC']))['error']);

        $this->assertTrue($this->equipo->importRow($this->fila(['tipo_equipo' => 'pc', 'fecha_adquisicion' => '  ']))['ok']);
        $dup = $this->equipo->importRow($this->fila(['tipo_equipo' => 'escáner']));
        $this->assertStringContainsString('patrimonial', $dup['error']);
        $otro = $this->equipo->importRow($this->fila([
            'codigo_patrimonial' => '740000000009',
            'codigo_identificativo' => '15',
            'tipo_equipo' => 'Otro',
            'fecha_adquisicion' => 'no-fecha',
        ]));
        $this->assertStringContainsString('identificativo', $otro['error']);
    }

    public function test_crea_actualiza_y_sincroniza(): void
    {
        $this->assertFalse($this->equipo->create((object) ['codigo_patrimonial' => '1']));
        $this->assertSame('Faltan datos obligatorios.', $this->equipo->getLastError());

        $ok = $this->equipo->create((object) [
            'codigo_patrimonial' => '740000000010',
            'codigo_identificativo' => '  ',
            'tipo_equipo' => 'CPU',
            'area_id' => 99,
            'marca' => 'Dell',
            'fecha_adquisicion' => new DateTime('2023-04-05'),
            'ram_gb' => 16,
            'tipo_disco' => 'NVMe',
            'horas_uso' => 3,
            'errores_smart' => 1,
        ]);
        $this->assertTrue($ok);
        $id = (int) $this->pdo->query("SELECT id FROM v2_equipos WHERE codigo_patrimonial = '740000000010'")->fetchColumn();

        $this->assertFalse($this->equipo->update(99, (object) [
            'codigo_patrimonial' => '740000000010',
            'tipo_equipo' => 'CPU',
            'area_id' => 1,
        ]));
        $this->assertTrue($this->equipo->update($id, (object) [
            'codigo_patrimonial' => '740000000010',
            'codigo_identificativo' => '44',
            'tipo_equipo' => 'CPU',
            'area_id' => 2,
            'procesador' => 'i7',
            'sistema_operativo' => 'Windows 10',
            'ultima_temp_disco' => '30.5',
        ]));
        $this->assertSame('44', $this->equipo->getById($id)['codigo_identificativo']);

        $this->assertTrue($this->equipo->syncTelemetria($id, []));
        $this->assertTrue($this->equipo->syncTelemetria($id, [
            'horas_uso' => 20,
            'estado_operativo' => 'Operativo',
            'errores_smart' => '',
        ]));
        $this->assertSame(404, $this->equipo->delete(99)['status']);
        $borrado = $this->equipo->delete($id);
        $this->assertFalse($borrado['ok']);
    }
}
