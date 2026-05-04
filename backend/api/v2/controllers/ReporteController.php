<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../config/Database.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class ReporteController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function ficha_tecnica($equipo_id) {
        // Consultar toda la información del equipo
        $query = "SELECT e.*, a.nombre as area_nombre, u.nombre_completo as responsable,
                         ft.procesador, ft.sistema_operativo, ft.licencia_so, ft.mac_address, ft.ip_asignada
                  FROM v2_equipos e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
                  LEFT JOIN v2_usuarios u ON e.responsable_id = u.id
                  LEFT JOIN v2_fichas_tecnicas ft ON e.id = ft.equipo_id
                  WHERE e.id = :id LIMIT 1";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $equipo_id);
        $stmt->execute();
        
        if ($stmt->rowCount() == 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Equipo no encontrado"]);
            return;
        }

        $equipo = $stmt->fetch(PDO::FETCH_ASSOC);

        // Crear plantilla HTML
        $html = '
        <html>
        <head>
            <style>
                body { font-family: "Helvetica", sans-serif; font-size: 14px; color: #333; }
                h1 { color: #1e3a8a; text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f1f5f9; width: 35%; color: #475569; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
            </style>
        </head>
        <body>
            <h1>Ficha Técnica de Equipo</h1>
            
            <h3>Información General</h3>
            <table>
                <tr><th>Código Patrimonial</th><td>' . htmlspecialchars($equipo['codigo_patrimonial'] ?? '') . '</td></tr>
                <tr><th>Tipo de Equipo</th><td>' . htmlspecialchars($equipo['tipo_equipo'] ?? '') . '</td></tr>
                <tr><th>Marca / Modelo</th><td>' . htmlspecialchars(($equipo['marca'] ?? '') . ' / ' . ($equipo['modelo'] ?? '')) . '</td></tr>
                <tr><th>Número de Serie</th><td>' . htmlspecialchars($equipo['numero_serie'] ?? '') . '</td></tr>
                <tr><th>Área Asignada</th><td>' . htmlspecialchars($equipo['area_nombre'] ?? '') . '</td></tr>
                <tr><th>Responsable</th><td>' . htmlspecialchars($equipo['responsable'] ?? '') . '</td></tr>
            </table>

            <h3>Especificaciones de Hardware y Software</h3>
            <table>
                <tr><th>Procesador</th><td>' . htmlspecialchars($equipo['procesador'] ?? 'N/A') . '</td></tr>
                <tr><th>Memoria RAM</th><td>' . htmlspecialchars(($equipo['ram_gb'] ?? '0') . ' GB') . '</td></tr>
                <tr><th>Almacenamiento</th><td>' . htmlspecialchars(($equipo['almacenamiento_gb'] ?? '0') . ' GB ' . ($equipo['tipo_disco'] ?? '')) . '</td></tr>
                <tr><th>Sistema Operativo</th><td>' . htmlspecialchars($equipo['sistema_operativo'] ?? 'N/A') . '</td></tr>
                <tr><th>Licencia SO</th><td>' . htmlspecialchars($equipo['licencia_so'] ?? 'N/A') . '</td></tr>
                <tr><th>Dirección IP</th><td>' . htmlspecialchars($equipo['ip_asignada'] ?? 'DHCP') . '</td></tr>
            </table>

            <div class="footer">
                Documento generado automáticamente por el Sistema de Gestión de Equipos MPA V2. <br>
                Fecha de emisión: ' . date('d/m/Y H:i') . '
            </div>
        </body>
        </html>
        ';

        // Configurar Dompdf
        $options = new Options();
        $options->set('defaultFont', 'Helvetica');
        $options->set('isHtml5ParserEnabled', true);
        
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // Enviar al navegador
        $dompdf->stream("ficha_tecnica_" . $equipo['codigo_patrimonial'] . ".pdf", ["Attachment" => false]);
    }
}
?>
