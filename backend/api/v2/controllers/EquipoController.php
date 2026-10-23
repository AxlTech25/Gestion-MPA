<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../models/Equipo.php';
require_once __DIR__ . '/../config/Database.php';

use OpenSpout\Reader\XLSX\Reader as XlsxReader;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use OpenSpout\Common\Entity\Row;

class EquipoController {
    private $db;
    private $equipo;

    private const PLANTILLA_HEADERS = [
        'codigo_patrimonial',
        'codigo_identificativo',
        'tipo_equipo',
        'marca',
        'modelo',
        'color',
        'numero_serie',
        'area',
        'ram_gb',
        'almacenamiento_gb',
        'tipo_disco',
        'procesador',
        'sistema_operativo',
        'fecha_adquisicion',
        'horas_uso',
        'errores_smart',
        'contador_paginas',
        'salud_bateria',
        'ultima_temp_cpu',
        'ultima_temp_disco',
    ];

    private const PLANTILLA_EJEMPLO = [
        '740000001111',
        '000121',
        'Laptop',
        'HP',
        'ProBook 450',
        'Negro',
        'SN123456',
        'Tecnología de la Información',
        '16',
        '512',
        'SSD',
        'Intel Core i5',
        'Windows 11',
        '2024-01-15',
        '0',
        '0',
        '',
        '',
        '',
        '',
    ];

    private const PLANTILLA_EJEMPLO_IMPRESORA = [
        '740000009201',
        '900201',
        'Impresora',
        'HP',
        'LaserJet',
        'Blanco',
        'SN654321',
        'Tecnología de la Información',
        '',
        '',
        '',
        '',
        '',
        '2024-03-01',
        '',
        '',
        '1500',
        '',
        '',
        '',
    ];

    public static function plantillaColumnas(): array {
        return self::PLANTILLA_HEADERS;
    }

