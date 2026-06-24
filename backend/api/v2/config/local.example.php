<?php
/**
 * Copie como local.php (desarrollo) o use local.hostinger.php en el servidor.
 * No suba archivos con credenciales a repositorios públicos.
 */
return [
    // XAMPP local
    'db_host' => 'localhost',
    'db_name' => 'gestion_equipos_mpa_v2',
    'db_user' => 'root',
    'db_pass' => '',

    'jwt_secret' => 'gestion_mpa_dev_secret_cambiar_en_produccion',

    'cors_origins' => 'http://localhost:5173,http://localhost,http://127.0.0.1',

    // En Hostinger deje vacío: 'ml_service_url' => '',
];
