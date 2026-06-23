<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Mantenimiento.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class ReporteController {
    private $db;
    private $mantenimiento;

    // Tipos que requieren especificaciones técnicas
    private $technical_types = ['cpu', 'laptop', 'pc'];

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->mantenimiento = new Mantenimiento($this->db);
    }

    private function h($value): string {
        return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES, 'UTF-8');
    }

    private function fmtFecha(?string $fecha): string {
        if (!$fecha) {
            return '—';
        }
        $ts = strtotime($fecha);
        return $ts ? date('d/m/Y H:i', $ts) : $this->h($fecha);
    }

    private function fmtFechaCorta(?string $fecha): string {
        if (!$fecha) {
            return '—';
        }
        $ts = strtotime($fecha);
        return $ts ? date('d/m/Y', $ts) : $this->h($fecha);
    }

    private function fmtMoneda($value): string {
        if ($value === null || $value === '') {
            return '—';
        }
        return 'S/ ' . number_format((float) $value, 2);
    }

    private function pdfStyles(): string {
        return '
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
            .badge-correctivo { background:#fee2e2; color:#b91c1c; }
            .badge-preventivo { background:#dbeafe; color:#1d4ed8; }
            .text-block { white-space: pre-wrap; line-height: 1.5; }
            .footer{ margin-top:50px; text-align:center; font-size:10px; color:#94a3b8;
                     border-top:1px solid #e2e8f0; padding-top:10px; }
            .timeline-row:nth-child(even) td { background:#f8fafc; }
        ';
    }

    private function renderPdf(string $html, string $filename): void {
        $options = new Options();
        $options->set('defaultFont', 'Helvetica');
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $dompdf->stream($filename, ["Attachment" => false]);
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
            <style>' . $this->pdfStyles() . '</style>
        </head>
        <body>
            <h1>Ficha Técnica de Equipo</h1>
            <p class="sub">Sistema de Gestión de Equipos &mdash; MPA V2</p>

            <h3>Información General</h3>
            <table>
                <tr><th>Código Patrimonial</th><td><strong>' . $this->h($e['codigo_patrimonial'] ?? '') . '</strong></td></tr>
                <tr><th>Código Identificativo</th><td>'     . $this->h($e['codigo_identificativo'] ?? '—') . '</td></tr>
                <tr><th>Tipo de Equipo</th><td><span class="badge">' . $this->h($e['tipo_equipo'] ?? '') . '</span></td></tr>
                <tr><th>Marca / Modelo</th><td>'            . $this->h(($e['marca'] ?? '—') . ' / ' . ($e['modelo'] ?? '—')) . '</td></tr>
                <tr><th>Número de Serie</th><td>'           . $this->h($e['numero_serie'] ?? '—') . '</td></tr>
                <tr><th>Área Asignada</th><td>'             . $this->h($e['area_nombre'] ?? '—') . '</td></tr>
                <tr><th>Jefe a Cargo</th><td>'              . $this->h($e['jefe_encargado'] ?? '—') . '</td></tr>
                <tr><th>Fecha Adquisición</th><td>'         . $this->h($e['fecha_adquisicion'] ?? '—') . '</td></tr>
                <tr><th>Estado Conservación</th><td>'       . $this->h($e['estado_conservacion'] ?? '—') . '</td></tr>
                <tr><th>Estado Operativo</th><td>'          . $this->h($e['estado_operativo'] ?? '—') . '</td></tr>
            </table>

            ' . $seccionTecnica . '

            <div class="footer">
                Documento generado automáticamente &bull; Fecha de emisión: ' . date('d/m/Y H:i') . '
            </div>
        </body>
        </html>';

        $this->renderPdf($html, "ficha_tecnica_" . ($e['codigo_patrimonial'] ?? $equipo_id) . ".pdf");
    }

    public function historial_mantenimiento(string $codigo) {
        $codigo = trim($codigo);
        if ($codigo === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Código patrimonial requerido."]);
            return;
        }

        $equipo = $this->mantenimiento->getEquipoByCodigo($codigo);
        if (!$equipo) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Equipo no encontrado."]);
            return;
        }

        $stmt = $this->mantenimiento->getByEquipoId((int) $equipo['id']);
        $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $filas = '';
        if (count($historial) === 0) {
            $filas = '<tr><td colspan="6" style="text-align:center;color:#64748b;">Sin intervenciones registradas.</td></tr>';
        } else {
            foreach ($historial as $m) {
                $tipoCls = ($m['tipo_mantenimiento'] ?? '') === 'Correctivo' ? 'badge-correctivo' : 'badge-preventivo';
                $filas .= '<tr class="timeline-row">
                    <td>' . $this->fmtFecha($m['fecha_intervencion'] ?? null) . '</td>
                    <td><span class="badge ' . $tipoCls . '">' . $this->h($m['tipo_mantenimiento'] ?? '—') . '</span></td>
                    <td>' . $this->h($m['categoria_falla'] ?? '—') . '</td>
                    <td>' . $this->h($m['tecnico'] ?? '—') . '</td>
                    <td>' . $this->h($m['estado_post_mantenimiento'] ?? '—') . '</td>
                    <td>' . $this->fmtMoneda($m['costo_reparacion'] ?? null) . '</td>
                </tr>';
            }
        }

        $html = '
        <html>
        <head>
            <meta charset="UTF-8">
            <style>' . $this->pdfStyles() . '</style>
        </head>
        <body>
            <h1>Historial de Mantenimiento</h1>
            <p class="sub">Sistema de Gestión de Equipos &mdash; MPA V2</p>

            <h3>Equipo</h3>
            <table>
                <tr><th>Código Patrimonial</th><td><strong>' . $this->h($equipo['codigo_patrimonial']) . '</strong></td></tr>
                <tr><th>Tipo / Marca / Modelo</th><td>' . $this->h(($equipo['tipo_equipo'] ?? '—') . ' · ' . ($equipo['marca'] ?? '—') . ' ' . ($equipo['modelo'] ?? '')) . '</td></tr>
                <tr><th>Área</th><td>' . $this->h($equipo['area_nombre'] ?? '—') . '</td></tr>
                <tr><th>Estado operativo</th><td>' . $this->h($equipo['estado_operativo'] ?? '—') . '</td></tr>
                <tr><th>Último mantenimiento</th><td>' . $this->fmtFechaCorta($equipo['fecha_ultimo_mantenimiento'] ?? null) . '</td></tr>
                <tr><th>Total intervenciones</th><td>' . count($historial) . '</td></tr>
            </table>

            <h3>Cronología de intervenciones</h3>
            <table>
                <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Técnico</th>
                    <th>Estado posterior</th>
                    <th>Costo</th>
                </tr>
                ' . $filas . '
            </table>

            <div class="footer">
                Documento generado automáticamente &bull; Fecha de emisión: ' . date('d/m/Y H:i') . '
            </div>
        </body>
        </html>';

        $this->renderPdf($html, "historial_mantenimiento_" . $equipo['codigo_patrimonial'] . ".pdf");
    }

    public function ficha_mantenimiento(int $id) {
        $m = $this->mantenimiento->getById($id);
        if (!$m) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Intervención no encontrada."]);
            return;
        }

        $tipoCls = ($m['tipo_mantenimiento'] ?? '') === 'Correctivo' ? 'badge-correctivo' : 'badge-preventivo';
        $esCorrectivo = ($m['tipo_mantenimiento'] ?? '') === 'Correctivo';

        $seccionCorrectivo = '';
        if ($esCorrectivo) {
            $seccionCorrectivo = '
            <h3>Diagnóstico y reparación</h3>
            <table>
                <tr><th>Síntoma reportado</th><td class="text-block">' . $this->h($m['sintoma_usuario'] ?? '—') . '</td></tr>
                <tr><th>Componente principal</th><td>' . $this->h($m['componente_principal'] ?? '—') . '</td></tr>
                <tr><th>Causa raíz</th><td class="text-block">' . $this->h($m['causa_raiz'] ?? '—') . '</td></tr>
                <tr><th>Diagnóstico técnico</th><td class="text-block">' . $this->h($m['diagnostico_texto'] ?? '—') . '</td></tr>
                <tr><th>Piezas reemplazadas</th><td class="text-block">' . $this->h($m['piezas_reemplazadas'] ?? '—') . '</td></tr>
                <tr><th>Costo de reparación</th><td>' . $this->fmtMoneda($m['costo_reparacion'] ?? null) . '</td></tr>
            </table>';
        }

        $seccionTelemetria = '
            <h3>Lecturas y telemetría</h3>
            <table>
                <tr><th>Nivel de polvo</th><td>' . $this->h($m['nivel_polvo'] ?? '—') . '</td></tr>
                <tr><th>Temp. CPU / Disco</th><td>' . $this->h(($m['temperatura_cpu'] ?? '—') . ' °C / ' . ($m['temperatura_disco'] ?? '—') . ' °C') . '</td></tr>
                <tr><th>Horas de uso</th><td>' . $this->h($m['horas_uso_acumuladas'] ?? '—') . '</td></tr>
                <tr><th>Salud batería</th><td>' . $this->h($m['salud_bateria_pct'] !== null && $m['salud_bateria_pct'] !== '' ? $m['salud_bateria_pct'] . ' %' : '—') . '</td></tr>
                <tr><th>Contador páginas</th><td>' . $this->h($m['contador_paginas_lectura'] ?? '—') . '</td></tr>
                <tr><th>Inactividad (min)</th><td>' . $this->h($m['tiempo_inactividad_min'] ?? '0') . '</td></tr>
            </table>';

        $html = '
        <html>
        <head>
            <meta charset="UTF-8">
            <style>' . $this->pdfStyles() . '</style>
        </head>
        <body>
            <h1>Ficha de Mantenimiento</h1>
            <p class="sub">Sistema de Gestión de Equipos &mdash; MPA V2</p>

            <h3>Intervención</h3>
            <table>
                <tr><th>N° Orden</th><td>' . $this->h($m['nro_orden'] ?? '—') . '</td></tr>
                <tr><th>Fecha intervención</th><td>' . $this->fmtFecha($m['fecha_intervencion'] ?? null) . '</td></tr>
                <tr><th>Tipo</th><td><span class="badge ' . $tipoCls . '">' . $this->h($m['tipo_mantenimiento'] ?? '—') . '</span></td></tr>
                <tr><th>Categoría falla</th><td>' . $this->h($m['categoria_falla'] ?? '—') . '</td></tr>
                <tr><th>Técnico</th><td>' . $this->h($m['tecnico'] ?? '—') . '</td></tr>
                <tr><th>Estado posterior</th><td>' . $this->h($m['estado_post_mantenimiento'] ?? '—') . '</td></tr>
            </table>

            <h3>Equipo</h3>
            <table>
                <tr><th>Código Patrimonial</th><td><strong>' . $this->h($m['codigo_patrimonial'] ?? '—') . '</strong></td></tr>
                <tr><th>Tipo / Marca / Modelo</th><td>' . $this->h(($m['tipo_equipo'] ?? '—') . ' · ' . ($m['marca'] ?? '—') . ' ' . ($m['modelo'] ?? '')) . '</td></tr>
                <tr><th>Área</th><td>' . $this->h($m['area_nombre'] ?? '—') . '</td></tr>
                <tr><th>N° Serie</th><td>' . $this->h($m['numero_serie'] ?? '—') . '</td></tr>
            </table>

            ' . $seccionCorrectivo . '
            ' . $seccionTelemetria . '

            <h3>Actividades realizadas</h3>
            <table>
                <tr><td class="text-block" colspan="2">' . $this->h($m['actividades_realizadas'] ?? 'Sin descripción registrada.') . '</td></tr>
            </table>

            <div class="footer">
                Documento generado automáticamente &bull; Fecha de emisión: ' . date('d/m/Y H:i') . '
            </div>
        </body>
        </html>';

        $this->renderPdf($html, "ficha_mantenimiento_" . ($m['nro_orden'] ?? $id) . ".pdf");
    }
}
?>
