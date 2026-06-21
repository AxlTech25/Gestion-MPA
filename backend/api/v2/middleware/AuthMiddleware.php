<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../config/Jwt.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class AuthMiddleware {
    public static function requireAuth(): object {
        $headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
        $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Acceso denegado. Token no proporcionado."]);
            exit;
        }

        try {
            return JWT::decode($matches[1], new Key(JwtConfig::getSecret(), 'HS256'));
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
