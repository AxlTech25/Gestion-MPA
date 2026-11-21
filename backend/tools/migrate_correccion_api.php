<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();
$daniado = "Da\u{00F1}ado";

$largoTipo = $conn->query(
    "SELECT CHARACTER_MAXIMUM_LENGTH
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'v2_equipos'
       AND COLUMN_NAME = 'tipo_equipo'"
)->fetchColumn();
if ((int) $largoTipo < 100) {
    $conn->exec('ALTER TABLE v2_equipos MODIFY tipo_equipo VARCHAR(100) NOT NULL');
    echo "tipo_equipo ampliado a VARCHAR(100).\n";
} else {
    echo "tipo_equipo ya admite 100 caracteres.\n";
}

$tipoSo = $conn->query(
    "SELECT DATA_TYPE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'v2_fichas_tecnicas'
       AND COLUMN_NAME = 'sistema_operativo'"
)->fetchColumn();
if ($tipoSo !== 'varchar') {
    $conn->exec('ALTER TABLE v2_fichas_tecnicas MODIFY sistema_operativo VARCHAR(100) NULL');
    echo "sistema_operativo pasó a VARCHAR(100).\n";
} else {
    echo "sistema_operativo ya es texto libre.\n";
}

$rotos = (int) $conn->query(
    "SELECT COUNT(*) FROM v2_equipos WHERE HEX(estado_operativo) = '4461F161646F'"
)->fetchColumn();
$definicion = (string) $conn->query(
    "SELECT HEX(COLUMN_TYPE)
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'v2_equipos'
       AND COLUMN_NAME = 'estado_operativo'"
)->fetchColumn();
$etiquetaRota = str_contains($definicion, '4461F161646F') || str_contains($definicion, '44613F61646F');

if ($rotos > 0 || $etiquetaRota) {
    $conn->exec('ALTER TABLE v2_equipos ADD COLUMN estado_operativo_fix VARCHAR(20) NULL');
    $marcar = $conn->prepare(
        "UPDATE v2_equipos
         SET estado_operativo_fix = CASE
             WHEN HEX(estado_operativo) = '4461F161646F' THEN :daniado
             ELSE estado_operativo
         END"
    );
    $marcar->bindValue(':daniado', $daniado);
    $marcar->execute();
    $conn->exec(
        "UPDATE v2_equipos SET estado_operativo = 'Operativo' WHERE HEX(estado_operativo) = '4461F161646F'"
    );
    $conn->exec(
        "ALTER TABLE v2_equipos
         MODIFY estado_operativo ENUM('Operativo','Dañado','En Reparacion','Excedencia','Baja')
         NOT NULL DEFAULT 'Operativo'"
    );
    $conn->exec('UPDATE v2_equipos SET estado_operativo = estado_operativo_fix WHERE estado_operativo_fix IS NOT NULL');
    $conn->exec('ALTER TABLE v2_equipos DROP COLUMN estado_operativo_fix');
    echo "Estado operativo reescrito en UTF-8. Filas dañadas: {$rotos}.\n";
} else {
    echo "Estado operativo ya está en UTF-8.\n";
}

$conn->exec(
    "ALTER TABLE v2_fichas_mantenimiento
     MODIFY estado_post_mantenimiento ENUM('Operativo','Dañado','Baja') NULL"
);
echo "Estado posterior al mantenimiento alineado.\n";

$quedan = (int) $conn->query(
    "SELECT COUNT(*) FROM v2_equipos WHERE estado_operativo = " . $conn->quote($daniado)
)->fetchColumn();
echo "Equipos dañados visibles para la API: {$quedan}.\n";
