<?php
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UsuarioController {
    private $db;
    private $usuario;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->usuario = new Usuario($this->db);
    }

    private function requireAdmin(): object {
        return AuthMiddleware::requireRole('Administrador');
    }

    private function rolValido($rol): bool {
        return is_string($rol) && in_array($rol, Usuario::ROLES_VALIDOS, true);
    }

    private function esUltimoAdministrador(int $id): bool {
        $actual = $this->usuario->getById($id);
        if (!$actual || ($actual['rol'] ?? '') !== 'Administrador') {
            return false;
        }
        return $this->usuario->countByRol('Administrador') <= 1;
    }

    private function jsonError(string $message, int $status): void {
        http_response_code($status);
        echo json_encode(["success" => false, "message" => $message]);
    }

    public function index() {
        $stmt = $this->usuario->getAll();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $usuarios]);
    }

    public function show($id) {
        $u = $this->usuario->getById($id);
        if ($u) {
            echo json_encode(["success" => true, "data" => $u]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
        }
    }

    public function store() {
        $this->requireAdmin();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->nombre_completo) && !empty($data->usuario) && !empty($data->password) && !empty($data->rol)) {
            if (!$this->rolValido($data->rol)) {
                $this->jsonError('Rol no válido. Use Administrador, Tecnico o Practicante.', 400);
                return;
            }
            if ($this->usuario->create($data)) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Usuario creado exitosamente."]);
            } else {
                $this->jsonError('No se pudo crear el usuario. Quizás el nombre de usuario ya existe.', 503);
            }
        } else {
            $this->jsonError('Faltan datos obligatorios para el usuario.', 400);
        }
    }

    public function update($id) {
        $this->requireAdmin();
        $data = json_decode(file_get_contents("php://input"));
        if (!$data) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }

        if (isset($data->rol)) {
            if (!$this->rolValido($data->rol)) {
                $this->jsonError('Rol no válido. Use Administrador, Tecnico o Practicante.', 400);
                return;
            }
            if ($data->rol !== 'Administrador' && $this->esUltimoAdministrador((int) $id)) {
                $this->jsonError('No se puede cambiar el rol del último usuario Administrador.', 409);
                return;
            }
        }

        if ($this->usuario->update($id, $data)) {
            echo json_encode(["success" => true, "message" => "Usuario actualizado."]);
        } else {
            $this->jsonError('No se pudo actualizar el usuario.', 503);
        }
    }

    public function delete($id) {
        $actor = $this->requireAdmin();
        $actorId = (int) ($actor->sub ?? 0);
        $targetId = (int) $id;

        if ($actorId === $targetId) {
            $this->jsonError('No puede eliminar su propia cuenta mientras esté autenticado.', 403);
            return;
        }

        if ($this->esUltimoAdministrador($targetId)) {
            $this->jsonError('No se puede eliminar al último usuario con rol Administrador.', 409);
            return;
        }

        if ($this->usuario->delete($targetId)) {
            echo json_encode(["success" => true, "message" => "Usuario eliminado."]);
        } else {
            $this->jsonError('No se pudo eliminar el usuario.', 503);
        }
    }
}
?>
