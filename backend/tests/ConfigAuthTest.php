<?php

use Firebase\JWT\JWT;
use PHPUnit\Framework\TestCase;

final class ConfigAuthTest extends TestCase
{
    protected function tearDown(): void
    {
        putenv('ML_SERVICE_URL');
        putenv('CORS_ORIGINS');
        unset($_SERVER['HTTP_ORIGIN'], $_SERVER['REQUEST_METHOD'], $_SERVER['HTTP_AUTHORIZATION'], $_SERVER['REDIRECT_HTTP_AUTHORIZATION'], $_SERVER['Authorization']);
    }

    private function valores(array $values): void
    {
        $prop = new ReflectionProperty(LocalConfig::class, 'values');
        $prop->setValue(null, $values);
    }

    public function test_local_config_prioriza_entorno_y_listas(): void
    {
        $this->valores(['db_host' => 'desde-archivo', 'cors_origins' => ['http://a.test']]);
        putenv('DB_HOST=desde-env');
        $this->assertSame('desde-env', LocalConfig::get('db_host', 'x'));
        putenv('DB_HOST');
        $this->assertSame('desde-archivo', LocalConfig::get('db_host', 'x'));
        $this->assertSame('defecto', LocalConfig::get('no_existe', 'defecto'));

        $this->assertSame(['http://a.test'], LocalConfig::getList('cors_origins', ['http://z']));
        $this->valores(['cors_origins' => ' http://b.test , , http://c.test ']);
        $this->assertSame(['http://b.test', 'http://c.test'], LocalConfig::getList('cors_origins'));
        $this->valores([]);
        $this->assertSame(['http://z'], LocalConfig::getList('cors_origins', ['http://z']));
    }

    public function test_jwt_y_ml(): void
    {
        $this->assertNotSame('', JwtConfig::getSecret());
        $this->assertSame(8 * 3600, JwtConfig::getExpirationSeconds());

        $this->valores(['ml_service_url' => '']);
        $this->assertNull(MlConfig::getServiceUrl());
        $this->assertFalse(MlConfig::isEnabled());

        $this->valores(['ml_service_url' => 'http://ml.test/']);
        $this->assertSame('http://ml.test', MlConfig::getServiceUrl());
        $this->assertTrue(MlConfig::isEnabled());

        $this->valores([]);
        putenv('ML_SERVICE_URL');
        $this->assertSame('http://127.0.0.1:8000', MlConfig::getServiceUrl());
        $this->assertSame(90, MlConfig::getTimeoutSeconds());
    }

    public function test_cors_permite_origen_y_preflight(): void
    {
        $this->valores(['cors_origins' => 'http://localhost:5173']);
        $_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';
        $_SERVER['REQUEST_METHOD'] = 'GET';
        CorsConfig::applyHeaders();
        $this->assertFalse(CorsConfig::handlePreflight());

        $_SERVER['HTTP_ORIGIN'] = 'http://otro.test';
        $_SERVER['REQUEST_METHOD'] = 'OPTIONS';
        CorsConfig::applyHeaders();
        $this->assertTrue(CorsConfig::handlePreflight());

        $this->valores([]);
        $origenes = (new ReflectionMethod(CorsConfig::class, 'allowedOrigins'))->invoke(null);
        $this->assertContains('http://localhost:5173', $origenes);
    }

    public function test_extrae_el_token_y_acepta_un_jwt_valido(): void
    {
        $extraer = new ReflectionMethod(AuthMiddleware::class, 'extractBearerToken');
        unset($_SERVER['HTTP_AUTHORIZATION'], $_SERVER['REDIRECT_HTTP_AUTHORIZATION'], $_SERVER['Authorization']);
        $this->assertNull($extraer->invoke(null));

        $_SERVER['Authorization'] = 'Bearer directo';
        $this->assertSame('directo', $extraer->invoke(null));
        unset($_SERVER['Authorization']);

        $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] = 'Bearer redirigido';
        $this->assertSame('redirigido', $extraer->invoke(null));
        unset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);

        $_SERVER['HTTP_AUTHORIZATION'] = 'Basic abc';
        $this->assertNull($extraer->invoke(null));

        $token = JWT::encode([
            'sub' => 1,
            'rol' => 'Administrador',
            'exp' => time() + 3600,
        ], JwtConfig::getSecret(), 'HS256');
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
        $payload = AuthMiddleware::requireRole('Administrador');
        $this->assertSame('Administrador', $payload->rol);
    }
}
