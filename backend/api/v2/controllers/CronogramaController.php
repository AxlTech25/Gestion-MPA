<?php
require_once __DIR__ . '/../models/Cronograma.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CronogramaController {
    private $cronograma;

    public function __construct() {
        $database = new Database();
        $this->cronograma = new Cronograma($database->getConnection());
    }

    private function jsonError(string $message, int $status): void {
        http_response_code($status);
        echo json_encode(["success" => false, "message" => $message]);
    }

    private function usuarioId(): ?int {
        $payload = AuthMiddleware::requireAuth();
        return isset($payload->sub) ? (int) $payload->sub : null;
    }

    private function requireEscritura(): object {
        return AuthMiddleware::requireRole('Administrador', 'Tecnico');
    }

    public function index() {
        $anio = isset($_GET['anio']) && $_GET['anio'] !== '' ? (int) $_GET['anio'] : null;
        if ($anio !== null && ($anio < 2000 || $anio > 2100)) {
            $this->jsonError('Año inválido.', 400);
            return;
        }
        echo json_encode(["success" => true, "data" => $this->cronograma->listar($anio)]);
    }

    public function show(int $id) {
        $data = $this->cronograma->getMatriz($id);
        if (!$data) {
            $this->jsonError('Cronograma no encontrado.', 404);
            return;
        }
        echo json_encode(["success" => true, "data" => $data]);
    }

    public function store() {
        $this->requireEscritura();
        $data = json_decode(file_get_contents("php://input"));
        if (!$data) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }
        $result = $this->cronograma->crear($data, $this->usuarioId());
        if (is_array($result) && isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        if ($result) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Cronograma registrado.",
                "data" => ["id" => $result],
            ]);
            return;
        }
        $this->jsonError('No se pudo registrar el cronograma.', 503);
    }

    public function destroy(int $id) {
        $this->requireEscritura();
        $result = $this->cronograma->eliminar($id);
        if (is_array($result) && isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        if ($result) {
            echo json_encode(["success" => true, "message" => "Cronograma eliminado."]);
            return;
        }
        $this->jsonError('No se pudo eliminar el cronograma.', 503);
    }

    public function cobertura(int $id) {
        $data = $this->cronograma->cobertura($id);
        if ($data === null) {
            $this->jsonError('Cronograma no encontrado.', 404);
            return;
        }
        echo json_encode(["success" => true, "data" => $data]);
    }

    public function storeCelda(int $id) {
        $this->requireEscritura();
        $data = json_decode(file_get_contents("php://input"));
        if (!$data) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }
        $result = $this->cronograma->crearCelda($id, $data, $this->usuarioId());
        if (is_array($result) && isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        if (is_array($result) && !empty($result['liberada'])) {
            echo json_encode(["success" => true, "message" => "Visita liberada."]);
            return;
        }
        if ($result) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Visita programada.",
                "data" => ["id" => $result],
            ]);
            return;
        }
        $this->jsonError('No se pudo programar la visita.', 503);
    }

    public function destroyCelda(int $id, int $celdaId) {
        $this->requireEscritura();
        $result = $this->cronograma->eliminarCelda($id, $celdaId);
        if (is_array($result) && isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        echo json_encode(["success" => true, "message" => "Visita liberada."]);
    }

    public function storeHorarios(int $id, int $celdaId) {
        $this->requireEscritura();
        $data = json_decode(file_get_contents("php://input"));
        if (!$data) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }
        $items = $data->horarios ?? null;
        if ($items === null) {
            $this->jsonError('Falta la lista de horarios.', 400);
            return;
        }
        $result = $this->cronograma->guardarHorarios($id, $celdaId, $items);
        if (is_array($result) && isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        if ($result === false) {
            $this->jsonError('No se pudieron guardar los horarios.', 503);
            return;
        }
        echo json_encode(["success" => true, "message" => "Horarios actualizados.", "data" => $result]);
    }

    public function storePersonal(int $id) {
        $this->requireEscritura();
        $data = json_decode(file_get_contents("php://input"));
        if (!$data) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }
        $items = $data->personal ?? null;
        if ($items === null) {
            $this->jsonError('Falta la lista de personal.', 400);
            return;
        }
        $result = $this->cronograma->guardarPersonal($id, $items);
        if (is_array($result) && isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        if ($result === false) {
            $this->jsonError('No se pudo guardar el equipo de trabajo.', 503);
            return;
        }
        echo json_encode(["success" => true, "message" => "Equipo de trabajo actualizado.", "data" => $result]);
    }
}
