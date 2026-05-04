<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Test directo de los endpoints V2
$tests = [];

// Test 1: Conexión a BD
try {
    require_once __DIR__ . '/api/v2/config/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    $tests['bd_conexion'] = 'OK';
} catch(Exception $e) {
    $tests['bd_conexion'] = 'ERROR: ' . $e->getMessage();
}

// Test 2: Tabla v2_areas existe y tiene columna jefe_encargado
try {
    $stmt = $conn->query("DESCRIBE v2_areas");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $tests['v2_areas_columnas'] = $cols;
    $tests['jefe_encargado_existe'] = in_array('jefe_encargado', $cols) ? 'SÍ' : 'NO - FALTA COLUMNA';
} catch(Exception $e) {
    $tests['v2_areas'] = 'ERROR: ' . $e->getMessage();
}

// Test 3: INSERT de prueba en áreas
try {
    $stmt = $conn->prepare("INSERT INTO v2_areas (nombre, jefe_encargado, descripcion) VALUES (:n, :j, :d)");
    $n = 'TEST_AREA_' . time();
    $j = 'Test Jefe';
    $d = 'Prueba';
    $stmt->bindParam(':n', $n);
    $stmt->bindParam(':j', $j);
    $stmt->bindParam(':d', $d);
    $stmt->execute();
    $id = $conn->lastInsertId();
    // Limpieza
    $conn->exec("DELETE FROM v2_areas WHERE id = $id");
    $tests['insert_area'] = 'OK - ID fue: ' . $id;
} catch(Exception $e) {
    $tests['insert_area'] = 'ERROR: ' . $e->getMessage();
}

// Test 4: Tabla v2_usuarios - columnas
try {
    $stmt = $conn->query("DESCRIBE v2_usuarios");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $tests['v2_usuarios_columnas'] = $cols;
} catch(Exception $e) {
    $tests['v2_usuarios'] = 'ERROR: ' . $e->getMessage();
}

// Test 5: INSERT de prueba en usuarios (sin area_id)
try {
    $stmt = $conn->prepare("INSERT INTO v2_usuarios (nombre_completo, usuario, password_hash, rol) VALUES (:n, :u, :p, :r)");
    $n = 'Test User';
    $u = 'testuser_' . time();
    $p = password_hash('test123', PASSWORD_DEFAULT);
    $r = 'Tecnico';
    $stmt->bindParam(':n', $n);
    $stmt->bindParam(':u', $u);
    $stmt->bindParam(':p', $p);
    $stmt->bindParam(':r', $r);
    $stmt->execute();
    $id = $conn->lastInsertId();
    $conn->exec("DELETE FROM v2_usuarios WHERE id = $id");
    $tests['insert_usuario'] = 'OK - ID fue: ' . $id;
} catch(Exception $e) {
    $tests['insert_usuario'] = 'ERROR: ' . $e->getMessage();
}

echo json_encode($tests, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
