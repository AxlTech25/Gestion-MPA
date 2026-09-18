<?php

use PHPUnit\Framework\TestCase;

final class AuthMiddlewareTest extends TestCase
{
    public function test_tiene_rol_administrador(): void
    {
        $payload = (object) ['rol' => 'Administrador', 'sub' => 1];
        $this->assertTrue(AuthMiddleware::tieneRol($payload, 'Administrador'));
        $this->assertFalse(AuthMiddleware::tieneRol($payload, 'Tecnico', 'Practicante'));
    }

    public function test_tecnico_no_tiene_rol_administrador(): void
    {
        $payload = (object) ['rol' => 'Tecnico', 'sub' => 2];
        $this->assertFalse(AuthMiddleware::tieneRol($payload, 'Administrador'));
        $this->assertTrue(AuthMiddleware::tieneRol($payload, 'Tecnico', 'Practicante'));
    }

    public function test_payload_sin_rol_es_denegado(): void
    {
        $payload = (object) ['sub' => 9];
        $this->assertFalse(AuthMiddleware::tieneRol($payload, 'Administrador'));
    }
}
