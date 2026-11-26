<?php
/**
 * Configuración local (desarrollo o producción).
 * Copie local.example.php → local.php y ajuste los valores.
 * Las variables de entorno del servidor tienen prioridad.
 * En Railway también se leen MYSQLHOST / MYSQLPORT / MYSQLUSER / etc.
 */
class LocalConfig {
    private static ?array $values = null;

    /** @return list<string> */
    private static function envKeysFor(string $key): array {
        $aliases = [
            'db_host' => ['DB_HOST', 'MYSQLHOST', 'MYSQL_HOST'],
            'db_port' => ['DB_PORT', 'MYSQLPORT', 'MYSQL_PORT'],
            'db_name' => ['DB_NAME', 'MYSQLDATABASE', 'MYSQL_DATABASE'],
            'db_user' => ['DB_USER', 'MYSQLUSER', 'MYSQL_USER'],
            'db_pass' => ['DB_PASS', 'MYSQLPASSWORD', 'MYSQL_PASSWORD'],
        ];
        if (isset($aliases[$key])) {
            return $aliases[$key];
        }
        return [strtoupper($key)];
    }

    private static function fileValues(): array {
        if (self::$values === null) {
            $file = __DIR__ . '/local.php';
            $cargado = file_exists($file) ? (require_once $file) : [];
            self::$values = is_array($cargado) ? $cargado : [];
        }
        return self::$values;
    }

    public static function get(string $key, $default = null) {
        foreach (self::envKeysFor($key) as $envKey) {
            $env = getenv($envKey);
            if ($env !== false && $env !== '') {
                return $env;
            }
        }

        return self::fileValues()[$key] ?? $default;
    }

    /** @return list<string> */
    public static function getList(string $key, array $default = []): array {
        $raw = self::get($key);
        if ($raw === null || $raw === '') {
            return $default;
        }
        if (is_array($raw)) {
            return $raw;
        }
        return array_values(array_filter(array_map('trim', explode(',', (string) $raw))));
    }
}
