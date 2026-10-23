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

    public function test_alta_consulta_actualizacion_y_baja(): void
    {
        $this->assertTrue($this->usuario->create((object) [
            'nombre_completo' => 'Nueva',
            'usuario' => 'nueva',
            'password' => 'secreto',
            'rol' => 'Tecnico',
        ]));
        $lista = $this->usuario->getAll()->fetchAll(PDO::FETCH_ASSOC);
        $this->assertCount(4, $lista);

        $row = $this->usuario->getById(2);
        $this->assertSame('tec', $row['usuario']);
        $this->assertFalse($this->usuario->getById(99));

        $this->assertFalse($this->usuario->update(2, (object) []));
        $this->assertTrue($this->usuario->update(2, (object) [
            'nombre_completo' => 'Tecnico Dos',
            'usuario' => 'tec2',
            'rol' => 'Practicante',
            'area_id' => 1,
            'password' => 'otra',
        ]));
        $this->assertSame('tec2', $this->usuario->getById(2)['usuario']);
        $this->assertTrue($this->usuario->delete(2));
        $this->assertFalse($this->usuario->getById(2));
    }
}
