<?php
require_once __DIR__ . '/../models/Ticket.php';
require_once __DIR__ . '/../models/Gerencia.php';
require_once __DIR__ . '/../models/Area.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../security/TicketThrottle.php';

class TicketController {
    private $db;
    private Ticket $ticket;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->ticket = new Ticket($this->db);
    }

    private function jsonError(string $message, int $status): void {
        http_response_code($status);
        echo json_encode(['success' => false, 'message' => $message]);
    }

    /** Catálogo público: gerencias, áreas y motivos. */
    public function catalogo(): void {
        $gerenciaModel = new Gerencia($this->db);
        $areaModel = new Area($this->db);
        $gerencias = $gerenciaModel->getAll();
        $areasStmt = $areaModel->getAll();
        $areas = $areasStmt->fetchAll(PDO::FETCH_ASSOC);
        $areasPublicas = array_map(static function (array $a): array {
            return [
                'id' => (int) $a['id'],
                'nombre' => $a['nombre'],
                'gerencia_id' => $a['gerencia_id'] !== null ? (int) $a['gerencia_id'] : null,
            ];
        }, $areas);

        echo json_encode([
            'success' => true,
            'data' => [
                'gerencias' => $gerencias,
                'areas' => $areasPublicas,
                'motivos' => Ticket::MOTIVOS,
            ],
        ]);
    }

    /** Crear ticket (público). */
    public function store(): void {
        $data = json_decode(v2CuerpoRaw());
        if (!$data || !is_object($data)) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }

        // Honeypot anti-bots: si viene relleno, fingir éxito
        $hp = trim((string) ($data->empresa_web ?? ''));
        if ($hp !== '') {
            echo json_encode([
                'success' => true,
                'data' => ['codigo' => 'TK-' . date('Y') . '-0000', 'estado' => 'Abierto'],
                'message' => 'Solicitud registrada.',
            ]);
            return;
        }

        $throttle = new TicketThrottle();
        $ip = TicketThrottle::clientIp();
        $check = $throttle->inspect($ip);
        if ($check['blocked']) {
            http_response_code(429);
            header('Retry-After: ' . (int) $check['retry_after']);
            echo json_encode(['success' => false, 'message' => $check['message']]);
            return;
        }

        $result = $this->ticket->create($data, $ip);
        if (isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }

        $throttle->registrar($ip);
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'data' => $result['data'],
            'message' => 'Solicitud registrada. Guarde su código de seguimiento.',
        ]);
    }

    /** Consulta pública por código (datos mínimos). */
    public function consultar(): void {
        $codigo = isset($_GET['codigo']) ? trim((string) $_GET['codigo']) : '';
        if ($codigo === '') {
            $this->jsonError('Indique el código del ticket.', 400);
            return;
        }
        $row = $this->ticket->getByCodigo($codigo);
        if (!$row) {
            $this->jsonError('No se encontró una solicitud con ese código.', 404);
            return;
        }
        echo json_encode(['success' => true, 'data' => $row]);
    }

    /** Lista interna (usuarios autenticados). */
    public function index(): void {
        AuthMiddleware::requireAuth();
        $estado = isset($_GET['estado']) ? trim((string) $_GET['estado']) : null;
        $rows = $this->ticket->getAll($estado);
        echo json_encode(['success' => true, 'data' => $rows]);
    }

    /** Actualizar estado / asignación (Técnico o Admin). */
    public function update(int $id): void {
        $payload = AuthMiddleware::requireRole('Administrador', 'Tecnico');
        $data = json_decode(v2CuerpoRaw());
        if (!$data || !is_object($data)) {
            $this->jsonError('Payload inválido.', 400);
            return;
        }
        $usuarioId = isset($payload->sub) ? (int) $payload->sub : null;
        $result = $this->ticket->updateEstado($id, $data, $usuarioId);
        if (isset($result['error'])) {
            $this->jsonError($result['error'], (int) ($result['status'] ?? 400));
            return;
        }
        echo json_encode([
            'success' => true,
            'data' => $result['data'],
            'message' => 'Ticket actualizado.',
        ]);
    }
}
