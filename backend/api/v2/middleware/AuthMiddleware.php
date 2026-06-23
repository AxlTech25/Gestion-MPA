<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../config/Jwt.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class AuthMiddleware {
    private static function extractBearerToken(): ?string {
        $authHeader = null;

        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            foreach ($headers as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    $authHeader = $value;
                    break;
                }
            }
        }

        if (!$authHeader && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (!$authHeader && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (!$authHeader && !empty($_SERVER['Authorization'])) {
            $authHeader = $_SERVER['Authorization'];
        }

        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    public static function requireAuth(): object {
        $token = self::extractBearerToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Acceso denegado. Token no proporcionado."]);
            exit;
        }

        try {
            return JWT::decode($token, new Key(JwtConfig::getSecret(), 'HS256'));
        } catch (ExpiredException $e) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Sesión expirada. Inicie sesión nuevamente."]);
            exit;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Token inválido."]);
            exit;
        }
    }
}
?>
