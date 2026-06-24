<?php
require_once __DIR__ . '/../config/Ml.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Prediccion.php';

/**
 * Cliente interno del microservicio ML (proxy PHP → FastAPI).
 */
class MlService {
  private Prediccion $prediccion;

  public function __construct(?PDO $conn = null) {
    if ($conn === null) {
      $database = new Database();
      $conn = $database->getConnection();
    }
    $this->prediccion = new Prediccion($conn);
  }

  public function call(string $method, string $path, ?array $body = null): array {
    $baseUrl = MlConfig::getServiceUrl();
    if ($baseUrl === null) {
      return [
        'success' => false,
        'message' => 'Servicio ML no configurado en este servidor.',
        'data'    => null,
      ];
    }

    $url = $baseUrl . $path;
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

  public function persistirPrediccion(array $item): void {
    try {
      $this->prediccion->guardar([
        'equipo_id'      => $item['equipo_id'],
        'modelo_version' => $item['modelo_version'] ?? 'v1',
        'score_riesgo'   => $item['score_riesgo'],
        'nivel_riesgo'   => $item['nivel_riesgo'],
        'factores'       => $item['factores'] ?? [],
      ]);
    } catch (Exception $e) {
      error_log('MlService persistirPrediccion: ' . $e->getMessage());
    }
  }

  /** Recalcula y persiste el riesgo de un equipo (HU-ML-006). */
  public function recalcularEquipo(int $equipoId): bool {
    $res = $this->call('POST', '/predict/riesgo', ['equipo_id' => $equipoId]);
    if (!$res['success'] || !is_array($res['data'])) {
      return false;
    }
    $this->persistirPrediccion($res['data']);
    return true;
  }
}
