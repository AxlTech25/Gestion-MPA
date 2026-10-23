<?php

use PHPUnit\Framework\TestCase;

final class MlServiceTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
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
    }

    protected function tearDown(): void
    {
        $prop = new ReflectionProperty(LocalConfig::class, 'values');
        $prop->setValue(null, null);
    }

    public function test_responde_si_el_servicio_esta_apagado(): void
    {
        $prop = new ReflectionProperty(LocalConfig::class, 'values');
        $prop->setValue(null, ['ml_service_url' => '']);
        $servicio = new MlService($this->pdo);
        $off = $servicio->call('GET', '/health');
        $this->assertFalse($off['success']);
        $this->assertFalse($servicio->recalcularEquipo(7));
    }

    public function test_persiste_la_prediccion_aunque_el_guardado_falle(): void
    {
        $servicio = new MlService($this->pdo);
        $servicio->persistirPrediccion([
            'equipo_id' => 7,
            'score_riesgo' => 55,
            'nivel_riesgo' => 'Medio',
            'modelo_version' => 'v2',
            'factores' => [],
        ]);
        $n = (int) $this->pdo->query('SELECT COUNT(*) FROM v2_predicciones_ml')->fetchColumn();
        $this->assertSame(1, $n);

        $roto = new MlService(new PDO('sqlite::memory:'));
        $roto->persistirPrediccion([
            'equipo_id' => 1,
            'score_riesgo' => 1,
            'nivel_riesgo' => 'Bajo',
        ]);
        $this->assertTrue(true);
    }

    public function test_informa_si_el_microservicio_no_escucha(): void
    {
        $prop = new ReflectionProperty(LocalConfig::class, 'values');
        $prop->setValue(null, ['ml_service_url' => 'http://127.0.0.1:9']);
        $servicio = new MlService($this->pdo);
        $res = $servicio->call('POST', '/predict/riesgo', ['equipo_id' => 1]);
        $this->assertFalse($res['success']);
        $this->assertNull($res['data']);
    }
}
