<?php
require_once __DIR__ . '/LocalConfig.php';

class JwtConfig {
    public static function getSecret(): string {
        return LocalConfig::get('jwt_secret', 'gestion_mpa_dev_secret_cambiar_en_produccion');
    }

    public static function getExpirationSeconds(): int {
        return 8 * 3600;
    }
}
?>
