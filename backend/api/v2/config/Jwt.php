<?php
class JwtConfig {
    public static function getSecret(): string {
        $secret = getenv('JWT_SECRET');
        if ($secret) {
            return $secret;
        }
        return 'gestion_mpa_dev_secret_cambiar_en_produccion';
    }

    public static function getExpirationSeconds(): int {
        return 8 * 3600;
    }
}
?>
