<?php
require_once __DIR__ . '/../config/LocalConfig.php';

/**
 * Limita envíos de tickets públicos por IP para reducir spam.
 */
class TicketThrottle {
    private string $dir;
    private int $maxIntentos;
    private int $ventanaSegundos;

    public function __construct(?string $dir = null, ?int $maxIntentos = null, ?int $ventanaSegundos = null) {
        $this->dir = $dir ?? (string) LocalConfig::get(
            'ticket_throttle_dir',
            dirname(__DIR__, 3) . '/storage/ticket_throttle'
        );
        $this->maxIntentos = $maxIntentos
            ?? (int) LocalConfig::get('ticket_max_per_window', 8);
        $this->ventanaSegundos = $ventanaSegundos
            ?? (int) LocalConfig::get('ticket_window_seconds', 900);

        if ($this->maxIntentos < 1) {
            $this->maxIntentos = 8;
        }
        if ($this->ventanaSegundos < 60) {
            $this->ventanaSegundos = 900;
        }
    }

    public static function clientIp(): string {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $ip = is_string($ip) ? trim($ip) : '';
        if ($ip === '' || !filter_var($ip, FILTER_VALIDATE_IP)) {
            return 'desconocida';
        }
        return $ip;
    }

    /**
     * @return array{blocked:bool, retry_after:int, message:?string}
     */
    public function inspect(string $ip): array {
        $ahora = time();
        $clave = $this->clave($ip);
        $estado = $this->leer($clave);
        if ($estado['count'] >= $this->maxIntentos) {
            $restante = max(0, ($estado['first'] + $this->ventanaSegundos) - $ahora);
            if ($restante > 0) {
                $mins = (int) ceil($restante / 60);
                return [
                    'blocked' => true,
                    'retry_after' => $restante,
                    'message' => "Demasiadas solicitudes. Intente de nuevo en {$mins} minuto(s).",
                ];
            }
            $this->borrar($clave);
        }
        return ['blocked' => false, 'retry_after' => 0, 'message' => null];
    }

    public function registrar(string $ip): void {
        $ahora = time();
        $clave = $this->clave($ip);
        $estado = $this->leer($clave);
        if ($estado['count'] === 0 || ($ahora - $estado['first']) > $this->ventanaSegundos) {
            $estado = ['count' => 1, 'first' => $ahora];
        } else {
            $estado['count']++;
        }
        $this->guardar($clave, $estado);
    }

    private function clave(string $ip): string {
        return 'ticket_' . hash('sha256', $ip);
    }

    /** @return array{count:int, first:int} */
    private function leer(string $clave): array {
        if (!empty($GLOBALS['V2_SIN_EXIT'])) {
            $mem = $GLOBALS['V2_TICKET_THROTTLE'][$clave] ?? null;
            if (is_array($mem)) {
                return ['count' => (int) ($mem['count'] ?? 0), 'first' => (int) ($mem['first'] ?? 0)];
            }
            return ['count' => 0, 'first' => 0];
        }
        $path = $this->path($clave);
        if (!is_file($path)) {
            return ['count' => 0, 'first' => 0];
        }
        $raw = @file_get_contents($path);
        $data = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($data)) {
            return ['count' => 0, 'first' => 0];
        }
        return ['count' => (int) ($data['count'] ?? 0), 'first' => (int) ($data['first'] ?? 0)];
    }

    /** @param array{count:int, first:int} $estado */
    private function guardar(string $clave, array $estado): void {
        if (!empty($GLOBALS['V2_SIN_EXIT'])) {
            if (!isset($GLOBALS['V2_TICKET_THROTTLE']) || !is_array($GLOBALS['V2_TICKET_THROTTLE'])) {
                $GLOBALS['V2_TICKET_THROTTLE'] = [];
            }
            $GLOBALS['V2_TICKET_THROTTLE'][$clave] = $estado;
            return;
        }
        if (!is_dir($this->dir)) {
            @mkdir($this->dir, 0755, true);
        }
        @file_put_contents($this->path($clave), json_encode($estado), LOCK_EX);
    }

    private function borrar(string $clave): void {
        if (!empty($GLOBALS['V2_SIN_EXIT'])) {
            unset($GLOBALS['V2_TICKET_THROTTLE'][$clave]);
            return;
        }
        $path = $this->path($clave);
        if (is_file($path)) {
            @unlink($path);
        }
    }

    private function path(string $clave): string {
        return rtrim($this->dir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $clave . '.json';
    }
}
