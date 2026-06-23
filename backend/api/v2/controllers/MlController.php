<?php
require_once __DIR__ . '/../config/Ml.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Prediccion.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class MlController {
    private $prediccion;

    public function __construct() {
        $database = new Database();
        $this->prediccion = new Prediccion($database->getConnection());
    }

    private function callMlService(string $method, string $path, ?array $body = null): array {
        $url = MlConfig::getServiceUrl() . $path;
        $ch = curl_init($url);

        $headers = ['Content-Type: application/json', 'Accept: application/json'];
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, MlConfig::getTimeoutSeconds());

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            $jsonBody = ($body === null || $body === []) ? '{}' : json_encode($body);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
        }

        $response = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false || $httpCode === 0) {
            return [
                'success' => false,
                'message' => 'Servicio ML no disponible. ' . ($error ?: 'Verifique que FastAPI esté en ejecución.'),
                'data'    => null,
            ];
        }

        $decoded = json_decode($response, true);
        if ($httpCode >= 400) {
            return [
                'success' => false,
                'message' => is_array($decoded) ? ($decoded['detail'] ?? 'Error del servicio ML.') : 'Error del servicio ML.',
                'data'    => null,
            ];
        }

        return ['success' => true, 'data' => $decoded, 'message' => 'OK'];
    }

    private function persistirPrediccion(array $item): void {
        try {
            $this->prediccion->guardar([
                'equipo_id'       => $item['equipo_id'],
                'modelo_version'  => $item['modelo_version'] ?? 'v1',
                'score_riesgo'    => $item['score_riesgo'],
                'nivel_riesgo'    => $item['nivel_riesgo'],
                'factores'        => $item['factores'] ?? [],
            ]);
        } catch (Exception $e) {
            // No interrumpir el flujo si falla una fila individual
        }
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
        $res = $this->callMlService('GET', '/health');
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
        $res = $this->callMlService('POST', '/predict/riesgo', ['equipo_id' => $equipoId]);
        if (!$res['success']) {
            $this->jsonError($res['message']);
            return;
        }

        $this->persistirPrediccion($res['data']);
        $this->jsonOk($res['data'], 'Predicción de riesgo obtenida.');
    }

    public function riesgoInventario() {
        $res = $this->callMlService('POST', '/predict/riesgo/batch', []);
        if (!$res['success']) {
            $this->jsonError($res['message']);
            return;
        }

        foreach ($res['data'] as $item) {
            $this->persistirPrediccion($item);
        }

        $this->jsonOk($res['data'], 'Scores de riesgo del inventario.');
    }

    public function alertas() {
        $res = $this->callMlService('POST', '/predict/riesgo/batch', []);
        if ($res['success'] && is_array($res['data']) && count($res['data']) > 0) {
            usort($res['data'], fn($a, $b) => ($b['score_riesgo'] ?? 0) <=> ($a['score_riesgo'] ?? 0));
            $top = array_slice($res['data'], 0, 10);

            foreach ($top as $item) {
                $this->persistirPrediccion($item);
            }

            $this->jsonOk($top, 'Alertas predictivas.');
            return;
        }

        $cached = $this->prediccion->getAlertas(10);
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

        $res = $this->callMlService('POST', '/predict/categoria', ['equipo_id' => $equipoId]);
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

        $res = $this->callMlService('POST', '/train', []);
        if (!$res['success']) {
            $this->jsonError($res['message']);
            return;
        }

        $this->jsonOk($res['data'], 'Modelo reentrenado correctamente.');
    }
}
?>
