<?php

use PHPUnit\Framework\TestCase;

final class CronogramaTest extends TestCase
{
    public function test_turnos_x1_x2(): void
    {
        $manana = Cronograma::horasDeTurno('Manana');
        $tarde = Cronograma::horasDeTurno('Tarde');
        $this->assertSame('X1', $manana['codigo']);
        $this->assertSame('10:00:00', $manana['hora_inicio']);
        $this->assertSame('X2', $tarde['codigo']);
        $this->assertSame('14:00:00', $tarde['hora_inicio']);
    }

    public function test_fecha_pertenece_al_anio(): void
    {
        $this->assertTrue(Cronograma::fechaPerteneceAlAnio('2026-09-16', 2026));
        $this->assertFalse(Cronograma::fechaPerteneceAlAnio('2025-12-31', 2026));
        $this->assertFalse(Cronograma::fechaPerteneceAlAnio('16-09-2026', 2026));
    }

    public function test_turno_valido(): void
    {
        $this->assertTrue(Cronograma::turnoValido('Manana'));
        $this->assertTrue(Cronograma::turnoValido('Tarde'));
        $this->assertFalse(Cronograma::turnoValido('Noche'));
    }

    public function test_rango_horas_valido(): void
    {
        $this->assertTrue(Cronograma::rangoHorasValido('10:00', '10:30'));
        $this->assertTrue(Cronograma::rangoHorasValido('10:00:00', '13:00:00'));
        $this->assertFalse(Cronograma::rangoHorasValido('13:00', '10:00'));
        $this->assertSame('10:30:00', Cronograma::normalizarHora('10:30'));
    }

    public function test_codigo_cantidad(): void
    {
        $this->assertSame('X1', Cronograma::codigoCantidad(1));
        $this->assertSame('X3', Cronograma::codigoCantidad(3));
        $this->assertSame('X10', Cronograma::codigoCantidad(10));
        $this->assertSame('', Cronograma::codigoCantidad(0));
        $this->assertSame('X2', Cronograma::marcaEnFecha(2));
        $this->assertTrue(Cronograma::cantidadValida(10));
        $this->assertFalse(Cronograma::cantidadValida(0));
        $this->assertFalse(Cronograma::cantidadValida(31));
    }

    public function test_meses_del_rango(): void
    {
        $filas = [[
            'celdas' => [
                ['fecha' => '2026-09-01'],
                ['fecha' => '2026-11-15'],
            ],
        ]];
        $this->assertSame([9, 10, 11], Cronograma::mesesDelRango($filas, 2026));
        $this->assertSame(range(1, 12), Cronograma::mesesDelRango([['celdas' => []]], 2026));
    }

    public function test_es_fin_de_semana(): void
    {
        $this->assertTrue(Cronograma::esFinDeSemana('2028-01-01'));
        $this->assertTrue(Cronograma::esFinDeSemana('2028-01-02'));
        $this->assertFalse(Cronograma::esFinDeSemana('2028-01-03'));
    }

    public function test_fechas_laborables_siguen_el_anio_del_documento(): void
    {
        $ene = Cronograma::fechasLaborablesDeMeses(2028, [1]);
        $this->assertSame('2028-01-03', $ene[0]);
        $this->assertNotContains('2028-01-01', $ene);
        $this->assertNotContains('2027-01-03', $ene);
        $this->assertSame(2028, (int) substr($ene[0], 0, 4));
    }

    public function test_pares_de_meses_para_pdf(): void
    {
        $filas = [['celdas' => [['fecha' => '2027-09-03']]]];
        $this->assertSame([[9, 10]], Cronograma::paresDeMesesParaPdf($filas, 2027));
        $this->assertCount(6, Cronograma::paresDeMesesParaPdf([['celdas' => []]], 2027));
        $rango = Cronograma::paresDeMesesParaPdf([['celdas' => [
            ['fecha' => '2027-09-03'],
            ['fecha' => '2027-11-05'],
        ]]], 2027);
        $this->assertSame([[9, 10], [11, 12]], $rango);
    }

    public function test_cantidad_laborables_del_mes_no_cuenta_fines(): void
    {
        $this->assertSame(22, Cronograma::cantidadLaborablesDelMes(2026, 9));
        $this->assertSame(count(Cronograma::fechasLaborablesDeMeses(2026, [9])), Cronograma::cantidadLaborablesDelMes(2026, 9));
    }

    public function test_bandas_de_gerencia(): void
    {
        $sin = [['area' => 'RH'], ['area' => 'Logística']];
        $this->assertFalse(Cronograma::hayGerenciasAsignadas($sin));
        $this->assertFalse(Cronograma::debeMostrarBandaGerencia($sin, 0));

        $filas = [
            ['gerencia_id' => 1, 'gerencia' => 'Gerencia de Administración'],
            ['gerencia_id' => 1, 'gerencia' => 'Gerencia de Administración'],
            ['gerencia_id' => null],
        ];
        $this->assertTrue(Cronograma::debeMostrarBandaGerencia($filas, 0));
        $this->assertFalse(Cronograma::debeMostrarBandaGerencia($filas, 1));
        $this->assertTrue(Cronograma::debeMostrarBandaGerencia($filas, 2));
        $this->assertSame('GERENCIA DE ADMINISTRACIÓN', Cronograma::etiquetaGerencia($filas[0]));
        $this->assertSame('OTRAS ÁREAS', Cronograma::etiquetaGerencia($filas[2]));
    }
}
