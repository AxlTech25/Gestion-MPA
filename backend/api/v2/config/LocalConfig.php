<?php
/**
 * Configuración local de producción (Hostinger, VPS, etc.).
 * Copie local.example.php → local.php y ajuste los valores.
 * Las variables de entorno del servidor tienen prioridad.
 */
class LocalConfig {
    private static ?array $values = null;

    private static function fileValues(): array {
        if (self::$values === null) {
            $file = __DIR__ . '/local.php';
            self::$values = file_exists($file) ? (require $file) : [];
        }
        return self::$values;
    }

    public static function get(string $key, $default = null) {
        $envKey = strtoupper($key);
        $env = getenv($envKey);
        if ($env !== false && $env !== '') {
            return $env;
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
