<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Mantenimiento.php';
require_once __DIR__ . '/../models/Cronograma.php';

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
            body  { font-family: "Helvetica", sans-serif; font-size: 13px; color: #1f2937; margin: 2px 10px 20px; }
            h1    { color: #111827; text-align: center; font-size: 18px; font-weight: 700;
                    margin: 0 0 18px 0; }
            .sub  { text-align:center; color:#64748b; font-size:11px; margin-bottom:20px; }
            h3    { color:#111827; margin-top:28px; margin-bottom:6px; font-size:13px;
                    text-transform:uppercase; letter-spacing:1px; }
            table { width:100%; border-collapse:collapse; margin-top:6px; }
            th, td{ border:1px solid #e5e7eb; padding:8px 12px; text-align:left; font-size:12px; }
            .general-info-table th, .general-info-table td { padding:5px 10px; }
            th    { background-color:#f3f4f6; width:35%; color:#374151; font-weight:600; }
            td    { color:#111827; }
            .badge{ display:inline-block; padding:2px 10px; border-radius:20px;
                    background:#e5e7eb; color:#111827; font-size:11px; font-weight:bold; }
            .badge-correctivo { background:#f3f4f6; color:#111827; }
            .badge-preventivo { background:#f3f4f6; color:#111827; }
            .text-block { white-space: pre-wrap; line-height: 1.5; }
            .image-heading { margin-top:16px; border:1px solid #111827; border-bottom:0; padding:3px; text-align:center; font-size:12px; font-weight:700; }
            .image-row { width:100%; display:table; table-layout:fixed; border:1px solid #111827; border-top:0; }
            .image-box { display:table-cell; width:50%; padding:1px; vertical-align:top; background:#ffffff; }
            .image-box img { width:300px; height:190px; object-fit:contain; display:block; margin:0 auto; }
            .ficha-pdf { margin:0 10px 8px; font-size:11px; }
            .ficha-pdf h3 { margin-top:12px !important; margin-bottom:4px !important; }
            .ficha-pdf .image-heading { margin-top:8px; }
            .ficha-pdf .general-info-table th, .ficha-pdf .general-info-table td { padding:3px 8px; }
            .header-band { width:100%; display:block; margin-bottom:18px; }
            .brand-box { width:100%; }
            .brand-mark {
                width:100%; background: transparent; display:flex;
                align-items:center; justify-content:flex-start; padding:0;
            }
            .brand-mark img {
                display:block; width:100%; max-width:420px; height:auto; object-fit:contain;
            }
            .header-lower { width:100%; display:table; margin-top:2px; }
            .header-title { display:table-cell; width:68%; vertical-align:top; color:#111827; font-size:18px; font-weight:700; letter-spacing:0.2px; margin:0; text-transform:uppercase; }
            .header-meta { display:table-cell; width:32%; padding:0; text-align:right; vertical-align:top; }
            .sheet-number { display:inline-block; min-width:150px; border:1px solid #2563eb; padding:6px 10px; text-align:left; color:#111827; font-size:16px; font-weight:700; }
            .issue-date { display:inline-block; min-width:150px; margin-top:18px; padding:0 10px 3px; border-bottom:1px solid #111827; color:#111827; font-size:12px; text-align:left; }
            .footer{ margin-top:50px; text-align:center; font-size:10px; color:#6b7280;
                     border-top:1px solid #e5e7eb; padding-top:10px; }
            .timeline-row:nth-child(even) td { background:#f9fafb; }
        ';
    }

    private function imageDataUri(?string $fileName): ?string {
        if (!$fileName) {
            return null;
        }

        $uploadDir = realpath(__DIR__ . '/../../../uploads/fichas_tecnicas');
        if (!$uploadDir) {
            return null;
        }

        $filePath = realpath($uploadDir . DIRECTORY_SEPARATOR . basename($fileName));
        if (!$filePath || strpos($filePath, $uploadDir) !== 0 || !is_file($filePath)) {
            return null;
        }

        $content = @file_get_contents($filePath);
        if ($content === false) {
            return null;
        }

        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
        ];
        $mime = $mimeTypes[$ext] ?? null;
        if (!$mime) {
            return null;
        }

        return 'data:' . $mime . ';base64,' . base64_encode($content);
    }

    private function renderImageTag(?string $fileName, string $title = ''): string {
        $uri = $this->imageDataUri($fileName);
        if (!$uri) {
            return '';
        }

           return '<div class="image-box">'
               . '<img src="' . $uri . '" alt="' . $this->h($title) . '" />'
             . '</div>';
    }

    private function logoDataUri(): string {
        $candidates = [
            __DIR__ . '/../../../../public/logo-mpa.png',
            __DIR__ . '/../../../../public/logo-mpa.svg',
        ];

        foreach ($candidates as $path) {
            $filePath = realpath($path);
            if (!$filePath || !is_file($filePath)) {
                continue;
            }

            $content = @file_get_contents($filePath);
            if ($content === false) {
                continue;
            }

            $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $mime = ['png' => 'image/png', 'svg' => 'image/svg+xml'][$ext] ?? 'image/png';
            return 'data:' . $mime . ';base64,' . base64_encode($content);
        }

        return '';
    }

    private function renderPdf(string $html, string $filename, string $orientation = 'portrait', string $paper = 'A4'): void {
        $options = new Options();
        $options->set('defaultFont', 'Helvetica');
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper($paper, $orientation);
        $dompdf->render();

        $output = $dompdf->output();
        if (ob_get_length() !== false) {
            ob_clean();
        }
        header_remove('Content-Type');
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($output));
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');
        echo $output;
        exit;
    }

    private function firmanteInfo(): array {
        return [
            'nombre' => 'Tec. Denky Navarro Navarro',
            'rol' => 'Técnico Responsable'
        ];
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
                         ft.mac_address, ft.ip_asignada, ft.software_base,
                         ft.observaciones_evaluacion, ft.diagnostico, ft.conclusion_motivo,
                         ft.numero_ficha,
                    ft.imagen_1, ft.imagen_2,
                    hb.causal_danio, hb.causal_excedencia, hb.causal_chatarra,
                    hb.causal_reparacion_onerosa, hb.causal_obsolescencia_tecnica,
                    hb.causal_raee
                  FROM v2_equipos e
                  LEFT JOIN v2_areas a ON e.area_id = a.id
                  LEFT JOIN v2_fichas_tecnicas ft ON e.id = ft.equipo_id
                LEFT JOIN v2_hojas_baja hb ON e.id = hb.equipo_id
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
        $tipoEquipo = strtoupper(trim((string) ($e['tipo_equipo'] ?? 'EQUIPO')));
        $numeroFicha = trim((string) ($e['numero_ficha'] ?? ''));
        if ($numeroFicha === '') {
            $numeroFicha = 'N°' . str_pad((string) ((int) ($e['id'] ?? $equipo_id)), 3, '0', STR_PAD_LEFT);
        }

        $causalLabels = [
            'causal_danio' => 'Daño',
            'causal_excedencia' => 'Estado De Excedencia',
            'causal_chatarra' => 'Estado De Chatarra',
            'causal_reparacion_onerosa' => 'Mantenimiento O Reparacion Onerosa',
            'causal_obsolescencia_tecnica' => 'Obsolescencia Tecnica',
            'causal_raee' => 'Raee',
        ];
        $causales = [];
        foreach ($causalLabels as $field => $label) {
            if (!empty($e[$field])) {
                $causales[] = $label;
            }
        }
        $causalesTexto = $causales ? implode(', ', $causales) : '—';

        // ── Sección de especificaciones técnicas (solo si es CPU/Laptop) ──
        $observacionesEvaluacion = trim((string) ($e['observaciones_evaluacion'] ?? ''));

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
        } elseif (strtolower(trim($e['tipo_equipo'] ?? '')) === 'monitor') {
            $seccionTecnica = '';
        } else {
            $seccionTecnica = '
            <div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;color:#64748b;font-size:12px;">
                Las especificaciones técnicas de hardware y software no aplican para equipos de tipo
                <strong>' . htmlspecialchars($e['tipo_equipo'] ?? '') . '</strong>.
            </div>';
        }

        $diagnosticoText = trim((string) ($e['diagnostico'] ?? $e['observaciones_evaluacion'] ?? ''));
        $conclusionText = trim((string) ($e['conclusion_motivo'] ?? ''));
        $imagen1Tag = $this->renderImageTag($e['imagen_1'], 'Imagen del equipo 1');
        $imagen2Tag = $this->renderImageTag($e['imagen_2'], 'Imagen del equipo 2');

        $seccionDiagnostico = '';
        if ($diagnosticoText !== '') {
            $seccionDiagnostico = '
            <h3 style="color:#1e3a8a;margin-top:28px;margin-bottom:6px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
                Diagnóstico
            </h3>
            <div class="text-block">' . $this->h($diagnosticoText) . '</div>';
        }

        $seccionConclusion = '';
        if ($conclusionText !== '') {
            $seccionConclusion = '
            <h3 style="color:#1e3a8a;margin-top:28px;margin-bottom:6px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
                Conclusión y/o Motivo
            </h3>
            <div class="text-block">' . $this->h($conclusionText) . '</div>';
        }

        $seccionImagenes = '';
        if ($imagen1Tag !== '' || $imagen2Tag !== '') {
            $seccionImagenes = '
            <div class="image-heading">IMAGEN</div>
            <div class="image-row">' . $imagen1Tag . $imagen2Tag . '</div>';
        }

        $firmante = $this->firmanteInfo();
        $firmaHtml = '
        <table style="width:100%; border:0; margin-top:36px;">
            <tr><td style="border:0; text-align:center;">
            <div style="width:42%; margin:0 auto; text-align:center;">
                <div style="height:42px; border-bottom:2px solid #1e293b; margin-bottom:10px; opacity:0.9;"></div>
                <div style="font-size:10px; color:#475569; letter-spacing:1.5px; text-transform:uppercase; font-weight:700; margin-bottom:6px;">' . $this->h($firmante['rol']) . '</div>
                <div style="font-size:13px; color:#0f172a; font-weight:700; letter-spacing:0.2px;">' . $this->h($firmante['nombre']) . '</div>
            </div>
            </td></tr>
        </table>';

        $logoUri = $this->logoDataUri();
        $headerHtml = '
        <div class="header-band">
            <div class="brand-box">
                <div class="brand-mark">
                    ' . ($logoUri !== '' ? '<img src="' . $logoUri . '" alt="MPA logo" />' : '') . '
                </div>
                <div class="header-lower">
                    <div class="header-title">HOJA DE REVISIÓN TÉCNICA DE ' . $this->h($tipoEquipo) . '</div>
                    <div class="header-meta">
                        <div class="sheet-number">' . $this->h($numeroFicha) . '</div>
                        <div class="issue-date">FECHA: ' . date('d/m/Y') . '</div>
                    </div>
                </div>
            </div>
        </div>
        ';

        $html = '
        <html>
        <head>
            <meta charset="UTF-8">
            <style>' . $this->pdfStyles() . '</style>
        </head>
        <body class="ficha-pdf">
            ' . $headerHtml . '

            <h3 style="margin-top:10px;">Información General</h3>
            <table class="general-info-table">
                <tr><th>Código Patrimonial</th><td><strong>' . $this->h($e['codigo_patrimonial'] ?? '') . '</strong></td></tr>
                <tr><th>Código Identificativo</th><td>'     . $this->h($e['codigo_identificativo'] ?? '—') . '</td></tr>
                <tr><th>Tipo de Equipo</th><td><span class="badge">' . $this->h($e['tipo_equipo'] ?? '') . '</span></td></tr>
                <tr><th>Marca</th><td>'                  . $this->h($e['marca'] ?? '—') . '</td></tr>
                <tr><th>Modelo</th><td>'                 . $this->h($e['modelo'] ?? '—') . '</td></tr>
                <tr><th>Color</th><td>'                  . $this->h($e['color'] ?? '—') . '</td></tr>
                <tr><th>Número de Serie</th><td>'           . $this->h($e['numero_serie'] ?? '—') . '</td></tr>
                <tr><th>Oficina</th><td>'                   . $this->h($e['area_nombre'] ?? '—') . '</td></tr>
                <tr><th>Responsable</th><td>'               . $this->h($e['responsable_nombre'] ?? $e['jefe_encargado'] ?? '—') . '</td></tr>
                <tr><th>Causales</th><td>'                  . $this->h($causalesTexto) . '</td></tr>
                <tr><th>Estado Conservación</th><td>'       . $this->h($e['estado_conservacion'] ?? '—') . '</td></tr>
                <tr><th>Estado Operativo</th><td>'          . $this->h($e['estado_operativo'] ?? '—') . '</td></tr>
            </table>

            ' . $seccionTecnica . '
            ' . $seccionDiagnostico . '
            ' . $seccionConclusion . '
            ' . $seccionImagenes . '
            ' . $firmaHtml . '

        </body>
        </html>';

        $codigoArchivo = preg_replace(
            '/[^A-Za-z0-9._-]+/',
            '_',
            (string) ($e['codigo_patrimonial'] ?? $equipo_id)
        );
        $codigoArchivo = trim($codigoArchivo, '._-') ?: (string) $equipo_id;
        $this->renderPdf($html, "ficha_tecnica_{$codigoArchivo}.pdf");
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

    public function cronograma(int $id): void {
        $model = new Cronograma($this->db);
        $data = $model->getMatriz($id);
        if (!$data) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Cronograma no encontrado."]);
            return;
        }

        $doc = $data['cronograma'];
        $anio = (int) ($doc['anio'] ?? date('Y'));
        $pares = Cronograma::paresDeMesesParaPdf($data['filas'] ?? [], $anio);
        $totalHojas = max(1, count($pares));
        $paginas = [];
        foreach ($pares as $i => $par) {
            $ultima = ($i === count($pares) - 1);
            $paginas[] = $this->htmlMatrizCronograma($data, $anio, $par, $i + 1, $totalHojas, $ultima);
        }

        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>'
            . $this->estilosCronogramaPdf()
            . '</style></head><body>'
            . implode('', $paginas)
            . '</body></html>';

        $this->renderPdf($html, 'cronograma_' . $id . '.pdf', 'landscape', 'A4');
    }

    private function estilosCronogramaPdf(): string {
        return '
            @page { margin: 6mm 5mm 6mm 5mm; }
            body { font-family: Helvetica, sans-serif; color: #111827; font-size: 7.5px; margin: 0; }
            h1 { text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 0.4px; margin: 0 0 1px; }
            .sub { text-align: center; font-size: 8px; color: #475569; margin: 0 0 4px; }
            .gantt { width: 100%; border-collapse: collapse; }
            .gantt th, .gantt td { border: 0.4pt solid #334155; padding: 2px 3px; text-align: center; font-size: 6.5px; line-height: 1.2; vertical-align: middle; }
            .gantt .nro { width: 1%; white-space: nowrap; font-size: 6.5px; padding: 2px 1px; }
            .gantt .area { text-align: left; font-size: 7px; padding: 2px 4px; white-space: nowrap; }
            .gantt .pc, .gantt .lap, .gantt .imp { width: 1%; white-space: nowrap; font-size: 6px; padding: 2px 2px; }
            .gantt .eqs { font-size: 6.5px; font-weight: 700; }
            .gantt .mes { background: #e2e8f0; font-size: 7px; font-weight: 700; }
            .gantt .dia { font-size: 6px; color: #334155; font-weight: 600; padding: 1px 1px; white-space: nowrap; }
            .gantt .mark { font-weight: 700; font-size: 6.5px; color: #0f172a; }
            .gantt .tot { background: #e2e8f0; font-weight: 700; }
            .gantt .tot .left { text-align: left; white-space: nowrap; }
            .gantt .left { text-align: left; }
            .gantt .ger td { background: #cbd5e1; font-weight: 700; text-align: left; font-size: 6.5px; letter-spacing: 0.4px; }
            .bloque { page-break-after: always; }
            .final { page-break-after: auto; }
            .pie-grid { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .pie-grid th, .pie-grid td { border: 1px solid #334155; padding: 3px 5px; font-size: 7px; vertical-align: middle; }
            .pie-grid th { background: #e2e8f0; font-weight: 700; text-align: center; }
            .pie-grid .n { width: 8mm; text-align: center; }
            .pie-grid .eq { width: 22mm; text-align: left; }
            .pie-grid .hr { text-align: left; }
            .pie-grid .nota-cell { width: 58%; text-align: justify; vertical-align: top; padding: 6px 8px; }
        ';
    }

    private function nombresMesPdf(): array {
        return [1 => 'ENE', 2 => 'FEB', 3 => 'MAR', 4 => 'ABR', 5 => 'MAY', 6 => 'JUN',
            7 => 'JUL', 8 => 'AGO', 9 => 'SET', 10 => 'OCT', 11 => 'NOV', 12 => 'DIC'];
    }

    private function fechasDeMeses(int $anio, array $meses): array {
        return Cronograma::fechasLaborablesDeMeses($anio, $meses);
    }

    private function textoAreaPdf(string $nombre): string {
        $nombre = trim(preg_replace('/\s+/u', ' ', $nombre) ?? '');
        if ($nombre === '') {
            return '';
        }
        $lineas = preg_split("/\n/", wordwrap($nombre, 20, "\n", false)) ?: [$nombre];
        $html = [];
        foreach ($lineas as $linea) {
            $linea = trim((string) $linea);
            if ($linea !== '') {
                $html[] = $this->h($linea);
            }
        }
        return implode('<br />', $html);
    }

    private function conteoPdf($n): string {
        $n = (int) $n;
        return $n === 0 ? '-' : (string) $n;
    }

    private function esFinDeSemanaIso(string $fecha): bool {
        $n = (int) date('w', strtotime($fecha . ' 12:00:00'));
        return $n === 0 || $n === 6;
    }

    private function mapaCantidadFila(array $celdas): array {
        $map = [];
        foreach ($celdas as $celda) {
            $fecha = (string) ($celda['fecha'] ?? '');
            if ($fecha === '') {
                continue;
            }
            $map[$fecha] = (int) ($celda['cantidad'] ?? 0);
        }
        return $map;
    }

    private function encabezadoCronograma(array $doc, int $hoja, int $total): string {
        $anio = $this->h((string) ($doc['anio'] ?? ''));
        $nombre = $this->h((string) ($doc['nombre'] ?? ''));
        return '<h1>Cronograma de mantenimiento de equipos de cómputo ' . $anio . '</h1>'
            . '<p class="sub">' . $nombre . ' &nbsp;·&nbsp; Hoja ' . $hoja . ' / ' . $total . '</p>';
    }

    private function htmlMatrizCronograma(array $data, int $anio, array $meses, int $hoja, int $total, bool $conPie = false): string {
        $doc = $data['cronograma'];
        $filas = $data['filas'] ?? [];
        $tot = $data['totales'] ?? ['pc' => 0, 'laptop' => 0, 'impresora' => 0, 'total' => 0];
        $nombres = $this->nombresMesPdf();
        $fechas = $this->fechasDeMeses($anio, $meses);
        $nDias = max(1, count($fechas));

        $mesTh = '';
        foreach ($meses as $mes) {
            $span = Cronograma::cantidadLaborablesDelMes($anio, (int) $mes);
            if ($span < 1) {
                continue;
            }
            $mesTh .= '<th class="mes" colspan="' . $span . '">' . $nombres[$mes] . '-' . $anio . '</th>';
        }

        $diaTh = '';
        foreach ($fechas as $fecha) {
            $diaTh .= '<th class="dia">' . (int) substr($fecha, 8, 2) . '</th>';
        }

        $body = '';
        $nro = 1;
        $colSpanGer = 5 + $nDias;
        foreach ($filas as $i => $fila) {
            if (Cronograma::debeMostrarBandaGerencia($filas, $i)) {
                $body .= '<tr class="ger"><td class="left" colspan="' . $colSpanGer . '">'
                    . $this->h(Cronograma::etiquetaGerencia($fila))
                    . '</td></tr>';
            }
            $map = $this->mapaCantidadFila($fila['celdas'] ?? []);
            $body .= '<tr>'
                . '<td class="nro">' . $nro . '</td>'
                . '<td class="area left">' . $this->textoAreaPdf($fila['area'] ?? '') . '</td>'
                . '<td class="pc">' . $this->conteoPdf($fila['pc'] ?? 0) . '</td>'
                . '<td class="lap">' . $this->conteoPdf($fila['laptop'] ?? 0) . '</td>'
                . '<td class="imp">' . $this->conteoPdf($fila['impresora'] ?? 0) . '</td>';
            foreach ($fechas as $fecha) {
                $marca = Cronograma::marcaEnFecha((int) ($map[$fecha] ?? 0));
                $cls = $marca !== '' ? 'mark' : '';
                $body .= '<td class="' . $cls . '">' . ($marca !== '' ? $this->h($marca) : '&nbsp;') . '</td>';
            }
            $body .= '</tr>';
            $nro++;
        }

        $body .= '<tr class="tot">'
            . '<td class="nro">&nbsp;</td><td class="left">SUBTOTAL</td>'
            . '<td class="pc">' . $this->conteoPdf($tot['pc'] ?? 0) . '</td>'
            . '<td class="lap">' . $this->conteoPdf($tot['laptop'] ?? 0) . '</td>'
            . '<td class="imp">' . $this->conteoPdf($tot['impresora'] ?? 0) . '</td>'
            . '<td colspan="' . $nDias . '">&nbsp;</td></tr>'
            . '<tr class="tot">'
            . '<td class="nro">&nbsp;</td><td class="left">TOTAL EQUIPOS</td>'
            . '<td colspan="3">' . (int) ($tot['total'] ?? 0) . '</td>'
            . '<td colspan="' . $nDias . '">&nbsp;</td></tr>';

        return '<div class="bloque' . ($conPie ? ' final' : '') . '">'
            . $this->encabezadoCronograma($doc, $hoja, $total)
            . '<table class="gantt">'
            . '<colgroup>'
            . '<col class="nro" />'
            . '<col class="area" />'
            . '<col class="pc" />'
            . '<col class="lap" />'
            . '<col class="imp" />'
            . '</colgroup>'
            . '<tr>'
            . '<th class="nro" rowspan="2">N°</th>'
            . '<th class="area" rowspan="2">ÁREA</th>'
            . '<th class="eqs" colspan="3">EQUIPOS DE CÓMPUTO</th>'
            . $mesTh
            . '</tr>'
            . '<tr>'
            . '<th class="pc">PC</th>'
            . '<th class="lap">LAPTOP</th>'
            . '<th class="imp">IMPRESORA</th>'
            . $diaTh
            . '</tr>'
            . $body
            . '</table>'
            . ($conPie ? $this->htmlPiePersonal($data) : '')
            . '</div>';
    }

    private function htmlPiePersonal(array $data): string {
        $personas = $data['personal'] ?? [];
        if ($personas === []) {
            $personas = [
                ['nombre' => 'PC 01', 'hora_inicio' => '10:00', 'hora_fin' => '13:00'],
                ['nombre' => 'PC 02', 'hora_inicio' => '14:00', 'hora_fin' => '17:00'],
            ];
        }

        $nota = '<strong>NOTA:</strong> En la fecha y hora programada para el mantenimiento preventivo, '
            . 'los usuarios responsables de los equipos y sus periféricos deben prever y dar todas las facilidades '
            . 'al personal técnico de la Unidad de Tecnologías de la Información y Sistemas.';

        $rowspan = 2 + count($personas);
        $filas = '';
        $n = 1;
        foreach ($personas as $p) {
            $filas .= '<tr>'
                . '<td class="n">' . $n . '</td>'
                . '<td class="eq">' . $this->h($p['nombre'] ?? '') . '</td>'
                . '<td class="hr">' . $this->h($this->fmtHoraPdf($p['hora_inicio'] ?? '')) . ' — '
                . $this->h($this->fmtHoraPdf($p['hora_fin'] ?? '')) . '</td>'
                . '</tr>';
            $n++;
        }

        return '<table class="pie-grid" cellspacing="0" cellpadding="3">'
            . '<colgroup>'
            . '<col class="n" style="width:8mm;" />'
            . '<col class="eq" style="width:22mm;" />'
            . '<col class="hr" style="width:48mm;" />'
            . '<col />'
            . '</colgroup>'
            . '<tr>'
            . '<th colspan="3">HORA PROGRAMADA</th>'
            . '<td class="nota-cell" rowspan="' . $rowspan . '">' . $nota . '</td>'
            . '</tr>'
            . '<tr>'
            . '<th class="n">N°</th>'
            . '<th class="eq">EQUIPO</th>'
            . '<th class="hr">HORARIO</th>'
            . '</tr>'
            . $filas
            . '</table>';
    }

    private function fmtHoraPdf(?string $hora): string {
        $norm = Cronograma::normalizarHora((string) $hora);
        if ($norm === null) {
            return '—';
        }
        $ts = strtotime('1970-01-01 ' . $norm);
        $h = (int) date('G', $ts);
        $min = date('i', $ts);
        if ($h === 0) {
            return '12:' . $min . ' a. m.';
        }
        if ($h === 12) {
            return '12:' . $min . ' p. m.';
        }
        if ($h > 12) {
            return sprintf('%02d:%s p. m.', $h - 12, $min);
        }
        return sprintf('%02d:%s a. m.', $h, $min);
    }
}
?>
