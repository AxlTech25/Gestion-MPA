<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../api/v2/models/Cronograma.php';
require_once __DIR__ . '/../api/v2/models/Area.php';
require_once __DIR__ . '/../api/v2/models/Mantenimiento.php';
require_once __DIR__ . '/../api/v2/models/Dashboard.php';
require_once __DIR__ . '/../api/v2/models/Usuario.php';
require_once __DIR__ . '/../api/v2/models/Gerencia.php';
require_once __DIR__ . '/../api/v2/models/Equipo.php';
require_once __DIR__ . '/../api/v2/models/Prediccion.php';
require_once __DIR__ . '/../api/v2/models/MetricaEquipo.php';
require_once __DIR__ . '/../api/v2/config/Cors.php';
require_once __DIR__ . '/../api/v2/config/Ml.php';
require_once __DIR__ . '/../api/v2/services/MlService.php';
require_once __DIR__ . '/../api/v2/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../api/v2/controllers/EquipoController.php';
