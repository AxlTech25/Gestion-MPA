<?php
require_once __DIR__ . '/../models/Area.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AreaController {
    private $db;
    private $area;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->area = new Area($this->db);
    }

    private function requireAdmin(): object {
        return AuthMiddleware::requireRole('Administrador');
    }

    private function jsonError(string $message, int $status): void {
        http_response_code($status);
        echo json_encode(['success' => false, 'message' => $message]);
    }

    public function index() {
        $stmt = $this->area->getAll();
        $areas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $areas]);
    }

    public function store() {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'));

        if (!empty($data->nombre)) {
            if ($this->area->create($data)) {
                http_response_code(201);
                echo json_encode(['success' => true, 'message' => 'Área creada exitosamente.']);
            } else {
                $this->jsonError('No se pudo crear el área. Verifique que no esté duplicada.', 503);
            }
        } else {
            $this->jsonError('El nombre del área es obligatorio.', 400);
        }
    }

    public function update(int $id): void {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'));
        if (!$data) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }
        $result = $this->area->update($id, $data);
        if (isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        echo json_encode(['success' => true, 'data' => $result, 'message' => 'Área actualizada.']);
    }

    public function destroy(int $id): void {
        $this->requireAdmin();
        $result = $this->area->delete($id);
        if (isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        echo json_encode(['success' => true, 'message' => 'Área eliminada.']);
    }
}
