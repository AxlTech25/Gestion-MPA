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
}
?>
