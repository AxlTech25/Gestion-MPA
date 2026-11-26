<?php
/**
 * Copie como local.php (desarrollo o producción).
 * No suba archivos con credenciales a repositorios públicos.
 *
 * Variables de entorno (prioridad):
 * DB_HOST / MYSQLHOST, DB_PORT / MYSQLPORT, DB_NAME / MYSQLDATABASE,
 * DB_USER / MYSQLUSER, DB_PASS / MYSQLPASSWORD, DB_SSL,
 * JWT_SECRET, CORS_ORIGINS.
 */
return [
    // XAMPP local
    'db_host' => 'localhost',
    'db_port' => '', // vacío = puerto MySQL por defecto (3306)
    'db_name' => 'gestion_equipos_mpa_v2',
    'db_user' => 'root',
    'db_pass' => '',
    // Azure MySQL Flexible: 'db_ssl' => 'require'  o env DB_SSL=require
    'db_ssl' => '',

    // En producción use un secreto largo y aleatorio (p. ej. 64 hex).
    'jwt_secret' => 'gestion_mpa_dev_secret_cambiar_en_produccion',

    // Incluya la URL exacta del frontend (Vercel) en producción, con https://
    'cors_origins' => 'http://localhost:5173,http://localhost,http://127.0.0.1',

    // Login: bloqueo tras N fallos (por IP y por usuario+IP) durante login_lockout_seconds.
    'login_max_attempts' => 5,
    'login_lockout_seconds' => 900,

    // Sin FastAPI: 'ml_service_url' => '',
];
