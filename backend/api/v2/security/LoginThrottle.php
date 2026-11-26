<?php
require_once __DIR__ . '/../config/LocalConfig.php';

/**
 * Limita intentos de login por IP y por usuario para frenar fuerza bruta.
 * En pruebas (V2_SIN_EXIT) usa memoria; en producción, archivos bajo storage/.
 */
class LoginThrottle {
    private string $dir;
    private int $maxIntentos;
    private int $ventanaSegundos;

    public function __construct(?string $dir = null, ?int $maxIntentos = null, ?int $ventanaSegundos = null) {
        $this->dir = $dir ?? (string) LocalConfig::get(
            'login_throttle_dir',
            dirname(__DIR__, 3) . '/storage/login_throttle'
        );
        $this->maxIntentos = $maxIntentos
            ?? (int) LocalConfig::get('login_max_attempts', 5);
        $this->ventanaSegundos = $ventanaSegundos
            ?? (int) LocalConfig::get('login_lockout_seconds', 900);

        if ($this->maxIntentos < 1) {
            $this->maxIntentos = 5;
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
    public function inspect(string $usuario, string $ip): array {
        $ahora = time();
        $claves = $this->claves($usuario, $ip);
        $peor = 0;
        foreach ($claves as $clave) {
            $estado = $this->leer($clave);
            if ($estado['count'] >= $this->maxIntentos) {
                $restante = max(0, ($estado['first'] + $this->ventanaSegundos) - $ahora);
                if ($restante > 0) {
                    $peor = max($peor, $restante);
                } else {
                    $this->borrar($clave);
                }
            }
        }
        if ($peor > 0) {
            $mins = (int) ceil($peor / 60);
            return [
                'blocked' => true,
                'retry_after' => $peor,
                'message' => "Demasiados intentos fallidos. Intente de nuevo en {$mins} minuto(s).",
            ];
        }
        return ['blocked' => false, 'retry_after' => 0, 'message' => null];
    }

    public function registrarFallo(string $usuario, string $ip): void {
        $ahora = time();
        foreach ($this->claves($usuario, $ip) as $clave) {
            $estado = $this->leer($clave);
            if ($estado['count'] === 0 || ($ahora - $estado['first']) > $this->ventanaSegundos) {
                $estado = ['count' => 1, 'first' => $ahora];
            } else {
                $estado['count']++;
            }
            $this->guardar($clave, $estado);
        }
    }

    public function limpiar(string $usuario, string $ip): void {
        foreach ($this->claves($usuario, $ip) as $clave) {
            $this->borrar($clave);
        }
    }

    /** @return list<string> */
    private function claves(string $usuario, string $ip): array {
        $u = strtolower(trim($usuario));
        return [
            'ip:' . hash('sha256', $ip),
            'user:' . hash('sha256', $u . '|' . $ip),
        ];
    }

    /** @return array{count:int, first:int} */
    private function leer(string $clave): array {
        if ($this->enMemoria()) {
            return $GLOBALS['V2_LOGIN_THROTTLE'][$clave] ?? ['count' => 0, 'first' => 0];
        }
        $path = $this->ruta($clave);
        if (!is_file($path)) {
            return ['count' => 0, 'first' => 0];
        }
        $raw = @file_get_contents($path);
        $data = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($data)) {
            return ['count' => 0, 'first' => 0];
        }
        return [
            'count' => (int) ($data['count'] ?? 0),
            'first' => (int) ($data['first'] ?? 0),
        ];
    }

    /** @param array{count:int, first:int} $estado */
    private function guardar(string $clave, array $estado): void {
        if ($this->enMemoria()) {
            if (!isset($GLOBALS['V2_LOGIN_THROTTLE']) || !is_array($GLOBALS['V2_LOGIN_THROTTLE'])) {
                $GLOBALS['V2_LOGIN_THROTTLE'] = [];
            }
            $GLOBALS['V2_LOGIN_THROTTLE'][$clave] = $estado;
            return;
        }
        if (!is_dir($this->dir) && !@mkdir($this->dir, 0750, true) && !is_dir($this->dir)) {
            error_log('LoginThrottle: no se pudo crear ' . $this->dir);
            return;
        }
        $json = json_encode($estado);
        if ($json === false) {
            return;
        }
        @file_put_contents($this->ruta($clave), $json, LOCK_EX);
    }

    private function borrar(string $clave): void {
        if ($this->enMemoria()) {
            unset($GLOBALS['V2_LOGIN_THROTTLE'][$clave]);
            return;
        }
        $path = $this->ruta($clave);
        if (is_file($path)) {
            @unlink($path);
        }
    }

    private function ruta(string $clave): string {
        $seguro = preg_replace('/[^a-zA-Z0-9_-]/', '_', $clave) ?? 'x';
        return rtrim($this->dir, '/\\') . DIRECTORY_SEPARATOR . $seguro . '.json';
    }

    private function enMemoria(): bool {
        return !empty($GLOBALS['V2_SIN_EXIT']);
    }
}
