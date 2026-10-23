<?php

use Firebase\JWT\JWT;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use PHPUnit\Framework\TestCase;

final class ControladoresRutasTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->esquema();
        Database::$conexionDePrueba = $this->pdo;
        $GLOBALS['V2_SIN_EXIT'] = true;
        unset($GLOBALS['V2_CUERPO_PRUEBA']);
        $_GET = [];
        $_POST = [];
        $_FILES = [];
        $_SERVER['REQUEST_METHOD'] = 'GET';
        unset(
            $_SERVER['HTTP_AUTHORIZATION'],
            $_SERVER['CONTENT_TYPE'],
            $_SERVER['HTTP_ORIGIN'],
            $_SERVER['REDIRECT_HTTP_AUTHORIZATION'],
            $_SERVER['Authorization']
        );
        $valores = new ReflectionProperty(LocalConfig::class, 'values');
        $valores->setValue(null, ['ml_service_url' => '']);
    }

    protected function tearDown(): void
    {
        Database::$conexionDePrueba = null;
        unset($GLOBALS['V2_SIN_EXIT'], $GLOBALS['V2_CUERPO_PRUEBA']);
        $_GET = [];
        $_POST = [];
        $_FILES = [];
        $valores = new ReflectionProperty(LocalConfig::class, 'values');
        $valores->setValue(null, null);
    }

    public function test_areas_gerencias_y_usuarios(): void
    {
        $lista = $this->ruta('routes/areas.php');
        $this->assertTrue($lista['json']['success']);

        $this->como('Administrador', 1);
        $this->cuerpo(['nombre' => '']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->assertSame(400, $this->ruta('routes/areas.php')['code']);

        $this->cuerpo(['nombre' => 'Archivo', 'jefe_encargado' => 'Luis', 'gerencia_id' => 1]);
        $creada = $this->ruta('routes/areas.php');
        $this->assertSame(201, $creada['code']);

        $_GET['id'] = 2;
        $_SERVER['REQUEST_METHOD'] = 'PUT';
        $this->cuerpo(['nombre' => 'Archivo central', 'gerencia_id' => 1]);
        $this->assertTrue($this->ruta('routes/areas.php')['json']['success']);

        unset($_GET['id']);
        $this->assertSame(400, $this->ruta('routes/areas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        $this->assertSame(400, $this->ruta('routes/areas.php')['code']);
        $_GET['id'] = 2;
        $this->assertTrue($this->ruta('routes/areas.php')['json']['success']);
        $_SERVER['REQUEST_METHOD'] = 'TRACE';
        $this->assertSame(405, $this->ruta('routes/areas.php')['code']);

        $_SERVER['REQUEST_METHOD'] = 'GET';
        unset($_GET['id']);
        $this->assertTrue($this->ruta('routes/gerencias.php')['json']['success']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->cuerpo(['nombre' => '']);
        $this->assertSame(400, $this->ruta('routes/gerencias.php')['code']);
        $this->cuerpo(['nombre' => 'Logística', 'orden' => 3]);
        $this->assertSame(201, $this->ruta('routes/gerencias.php')['code']);
        $_GET['id'] = 1;
        $_SERVER['REQUEST_METHOD'] = 'PATCH';
        $this->cuerpo(['nombre' => 'Administración']);
        $this->assertTrue($this->ruta('routes/gerencias.php')['json']['success']);
        unset($_GET['id']);
        $this->assertSame(400, $this->ruta('routes/gerencias.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        $this->assertSame(400, $this->ruta('routes/gerencias.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'TRACE';
        $this->assertSame(405, $this->ruta('routes/gerencias.php')['code']);

        $_SERVER['REQUEST_METHOD'] = 'GET';
        unset($_GET['id']);
        $this->assertTrue($this->ruta('routes/usuarios.php')['json']['success']);
        $_GET['id'] = 9;
        $this->assertSame(404, $this->ruta('routes/usuarios.php')['code']);
        $_GET['id'] = 2;
        $this->assertTrue($this->ruta('routes/usuarios.php')['json']['success']);

        unset($_GET['id']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->cuerpo(['usuario' => 'x']);
        $this->assertSame(400, $this->ruta('routes/usuarios.php')['code']);
        $this->cuerpo([
            'nombre_completo' => 'Nuevo',
            'usuario' => 'nuevo',
            'password' => 'secreto',
            'rol' => 'Invitado',
        ]);
        $this->assertSame(400, $this->ruta('routes/usuarios.php')['code']);
        $this->cuerpo([
            'nombre_completo' => 'Nuevo',
            'usuario' => 'nuevo',
            'password' => 'secreto',
            'rol' => 'Tecnico',
        ]);
        $this->assertSame(201, $this->ruta('routes/usuarios.php')['code']);

        $_SERVER['REQUEST_METHOD'] = 'PUT';
        $this->cuerpo('no-json');
        $this->assertSame(400, $this->ruta('routes/usuarios.php')['code']);
        $_GET['id'] = 1;
        $this->cuerpo(['rol' => 'Tecnico']);
        $this->assertSame(409, $this->ruta('routes/usuarios.php')['code']);
        $this->cuerpo(['nombre_completo' => 'Admin Uno']);
        $this->assertTrue($this->ruta('routes/usuarios.php')['json']['success']);

        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        unset($_GET['id']);
        $this->assertSame(400, $this->ruta('routes/usuarios.php')['code']);
        $_GET['id'] = 1;
        $this->assertSame(403, $this->ruta('routes/usuarios.php')['code']);
        $_GET['id'] = 2;
        $this->assertTrue($this->ruta('routes/usuarios.php')['json']['success']);
        $_SERVER['REQUEST_METHOD'] = 'TRACE';
        $this->assertSame(405, $this->ruta('routes/usuarios.php')['code']);
    }

    public function test_auth_dashboard_y_equipos(): void
    {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertSame(405, $this->ruta('routes/auth.php')['code']);

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->cuerpo(['usuario' => '']);
        $this->assertSame(400, $this->ruta('routes/auth.php')['code']);
        $this->cuerpo(['usuario' => 'nadie', 'password' => 'x']);
        $this->assertSame(401, $this->ruta('routes/auth.php')['code']);
        $this->cuerpo(['usuario' => 'admin', 'password' => 'mala']);
        $this->assertSame(401, $this->ruta('routes/auth.php')['code']);
        $this->cuerpo(['usuario' => 'admin', 'password' => 'admin123']);
        $ok = $this->ruta('routes/auth.php');
        $this->assertTrue($ok['json']['success']);
        $this->assertNotEmpty($ok['json']['token']);

        $_GET['request'] = 'dashboard';
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertTrue($this->ruta('routes/dashboard.php')['json']['success']);
        $_GET['request'] = 'dashboard/consulta';
        $this->assertSame(400, $this->ruta('routes/dashboard.php')['code']);
        $_GET['tipo_equipo'] = 'Laptop';
        $this->assertTrue($this->ruta('routes/dashboard.php')['json']['success']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_GET['request'] = 'dashboard';
        $this->assertSame(405, $this->ruta('routes/dashboard.php')['code']);

        $_GET['request'] = 'equipos';
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertTrue($this->ruta('routes/equipos.php')['json']['success']);
        $_GET['request'] = 'equipos/1';
        $this->assertTrue($this->ruta('routes/equipos.php')['json']['success']);
        $_GET['request'] = 'equipos/99';
        $this->assertSame(404, $this->ruta('routes/equipos.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_GET['request'] = 'equipos/1';
        $this->assertSame(405, $this->ruta('routes/equipos.php')['code']);

        $_GET['request'] = 'equipos';
        $this->cuerpo(['codigo_patrimonial' => '1']);
        $this->assertSame(400, $this->ruta('routes/equipos.php')['code']);
        $this->cuerpo([
            'codigo_patrimonial' => '740000000010',
            'codigo_identificativo' => '21',
            'tipo_equipo' => 'Laptop',
            'area_id' => 1,
            'marca' => 'HP',
            'modelo' => 'X',
        ]);
        $this->assertSame(201, $this->ruta('routes/equipos.php')['code']);

        $_SERVER['REQUEST_METHOD'] = 'PUT';
        $_GET['request'] = 'equipos/1';
        $this->cuerpo(['codigo_patrimonial' => '']);
        $this->assertSame(400, $this->ruta('routes/equipos.php')['code']);
        $this->cuerpo([
            'codigo_patrimonial' => '740000001111',
            'codigo_identificativo' => '11',
            'tipo_equipo' => 'Laptop',
            'area_id' => 1,
            'marca' => 'Dell',
        ]);
        $this->assertTrue($this->ruta('routes/equipos.php')['json']['success']);

        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        $_GET['request'] = 'equipos';
        $this->assertSame(501, $this->ruta('routes/equipos.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'TRACE';
        $this->assertSame(405, $this->ruta('routes/equipos.php')['code']);

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_GET['request'] = 'equipos/carga-masiva';
        unset($_FILES['archivo']);
        $this->assertSame(400, $this->ruta('routes/equipos.php')['code']);
        $_FILES['archivo'] = [
            'name' => 'malo.csv',
            'type' => 'text/csv',
            'tmp_name' => tempnam(sys_get_temp_dir(), 'csv'),
            'error' => UPLOAD_ERR_OK,
            'size' => 1,
        ];
        $this->assertSame(400, $this->ruta('routes/equipos.php')['code']);

        $xlsx = $this->excel([
            ['codigo_patrimonial', 'tipo_equipo', 'area', 'codigo_identificativo'],
            ['740000000077', 'Laptop', 'Sistemas', '77'],
            ['', '', '', ''],
        ]);
        $_FILES['archivo'] = [
            'name' => 'carga.xlsx',
            'type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'tmp_name' => $xlsx,
            'error' => UPLOAD_ERR_OK,
            'size' => filesize($xlsx),
        ];
        $carga = $this->ruta('routes/equipos.php');
        $this->assertTrue($carga['json']['success']);

        $malo = $this->excel([['marca'], ['HP']]);
        $_FILES['archivo']['name'] = 'sin-codigo.xlsx';
        $_FILES['archivo']['tmp_name'] = $malo;
        $this->assertSame(400, $this->ruta('routes/equipos.php')['code']);
    }

    public function test_fichas_mantenimiento_cronograma_y_ml(): void
    {
        $_GET['request'] = 'fichas-tecnicas';
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertSame(400, $this->ruta('routes/fichas_tecnicas.php')['code']);

        $_GET['request'] = 'fichas-tecnicas/1';
        $this->assertTrue($this->ruta('routes/fichas_tecnicas.php')['json']['success']);
        $_GET['request'] = 'fichas-tecnicas/99';
        $this->assertSame(404, $this->ruta('routes/fichas_tecnicas.php')['code']);

        $_GET['request'] = 'fichas-tecnicas/buscar';
        $this->assertSame(400, $this->ruta('routes/fichas_tecnicas.php')['code']);
        $_GET['request'] = 'fichas-tecnicas/buscar/740000001111';
        $this->assertTrue($this->ruta('routes/fichas_tecnicas.php')['json']['success']);
        $_GET['request'] = 'fichas-tecnicas/buscar/000';
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->assertSame(405, $this->ruta('routes/fichas_tecnicas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET['request'] = 'fichas-tecnicas/740000001111';
        $this->assertTrue($this->ruta('routes/fichas_tecnicas.php')['json']['success']);

        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_GET['request'] = 'fichas-tecnicas/1';
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        $this->cuerpo('{');
        $this->assertSame(400, $this->ruta('routes/fichas_tecnicas.php')['code']);
        $this->cuerpo([
            'procesador' => 'i5',
            'sistema_operativo' => 'Windows 11',
            'ram_gb' => '16',
            'almacenamiento_gb' => 'no',
            'estado_operativo' => 'Operativo',
        ]);
        $this->assertTrue($this->ruta('routes/fichas_tecnicas.php')['json']['success']);
        $_POST = ['procesador' => 'i7', 'diagnostico' => 'ok'];
        $this->assertTrue($this->ruta('routes/fichas_tecnicas.php')['json']['success']);
        $_SERVER['REQUEST_METHOD'] = 'TRACE';
        $_POST = [];
        $this->assertSame(405, $this->ruta('routes/fichas_tecnicas.php')['code']);

        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET['request'] = 'mantenimientos';
        $this->assertTrue($this->ruta('routes/mantenimientos.php')['json']['success']);
        $_GET['request'] = 'mantenimientos/9';
        $this->assertSame(404, $this->ruta('routes/mantenimientos.php')['code']);
        $_GET['request'] = 'mantenimientos/historial';
        $this->assertSame(400, $this->ruta('routes/mantenimientos.php')['code']);
        $_GET['request'] = 'mantenimientos/historial/740000001111';
        $this->assertTrue($this->ruta('routes/mantenimientos.php')['json']['success']);
        $_GET['request'] = 'mantenimientos/historial/no-existe';
        $this->assertSame(404, $this->ruta('routes/mantenimientos.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_GET['request'] = 'mantenimientos/historial/740000001111';
        $this->assertSame(405, $this->ruta('routes/mantenimientos.php')['code']);
        $_GET['request'] = 'mantenimientos/1';
        $this->assertSame(405, $this->ruta('routes/mantenimientos.php')['code']);
        $_GET['request'] = 'mantenimientos';
        $this->cuerpo(['equipo_id' => 1]);
        $this->assertSame(400, $this->ruta('routes/mantenimientos.php')['code']);
        $this->cuerpo([
            'equipo_id' => 1,
            'fecha_intervencion' => '2026-10-19',
            'tipo_mantenimiento' => 'Preventivo',
            'nro_orden' => 'OT-9',
            'horas_uso_acumuladas' => 12,
        ]);
        $this->assertSame(201, $this->ruta('routes/mantenimientos.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'TRACE';
        $this->assertSame(405, $this->ruta('routes/mantenimientos.php')['code']);

        $this->como('Tecnico', 2);
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET['request'] = 'cronogramas';
        $_GET['anio'] = '1990';
        $this->assertSame(400, $this->ruta('routes/cronogramas.php')['code']);
        unset($_GET['anio']);
        $this->assertTrue($this->ruta('routes/cronogramas.php')['json']['success']);
        $_SERVER['REQUEST_METHOD'] = 'TRACE';
        $this->assertSame(405, $this->ruta('routes/cronogramas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->cuerpo('no');
        $this->assertSame(400, $this->ruta('routes/cronogramas.php')['code']);
        $this->cuerpo(['anio' => 2026, 'nombre' => 'Anual', 'notas' => 'ok']);
        $creado = $this->ruta('routes/cronogramas.php');
        $this->assertSame(201, $creado['code']);
        $id = $creado['json']['data']['id'];

        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET['request'] = "cronogramas/$id";
        $this->assertTrue($this->ruta('routes/cronogramas.php')['json']['success']);
        $_GET['request'] = 'cronogramas/99';
        $this->assertSame(404, $this->ruta('routes/cronogramas.php')['code']);
        $_GET['request'] = "cronogramas/$id/cobertura";
        $this->assertTrue($this->ruta('routes/cronogramas.php')['json']['success']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->assertSame(405, $this->ruta('routes/cronogramas.php')['code']);
        $_GET['request'] = "cronogramas/$id/personal";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertSame(405, $this->ruta('routes/cronogramas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'PUT';
        $this->cuerpo(['personal' => null]);
        $this->cuerpo('no');
        $this->assertSame(400, $this->ruta('routes/cronogramas.php')['code']);
        $this->cuerpo(['otra' => 1]);
        $this->assertSame(400, $this->ruta('routes/cronogramas.php')['code']);
        $this->cuerpo(['personal' => [['nombre' => 'Ana', 'hora_inicio' => '08:00', 'hora_fin' => '13:00']]]);
        $this->assertTrue($this->ruta('routes/cronogramas.php')['json']['success']);

        $_GET['request'] = "cronogramas/$id/celdas";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertSame(405, $this->ruta('routes/cronogramas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->cuerpo('no');
        $this->assertSame(400, $this->ruta('routes/cronogramas.php')['code']);
        $this->cuerpo(['area_id' => 1, 'fecha' => '2026-10-19', 'cantidad' => 1]);
        $this->ruta('routes/cronogramas.php');
        $_GET['request'] = "cronogramas/$id/celdas/1/horarios";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertSame(405, $this->ruta('routes/cronogramas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'PUT';
        $this->cuerpo(['horarios' => null]);
        $this->cuerpo('no');
        $this->assertSame(400, $this->ruta('routes/cronogramas.php')['code']);
        $this->cuerpo([]);
        $this->assertSame(400, $this->ruta('routes/cronogramas.php')['code']);
        $_GET['request'] = "cronogramas/$id/celdas/1";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertSame(405, $this->ruta('routes/cronogramas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        $this->ruta('routes/cronogramas.php');
        $_GET['request'] = "cronogramas/$id/desconocida";
        $this->assertSame(404, $this->ruta('routes/cronogramas.php')['code']);
        $_GET['request'] = "cronogramas/$id";
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->assertSame(405, $this->ruta('routes/cronogramas.php')['code']);
        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        $this->assertTrue($this->ruta('routes/cronogramas.php')['json']['success']);

        $_GET['request'] = 'ml/no';
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $this->assertSame(404, $this->ruta('routes/ml.php')['code']);
        $_GET['request'] = 'ml/status';
        $this->assertTrue($this->ruta('routes/ml.php')['json']['success']);
        $_GET['request'] = 'ml/alertas';
        $this->assertTrue($this->ruta('routes/ml.php')['json']['success']);
        $_GET['request'] = 'ml/equipos/riesgo';
        $this->assertSame(503, $this->ruta('routes/ml.php')['code']);
        $_GET['request'] = 'ml/equipos/1/riesgo';
        $this->assertSame(503, $this->ruta('routes/ml.php')['code']);
        $_GET['request'] = 'ml/predict/categoria';
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $this->cuerpo(['equipo_id' => 0]);
        $this->assertSame(400, $this->ruta('routes/ml.php')['code']);
        $this->cuerpo(['equipo_id' => 1]);
        $this->assertSame(503, $this->ruta('routes/ml.php')['code']);
        $_GET['request'] = 'ml/train';
        $this->como('Tecnico', 2);
        $this->assertSame(403, $this->ruta('routes/ml.php')['code']);
        $this->como('Administrador', 1);
        $this->assertSame(503, $this->ruta('routes/ml.php')['code']);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_el_indice_despacha_recursos(): void
    {
        $_SERVER['REQUEST_METHOD'] = 'OPTIONS';
        $_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';
        $this->assertSame(200, $this->indice('')['code']);

        $this->como('Administrador', 1);
        $_SERVER['REQUEST_METHOD'] = 'GET';
        unset($_SERVER['HTTP_ORIGIN']);
        $this->assertSame(404, $this->indice('no-existe')['code']);
        $this->assertTrue($this->indice('areas')['json']['success']);
        $this->assertTrue($this->indice('dashboard')['json']['success']);
        $_GET['request'] = 'reportes/nada';
        $this->assertSame(400, $this->indice('reportes/nada')['code']);
    }

    public function test_los_reportes_generan_pdf(): void
    {
        $this->pdo->exec("INSERT INTO v2_fichas_tecnicas (equipo_id, procesador, sistema_operativo, numero_ficha)
            VALUES (1, 'i5', 'Windows 11', '')");
        $this->pdo->exec("INSERT INTO v2_hojas_baja (equipo_id, causal_danio) VALUES (1, 1)");
        $this->pdo->exec("INSERT INTO v2_fichas_mantenimiento (
            id, nro_orden, equipo_id, fecha_intervencion, tipo_mantenimiento, costo_reparacion, estado_post_mantenimiento,
            sintoma_usuario, causa_raiz, componente_principal, diagnostico_texto, piezas_reemplazadas,
            nivel_polvo, temperatura_cpu, temperatura_disco, horas_uso_acumuladas, salud_bateria_pct,
            contador_paginas_lectura, tiempo_inactividad_min
        ) VALUES (
            1, 'OT-1', 1, '2026-10-19', 'Correctivo', 25, 'Operativo',
            'no enciende', 'disco', 'SSD', 'reemplazo', 'SSD',
            'Medio', 70, 40, 100, 80, 0, 15
        )");

        require_once __DIR__ . '/../api/v2/controllers/ReporteController.php';
        $reporte = new ReporteController();
        $pdf = $this->capturar(fn () => $reporte->ficha_tecnica(1));
        $this->assertSame(200, $pdf['code']);
        $this->assertStringStartsWith('%PDF', $pdf['raw']);
        $this->assertSame(404, $this->capturar(fn () => $reporte->ficha_tecnica(99))['code']);

        $this->assertSame(400, $this->capturar(fn () => $reporte->historial_mantenimiento(''))['code']);
        $this->assertSame(404, $this->capturar(fn () => $reporte->historial_mantenimiento('no-existe'))['code']);
        $historial = $this->capturar(fn () => $reporte->historial_mantenimiento('740000001111'));
        $this->assertStringStartsWith('%PDF', $historial['raw']);

        $this->assertSame(404, $this->capturar(fn () => $reporte->ficha_mantenimiento(99))['code']);
        $ficha = $this->capturar(fn () => $reporte->ficha_mantenimiento(1));
        $this->assertStringStartsWith('%PDF', $ficha['raw']);

        $this->assertSame(404, $this->capturar(fn () => $reporte->cronograma(99))['code']);
        $id = (new Cronograma($this->pdo))->crear((object) ['anio' => 2026, 'nombre' => 'Anual'], 1);
        $cronograma = $this->capturar(fn () => $reporte->cronograma((int) $id));
        $this->assertStringStartsWith('%PDF', $cronograma['raw']);
    }

    private function esquema(): void
    {
        $this->pdo->exec('CREATE TABLE v2_gerencias (id INTEGER PRIMARY KEY, nombre TEXT, orden INTEGER)');
        $this->pdo->exec('CREATE TABLE v2_areas (
            id INTEGER PRIMARY KEY, nombre TEXT, jefe_encargado TEXT, descripcion TEXT, gerencia_id INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_usuarios (
            id INTEGER PRIMARY KEY, nombre_completo TEXT, usuario TEXT, password_hash TEXT, rol TEXT, area_id INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_equipos (
            id INTEGER PRIMARY KEY,
            codigo_patrimonial TEXT, codigo_identificativo TEXT, tipo_equipo TEXT,
            marca TEXT, modelo TEXT, color TEXT, numero_serie TEXT,
            ram_gb INTEGER, almacenamiento_gb INTEGER, tipo_disco TEXT,
            horas_uso INTEGER, errores_smart INTEGER, contador_paginas INTEGER,
            salud_bateria REAL, ultima_temp_cpu REAL, ultima_temp_disco REAL,
            fecha_adquisicion TEXT, area_id INTEGER, ubicacion_fisica TEXT, responsable_nombre TEXT,
            fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP, fecha_ultimo_mantenimiento TEXT,
            estado_operativo TEXT, estado_conservacion TEXT, costo_estimado REAL
        )');
        $this->pdo->exec('CREATE TABLE v2_fichas_tecnicas (
            id INTEGER PRIMARY KEY, equipo_id INTEGER, procesador TEXT, sistema_operativo TEXT,
            licencia_so TEXT, mac_address TEXT, ip_asignada TEXT, software_base TEXT,
            observaciones_evaluacion TEXT, diagnostico TEXT, conclusion_motivo TEXT,
            imagen_1 TEXT, imagen_2 TEXT, fecha_evaluacion TEXT, numero_ficha TEXT
        )');
        $this->pdo->exec('CREATE TABLE v2_hojas_baja (
            id INTEGER PRIMARY KEY, equipo_id INTEGER,
            causal_danio INTEGER, causal_excedencia INTEGER, causal_chatarra INTEGER,
            causal_reparacion_onerosa INTEGER, causal_obsolescencia_tecnica INTEGER, causal_raee INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_categorias_falla (id INTEGER PRIMARY KEY, nombre TEXT, severidad TEXT)');
        $this->pdo->exec('CREATE TABLE v2_fichas_mantenimiento (
            id INTEGER PRIMARY KEY, nro_orden TEXT, equipo_id INTEGER, fecha_intervencion TEXT,
            tecnico_id INTEGER, tipo_mantenimiento TEXT, categoria_falla_id INTEGER,
            sintoma_usuario TEXT, causa_raiz TEXT, componente_principal TEXT, nivel_polvo TEXT,
            temperatura_cpu REAL, temperatura_disco REAL, horas_uso_acumuladas INTEGER,
            salud_bateria_pct REAL, contador_paginas_lectura INTEGER, diagnostico_texto TEXT,
            actividades_realizadas TEXT, piezas_reemplazadas TEXT, costo_reparacion REAL,
            tiempo_inactividad_min INTEGER, estado_post_mantenimiento TEXT
        )');
        $this->pdo->exec('CREATE TABLE v2_metricas_equipo (
            id INTEGER PRIMARY KEY, equipo_id INTEGER, mantenimiento_id INTEGER,
            horas_uso INTEGER, errores_smart INTEGER, contador_paginas INTEGER,
            salud_bateria REAL, temp_cpu REAL, temp_disco REAL, nivel_polvo TEXT
        )');
        $this->pdo->exec('CREATE TABLE v2_predicciones_ml (
            id INTEGER PRIMARY KEY, equipo_id INTEGER, modelo_version TEXT, score_riesgo REAL,
            nivel_riesgo TEXT, factores_json TEXT, categoria_sugerida_id INTEGER,
            generado_en TEXT DEFAULT CURRENT_TIMESTAMP
        )');
        $this->pdo->exec('CREATE TABLE v2_cronogramas (
            id INTEGER PRIMARY KEY, anio INTEGER, nombre TEXT, notas TEXT,
            creado_en TEXT DEFAULT CURRENT_TIMESTAMP, creado_por INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_cronograma_celdas (
            id INTEGER PRIMARY KEY, cronograma_id INTEGER, area_id INTEGER, fecha TEXT,
            turno TEXT, cantidad INTEGER, hora_inicio TEXT, hora_fin TEXT, creado_por INTEGER
        )');
        $this->pdo->exec('CREATE TABLE v2_cronograma_personal (
            id INTEGER PRIMARY KEY, cronograma_id INTEGER, nro INTEGER, nombre TEXT,
            hora_inicio TEXT, hora_fin TEXT
        )');
        $this->pdo->exec('CREATE TABLE v2_cronograma_horarios (
            id INTEGER PRIMARY KEY, celda_id INTEGER, equipo_id INTEGER, hora_inicio TEXT, hora_fin TEXT
        )');

        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $this->pdo->exec("INSERT INTO v2_gerencias (id, nombre, orden) VALUES (1, 'Administración', 1)");
        $this->pdo->exec("INSERT INTO v2_areas (id, nombre, jefe_encargado, descripcion, gerencia_id)
            VALUES (1, 'Sistemas', 'Ana', 'Piso 2', 1), (2, 'Vacía', 'Luis', '', NULL)");
        $this->pdo->prepare('INSERT INTO v2_usuarios (id, nombre_completo, usuario, password_hash, rol) VALUES (1, ?, ?, ?, ?), (2, ?, ?, ?, ?)')
            ->execute(['Admin Uno', 'admin', $hash, 'Administrador', 'Tecnico Uno', 'tec', $hash, 'Tecnico']);
        $this->pdo->exec("INSERT INTO v2_equipos (
            id, codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo, area_id, estado_operativo, estado_conservacion
        ) VALUES (1, '740000001111', '11', 'Laptop', 'HP', 'X', 1, 'Operativo', 'Bueno')");
        $this->pdo->exec("INSERT INTO v2_categorias_falla (id, nombre, severidad) VALUES (1, 'Disco', 'Alta')");
    }

    private function como(string $rol, int $sub): void
    {
        $token = JWT::encode([
            'sub' => $sub,
            'rol' => $rol,
            'exp' => time() + 3600,
        ], JwtConfig::getSecret(), 'HS256');
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
    }

    private function cuerpo(mixed $data): void
    {
        $GLOBALS['V2_CUERPO_PRUEBA'] = is_string($data) ? $data : json_encode($data);
    }

    private function ruta(string $relativa): array
    {
        return $this->capturar(function () use ($relativa) {
            include __DIR__ . '/../api/v2/' . $relativa;
        });
    }

    private function indice(string $request): array
    {
        $antes = getcwd();
        chdir(dirname(__DIR__) . '/api/v2');
        $_GET['request'] = $request;
        try {
            return $this->capturar(function () {
                include 'index.php';
            });
        } finally {
            chdir($antes);
        }
    }

    private function capturar(callable $accion): array
    {
        http_response_code(200);
        ob_start();
        try {
            $accion();
        } catch (V2Detener $e) {
        } catch (Throwable $e) {
            if (ob_get_level() > 0) {
                ob_end_clean();
            }
            throw $e;
        }
        $raw = ob_get_clean();
        return [
            'code' => http_response_code(),
            'json' => json_decode($raw, true),
            'raw' => $raw,
        ];
    }

    private function excel(array $filas): string
    {
        $ruta = tempnam(sys_get_temp_dir(), 'xlsx');
        $destino = $ruta . '.xlsx';
        rename($ruta, $destino);
        $writer = new Writer();
        $writer->openToFile($destino);
        foreach ($filas as $fila) {
            $writer->addRow(Row::fromValues($fila));
        }
        $writer->close();
        return $destino;
    }
}
