<?php
class CorsConfig {
    /** @return list<string> */
    private static function allowedOrigins(): array {
        $env = getenv('CORS_ALLOWED_ORIGINS');
        if ($env) {
            return array_values(array_filter(array_map('trim', explode(',', $env))));
        }

        return [
            'http://localhost:5173',
            'http://localhost',
            'http://127.0.0.1',
        ];
    }

    public static function applyHeaders(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($origin !== '' && in_array($origin, self::allowedOrigins(), true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Vary: Origin');
        }

        header('Content-Type: application/json; charset=UTF-8');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }

    public static function handlePreflight(): bool {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            return true;
        }

        return false;
    }
}
?>