    public static function plantillaFilaEjemplo(): array {
        return self::PLANTILLA_EJEMPLO;
    }

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->equipo = new Equipo($this->db);
    }

    public function index() {
        $stmt = $this->equipo->getAll();
        $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $equipos]);
    }

    public function show(int $id) {
        $equipo = $this->equipo->getById($id);
        if (!$equipo) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Equipo no encontrado."]);
            return;
        }
        echo json_encode(["success" => true, "data" => $equipo]);
    }

    public function update(int $id) {
        $data = json_decode(v2CuerpoRaw());
        if (empty($data->codigo_patrimonial) || empty($data->tipo_equipo) || empty($data->area_id)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (Código patrimonial, Tipo y Área)."]);
            return;
        }
        if ($this->equipo->update($id, $data)) {
            echo json_encode(["success" => true, "message" => "Equipo actualizado correctamente."]);
        } else {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "message" => $this->equipo->getLastError()
                    ?: "No se pudo actualizar. Verifique que el equipo exista y que los códigos no estén duplicados.",
            ]);
        }
    }

    public function destroy(int $id) {
        $result = $this->equipo->delete($id);
        if (!empty($result['ok'])) {
            echo json_encode(["success" => true, "message" => "Equipo eliminado."]);
            return;
        }
        $status = $result['status'] ?? 503;
        http_response_code($status);
        echo json_encode([
            "success" => false,
            "message" => $result['message'] ?? "No se pudo eliminar el equipo.",
        ]);
    }

    public function store() {
        $data = json_decode(v2CuerpoRaw());
        if (!empty($data->codigo_patrimonial) && !empty($data->tipo_equipo) && !empty($data->area_id)) {
            if ($this->equipo->create($data)) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Equipo registrado exitosamente."]);
            } else {
                http_response_code(409);
                echo json_encode([
                    "success" => false,
                    "message" => $this->equipo->getLastError()
                        ?: "No se pudo registrar el equipo. Revise duplicados o errores.",
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (Código patrimonial, Tipo y Área)."]);
        }
    }

    public function descargarPlantilla() {
        header_remove('Content-Type');

        $writer = new XlsxWriter();
        $writer->openToBrowser('plantilla_carga_equipos.xlsx');

        $writer->addRow(Row::fromValues(self::PLANTILLA_HEADERS));
        $writer->addRow(Row::fromValues(self::PLANTILLA_EJEMPLO));
        $writer->addRow(Row::fromValues(self::PLANTILLA_EJEMPLO_IMPRESORA));

        $writer->close();
        v2Detener();
    }

    public function cargaMasiva() {
        if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No se recibió el archivo Excel."]);
            return;
        }

        $file = $_FILES['archivo'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, ['xlsx', 'xls'], true)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Formato no válido. Use un archivo .xlsx"]);
            return;
        }

        $tmpPath = $file['tmp_name'];
        $importados = 0;
        $errores = [];
        $totalFilas = 0;

        try {
            $reader = new XlsxReader();
            $reader->open($tmpPath);

            $headerMap = null;
            $filaExcel = 0;

            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $row) {
                    $corte = $this->procesarFilaCarga($row, $filaExcel, $headerMap, $importados, $errores, $totalFilas);
                    if ($corte !== null) {
                        http_response_code(400);
                        echo json_encode(["success" => false, "message" => $corte]);
                        $reader->close();
                        return;
                    }
                }
                break;
            }

            $reader->close();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error leyendo Excel: " . $e->getMessage()]);
            return;
        }

        $mensaje = "{$importados} equipo(s) registrado(s)";
        if (count($errores) > 0) {
            $mensaje .= ", " . count($errores) . " con error";
        }

        echo json_encode([
            "success" => true,
            "message" => $mensaje,
            "data"    => [
                "importados"  => $importados,
                "errores"     => $errores,
                "total_filas" => $totalFilas,
            ],
        ]);
    }

    private function procesarFilaCarga($row, int &$filaExcel, ?array &$headerMap, int &$importados, array &$errores, int &$totalFilas): ?string {
        $filaExcel++;
        $values = array_map(fn($c) => $c->getValue(), iterator_to_array($row->getCells()));
        $corte = null;

        if ($headerMap === null) {
            $headerMap = $this->mapHeaders($values);
            if (!isset($headerMap['codigo_patrimonial'])) {
                $corte = "La plantilla debe incluir la columna 'codigo_patrimonial'.";
            }
        } elseif (!$this->filaVacia($values)) {
            $totalFilas++;
            $filaDatos = $this->rowToAssoc($headerMap, $values);
            $resultado = $this->equipo->importRow($filaDatos);
            if ($resultado['ok']) {
                $importados++;
            } else {
                $errores[] = [
                    'fila' => $filaExcel,
                    'mensaje' => $resultado['error'],
                    'codigo' => $filaDatos['codigo_patrimonial'] ?? '',
                ];
            }
        }

        return $corte;
    }

    private function mapHeaders(array $headers): array {
        $map = [];
        foreach ($headers as $i => $h) {
            $key = $this->normalizeHeader($h);
            if ($key !== '') {
                $map[$key] = $i;
            }
        }
        return $map;
    }

    private function normalizeHeader($h): string {
        $s = mb_strtolower(trim((string) $h));
        $s = str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['a', 'e', 'i', 'o', 'u', 'n'], $s);
        $aliases = [
            'cod patrimonial' => 'codigo_patrimonial',
            'codigo patrimonial' => 'codigo_patrimonial',
            'cod identificativo' => 'codigo_identificativo',
            'codigo identificativo' => 'codigo_identificativo',
            'tipo' => 'tipo_equipo',
            'tipo equipo' => 'tipo_equipo',
            'n serie' => 'numero_serie',
            'numero serie' => 'numero_serie',
            'area asignada' => 'area',
            'area' => 'area',
            'fecha adquisicion' => 'fecha_adquisicion',
            'fecha' => 'fecha_adquisicion',
            'so' => 'sistema_operativo',
            'sistema operativo' => 'sistema_operativo',
            'almacenamiento' => 'almacenamiento_gb',
            'ram' => 'ram_gb',
        ];
        $s = str_replace(' ', '_', $s);
        return $aliases[$s] ?? $s;
    }

    private function rowToAssoc(array $headerMap, array $values): array {
        $row = [];
        foreach ($headerMap as $key => $index) {
            $row[$key] = $values[$index] ?? null;
        }
        return $row;
    }

    private function filaVacia(array $values): bool {
        foreach ($values as $v) {
            if ($v !== null && trim((string) $v) !== '') {
                return false;
            }
        }
        return true;
    }
}
?>
