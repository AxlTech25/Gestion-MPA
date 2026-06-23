<?php
class MlConfig {
    public static function getServiceUrl(): string {
        $env = getenv('ML_SERVICE_URL');
        if ($env) {
            return rtrim($env, '/');
        }
        return 'http://127.0.0.1:8000';
    }

    public static function getTimeoutSeconds(): int {
        return 90;
    }
}
?>
