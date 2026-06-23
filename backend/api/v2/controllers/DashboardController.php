<?php
require_once __DIR__ . '/../models/Dashboard.php';
require_once __DIR__ . '/../config/Database.php';

class DashboardController {
    private $dashboard;

    public function __construct() {
        $database = new Database();
        $this->dashboard = new Dashboard($database->getConnection());
    }

    public function resumen() {
        echo json_encode([
            "success" => true,
            "data"    => $this->dashboard->getResumen(),
            "message" => "Resumen del dashboard obtenido.",
        ]);
    }

    public function consulta() {
        $tipo = $_GET['tipo_equipo'] ?? null;
        $estadoOp = $_GET['estado_operativo'] ?? null;
        $estadoCons = $_GET['estado_conservacion'] ?? null;
        $tipoOtro = $_GET['tipo_otro'] ?? null;

        if (!$tipo && !$estadoOp && !$estadoCons) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Seleccione al menos un filtro (tipo, estado operativo o conservación).",
            ]);
            return;
        }

        $equipos = $this->dashboard->consultarEquipos($tipo, $estadoOp, $estadoCons, $tipoOtro);

        echo json_encode([
            "success" => true,
            "data" => [
                "filtros" => array_filter([
                    "tipo_equipo" => $tipo,
                    "tipo_otro" => $tipoOtro,
                    "estado_operativo" => $estadoOp,
                    "estado_conservacion" => $estadoCons,
                ]),
                "total" => count($equipos),
                "equipos" => $equipos,
            ],
        ]);
    }
}
?>
