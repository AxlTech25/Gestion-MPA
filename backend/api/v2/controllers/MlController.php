<?php
require_once __DIR__ . '/../services/MlService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class MlController {
    private MlService $ml;

    public function __construct() {
        $this->ml = new MlService();
    }

    private function jsonOk(array $data, string $message): void {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data'    => $data,
            'message' => $message,
        ]);
    }

    private function jsonError(string $message, int $code = 503): void {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'data'    => null,
        ]);
    }

    public function status() {
        $res = $this->ml->call('GET', '/health');
        if (!$res['success']) {
            $this->jsonOk([
                'status'            => 'offline',
                'modelo_disponible' => false,
                'modelo_version'    => null,
            ], $res['message']);
            return;
        }

        $this->jsonOk($res['data'], 'Estado del servicio ML.');
    }

    public function riesgoEquipo(int $equipoId) {
        $res = $this->ml->call('POST', '/predict/riesgo', ['equipo_id' => $equipoId]);
        if (!$res['success']) {
            $this->jsonError($res['message']);
            return;
        }

        $this->ml->persistirPrediccion($res['data']);
        $this->jsonOk($res['data'], 'Predicción de riesgo obtenida.');
    }

    public function riesgoInventario() {
        $res = $this->ml->call('POST', '/predict/riesgo/batch', []);
        if (!$res['success']) {
            $this->jsonError($res['message']);
            return;
        }

        foreach ($res['data'] as $item) {
            $this->ml->persistirPrediccion($item);
        }

        $this->jsonOk($res['data'], 'Scores de riesgo del inventario.');
    }

    public function alertas() {
        require_once __DIR__ . '/../config/Database.php';
        require_once __DIR__ . '/../models/Prediccion.php';

        $res = $this->ml->call('POST', '/predict/riesgo/batch', []);
        if ($res['success'] && is_array($res['data']) && count($res['data']) > 0) {
            usort($res['data'], fn($a, $b) => ($b['score_riesgo'] ?? 0) <=> ($a['score_riesgo'] ?? 0));
            $top = array_slice($res['data'], 0, 10);

            foreach ($top as $item) {
                $this->ml->persistirPrediccion($item);
            }

            $this->jsonOk($top, 'Alertas predictivas.');
            return;
        }

        $database = new Database();
        $prediccion = new Prediccion($database->getConnection());
        $cached = $prediccion->getAlertas(10);
        $this->jsonOk($cached, $res['success'] === false
            ? 'Alertas desde caché (servicio ML offline).'
            : 'Alertas predictivas (caché).');
    }

    public function predictCategoria() {
        $input = json_decode(file_get_contents('php://input'), true);
        $equipoId = (int) ($input['equipo_id'] ?? 0);

        if ($equipoId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'equipo_id es obligatorio.']);
            return;
        }

        $res = $this->ml->call('POST', '/predict/categoria', ['equipo_id' => $equipoId]);
        if (!$res['success']) {
            $this->jsonError($res['message']);
            return;
        }

        $this->jsonOk($res['data'], 'Sugerencias de categoría obtenidas.');
    }

    public function train() {
        $payload = AuthMiddleware::requireAuth();
        if (($payload->rol ?? '') !== 'Administrador') {
            $this->jsonError('Solo administradores pueden reentrenar el modelo.', 403);
            return;
        }

        $res = $this->ml->call('POST', '/train', []);
        if (!$res['success']) {
            $this->jsonError($res['message']);
            return;
        }

        $this->jsonOk($res['data'], 'Modelo reentrenado correctamente.');
    }
}
