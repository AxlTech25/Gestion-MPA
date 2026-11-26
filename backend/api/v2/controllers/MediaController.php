<?php
/**
 * Sirve archivos públicos de uploads (p. ej. fotos de ficha técnica).
 * No requiere JWT: las <img> del front no envían Authorization.
 */
class MediaController {
    public function fichaImagen(string $fileName): void {
        $safe = basename($fileName);
        if ($safe === '' || $safe !== $fileName || preg_match('/\.\./', $fileName)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Imagen no encontrada.']);
            return;
        }

        $uploadDir = realpath(__DIR__ . '/../../../uploads/fichas_tecnicas');
        if (!$uploadDir) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Directorio de imágenes no disponible.']);
            return;
        }

        $path = realpath($uploadDir . DIRECTORY_SEPARATOR . $safe);
        if (!$path || strpos($path, $uploadDir) !== 0 || !is_file($path)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Imagen no encontrada.']);
            return;
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $mimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
        ];
        if (!isset($mimes[$ext])) {
            http_response_code(415);
            echo json_encode(['success' => false, 'message' => 'Tipo de archivo no permitido.']);
            return;
        }

        header_remove('Content-Type');
        header('Content-Type: ' . $mimes[$ext]);
        header('Cache-Control: public, max-age=86400');
        header('Content-Length: ' . (string) filesize($path));
        readfile($path);
    }
}
