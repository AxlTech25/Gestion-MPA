<?php
require_once __DIR__ . '/LocalConfig.php';

class MlConfig {
    public static function getServiceUrl(): ?string {
        $url = LocalConfig::get('ml_service_url');

        // Vacío explícito = deshabilitado (producción sin FastAPI)
        if ($url === '') {
            return null;
        }

        if ($url !== null && $url !== '') {
            return rtrim((string) $url, '/');
        }

        return 'http://127.0.0.1:8080';
    }

    public static function isEnabled(): bool {
        return self::getServiceUrl() !== null;
    }

    public static function getTimeoutSeconds(): int {
        // Cold start Serverless en Railway; no superar timeouts típicos del edge (~60s).
        return 45;
    }
}
?>
