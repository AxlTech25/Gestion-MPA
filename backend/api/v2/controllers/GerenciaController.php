<?php
require_once __DIR__ . '/../models/Gerencia.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class GerenciaController {
    private $gerencia;

    public function __construct() {
        $database = new Database();
        $this->gerencia = new Gerencia($database->getConnection());
    }

    private function requireAdmin(): object {
        return AuthMiddleware::requireRole('Administrador');
    }

    private function jsonError(string $message, int $status): void {
        http_response_code($status);
        echo json_encode(['success' => false, 'message' => $message]);
    }

    public function index(): void {
        echo json_encode(['success' => true, 'data' => $this->gerencia->getAll()]);
    }

    public function store(): void {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'));
        $result = $this->gerencia->create($data ?: (object) []);
        if (isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        http_response_code(201);
        echo json_encode(['success' => true, 'data' => $result, 'message' => 'Gerencia creada.']);
    }

    public function update(int $id): void {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'));
        $result = $this->gerencia->update($id, $data ?: (object) []);
        if (isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        echo json_encode(['success' => true, 'data' => $result, 'message' => 'Gerencia actualizada.']);
    }

    public function destroy(int $id): void {
        $this->requireAdmin();
        $result = $this->gerencia->delete($id);
        if (isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        echo json_encode(['success' => true, 'message' => 'Gerencia eliminada. Las áreas quedan sin gerencia.']);
    }
}
