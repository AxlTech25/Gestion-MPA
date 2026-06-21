<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../config/Database.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class ReporteController {
    private $db;

    // Tipos que requieren especificaciones técnicas
    private $technical_types = ['cpu', 'laptop', 'pc'];

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    private function isTechnical($tipo) {
        $tipo_lower = strtolower(trim($tipo ?? ''));
        foreach ($this->technical_types as $t) {
            if (strpos($tipo_lower, $t) !== false) return true;
        }
        return false;
    }

    public function ficha_tecnica($equipo_id) {
        $query = "SELECT e.*, a.nombre as area_nombre, a.jefe_encargado,
                         ft.procesador, ft.sistema_operativo, ft.licencia_so,
                         ft.mac_address, ft.ip_asignada, ft.software_base
                  FROM v2_equipos e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
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

        $e = $stmt->fetch(PDO::FETCH_ASSOC);
        $esTecnico = $this->isTechnical($e['tipo_equipo']);

        // ── Sección de especificaciones técnicas (solo si es CPU/Laptop) ──
        if ($esTecnico) {
            $seccionTecnica = '
            <h3 style="color:#1e3a8a;margin-top:28px;margin-bottom:6px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
                Especificaciones de Hardware y Software
            </h3>
            <table>
                <tr><th>Procesador</th><td>'       . htmlspecialchars($e['procesador']       ?? 'N/A') . '</td></tr>
                <tr><th>Memoria RAM</th><td>'      . htmlspecialchars(($e['ram_gb'] ?? '-') . ' GB') . '</td></tr>
                <tr><th>Almacenamiento</th><td>'   . htmlspecialchars(($e['almacenamiento_gb'] ?? '-') . ' GB ' . ($e['tipo_disco'] ?? '')) . '</td></tr>
                <tr><th>Sistema Operativo</th><td>'. htmlspecialchars($e['sistema_operativo'] ?? 'N/A') . '</td></tr>
                <tr><th>Licencia SO</th><td>'      . htmlspecialchars($e['licencia_so']       ?? 'N/A') . '</td></tr>
                <tr><th>Dirección MAC</th><td>'    . htmlspecialchars($e['mac_address']       ?? 'N/A') . '</td></tr>
                <tr><th>IP Asignada</th><td>'      . htmlspecialchars($e['ip_asignada']       ?? 'DHCP') . '</td></tr>
                <tr><th>Software Base</th><td>'    . htmlspecialchars($e['software_base']     ?? 'N/A') . '</td></tr>
            </table>';
        } else {
            $seccionTecnica = '
            <div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;color:#64748b;font-size:12px;">
                Las especificaciones técnicas de hardware y software no aplican para equipos de tipo
                <strong>' . htmlspecialchars($e['tipo_equipo'] ?? '') . '</strong>.
            </div>';
        }

        $html = '
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body  { font-family: "Helvetica", sans-serif; font-size: 13px; color: #334155; margin: 30px; }
                h1    { color: #1e3a8a; text-align: center; font-size: 18px; border-bottom: 2px solid #1e3a8a;
                        padding-bottom: 10px; margin-bottom: 4px; }
                .sub  { text-align:center; color:#64748b; font-size:11px; margin-bottom:20px; }
                h3    { color:#1e3a8a; margin-top:28px; margin-bottom:6px; font-size:13px;
                        text-transform:uppercase; letter-spacing:1px; }
                table { width:100%; border-collapse:collapse; margin-top:6px; }
                th, td{ border:1px solid #e2e8f0; padding:8px 12px; text-align:left; font-size:12px; }
                th    { background-color:#f1f5f9; width:35%; color:#475569; font-weight:600; }
                td    { color:#1e293b; }
                .badge{ display:inline-block; padding:2px 10px; border-radius:20px;
                        background:#dbeafe; color:#1d4ed8; font-size:11px; font-weight:bold; }
                .footer{ margin-top:50px; text-align:center; font-size:10px; color:#94a3b8;
                         border-top:1px solid #e2e8f0; padding-top:10px; }
            </style>
        </head>
        <body>
            <h1>Ficha Técnica de Equipo</h1>
            <p class="sub">Sistema de Gestión de Equipos &mdash; MPA V2</p>

            <h3>Información General</h3>
            <table>
                <tr><th>Código Patrimonial</th><td><strong>' . htmlspecialchars($e['codigo_patrimonial'] ?? '') . '</strong></td></tr>
                <tr><th>Código Identificativo</th><td>'     . htmlspecialchars($e['codigo_identificativo'] ?? '—') . '</td></tr>
                <tr><th>Tipo de Equipo</th><td><span class="badge">' . htmlspecialchars($e['tipo_equipo'] ?? '') . '</span></td></tr>
                <tr><th>Marca / Modelo</th><td>'            . htmlspecialchars(($e['marca'] ?? '—') . ' / ' . ($e['modelo'] ?? '—')) . '</td></tr>
                <tr><th>Número de Serie</th><td>'           . htmlspecialchars($e['numero_serie'] ?? '—') . '</td></tr>
                <tr><th>Área Asignada</th><td>'             . htmlspecialchars($e['area_nombre'] ?? '—') . '</td></tr>
                <tr><th>Jefe a Cargo</th><td>'              . htmlspecialchars($e['jefe_encargado'] ?? '—') . '</td></tr>
                <tr><th>Fecha Adquisición</th><td>'         . htmlspecialchars($e['fecha_adquisicion'] ?? '—') . '</td></tr>
                <tr><th>Estado Conservación</th><td>'       . htmlspecialchars($e['estado_conservacion'] ?? '—') . '</td></tr>
                <tr><th>Estado Operativo</th><td>'          . htmlspecialchars($e['estado_operativo'] ?? '—') . '</td></tr>
            </table>

            ' . $seccionTecnica . '

            <div class="footer">
                Documento generado automáticamente &bull; Fecha de emisión: ' . date('d/m/Y H:i') . '
            </div>
        </body>
        </html>';

        $options = new Options();
        $options->set('defaultFont', 'Helvetica');
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $dompdf->stream("ficha_tecnica_" . ($e['codigo_patrimonial'] ?? $equipo_id) . ".pdf", ["Attachment" => false]);
    }
}
?>
