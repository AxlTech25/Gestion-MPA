<?php

use PHPUnit\Framework\TestCase;

final class UsuarioTest extends TestCase
{
    private PDO $pdo;
    private Usuario $usuario;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec("
            CREATE TABLE v2_usuarios (
                id INTEGER PRIMARY KEY,
                nombre_completo TEXT,
                usuario TEXT,
                password_hash TEXT,
                rol TEXT,
                area_id INTEGER
            )
        ");
        $this->pdo->exec("
            INSERT INTO v2_usuarios (id, nombre_completo, usuario, password_hash, rol) VALUES
            (1, 'Admin Uno', 'admin', 'hash', 'Administrador'),
            (2, 'Tecnico Uno', 'tec', 'hash', 'Tecnico'),
            (3, 'Practicante Uno', 'prac', 'hash', 'Practicante')
        ");
        $this->usuario = new Usuario($this->pdo);
    }

    public function test_count_by_rol_administradores(): void
    {
        $this->assertSame(1, $this->usuario->countByRol('Administrador'));
        $this->assertSame(1, $this->usuario->countByRol('Tecnico'));
        $this->assertSame(0, $this->usuario->countByRol('Inexistente'));
    }

    public function test_roles_validos_incluye_los_tres_del_enum(): void
    {
        $this->assertSame(
            ['Administrador', 'Tecnico', 'Practicante'],
            Usuario::ROLES_VALIDOS
        );
    }
}
