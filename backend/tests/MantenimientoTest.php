<?php

use PHPUnit\Framework\TestCase;

final class MantenimientoTest extends TestCase
{
    private function makeMantenimiento(): Mantenimiento
    {
        $pdo = new PDO('sqlite::memory:');
        return new Mantenimiento($pdo);
    }

    private function payload(array $overrides = []): object
    {
        return (object) array_merge([
            'fecha_intervencion' => '2026-06-21T14:30:00',
            'estado_post_mantenimiento' => 'Operativo',
        ], $overrides);
    }

    public function test_build_equipo_sync_payload_incluye_fecha(): void
    {
        $model = $this->makeMantenimiento();
        $sync = $model->buildEquipoSyncPayload($this->payload());

        $this->assertSame('2026-06-21', $sync['fecha_ultimo_mantenimiento']);
    }

    public function test_build_equipo_sync_payload_telemetria_completa(): void
    {
        $model = $this->makeMantenimiento();
        $sync = $model->buildEquipoSyncPayload($this->payload([
            'horas_uso_acumuladas' => '1200',
            'salud_bateria_pct' => '87.456',
            'contador_paginas_lectura' => '45000',
            'temperatura_cpu' => '72.5',
            'temperatura_disco' => '41.2',
        ]));

        $this->assertSame(1200, $sync['horas_uso']);
        $this->assertSame(87.46, $sync['salud_bateria']);
        $this->assertSame(45000, $sync['contador_paginas']);
        $this->assertSame(72.5, $sync['ultima_temp_cpu']);
        $this->assertSame(41.2, $sync['ultima_temp_disco']);
    }

    public function test_build_equipo_sync_payload_ignora_campos_vacios(): void
    {
        $model = $this->makeMantenimiento();
        $sync = $model->buildEquipoSyncPayload($this->payload([
            'horas_uso_acumuladas' => '',
            'salud_bateria_pct' => '',
        ]));

        $this->assertArrayNotHasKey('horas_uso', $sync);
        $this->assertArrayNotHasKey('salud_bateria', $sync);
    }

    public function test_estado_post_danado_mapea_en_reparacion(): void
    {
        $model = $this->makeMantenimiento();
        $sync = $model->buildEquipoSyncPayload($this->payload([
            'estado_post_mantenimiento' => 'Dañado',
        ]));

        $this->assertSame('En Reparacion', $sync['estado_operativo']);
    }

    public function test_estado_post_operativo_mapea_operativo(): void
    {
        $model = $this->makeMantenimiento();
        $sync = $model->buildEquipoSyncPayload($this->payload([
            'estado_post_mantenimiento' => 'Operativo',
        ]));

        $this->assertSame('Operativo', $sync['estado_operativo']);
    }

    public function test_estado_post_baja_mapea_baja(): void
    {
        $model = $this->makeMantenimiento();
        $sync = $model->buildEquipoSyncPayload($this->payload([
            'estado_post_mantenimiento' => 'Baja',
        ]));

        $this->assertSame('Baja', $sync['estado_operativo']);
    }
}
