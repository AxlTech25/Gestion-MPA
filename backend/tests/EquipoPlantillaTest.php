<?php

use PHPUnit\Framework\TestCase;

final class EquipoPlantillaTest extends TestCase
{
    public function test_fila_ejemplo_alineada_con_encabezados(): void
    {
        $headers = EquipoController::plantillaColumnas();
        $ejemplo = EquipoController::plantillaFilaEjemplo();

        $this->assertSame(count($headers), count($ejemplo));
        $this->assertSame('color', $headers[5]);
        $this->assertSame('numero_serie', $headers[6]);
        $this->assertSame('area', $headers[7]);
        $this->assertNotSame('SN123456', $ejemplo[5]);
        $this->assertSame('SN123456', $ejemplo[6]);
        $this->assertSame('Tecnología de la Información', $ejemplo[7]);
    }
}
