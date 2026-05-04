<?php
class AuthMiddleware {
    public static function validateToken() {
        // En PHP a veces apache_request_headers() no extrae Authorization dependiendo de la config
        $headers = apache_request_headers();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;
        
        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (!$authHeader) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Acceso denegado. Token no proporcionado."]);
            exit;
        }

        $token = str_replace("Bearer ", "", $authHeader);
        
        // TODO: Implementar decodificación JWT aquí
        // try { $decoded = JWT::decode($token, ...); return $decoded; } ...

        // Por ahora simulamos que es válido
        return true;
    }
}
?>
