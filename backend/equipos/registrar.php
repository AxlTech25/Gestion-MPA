<?php
include_once '../config/db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) exit(json_encode(["status" => "error", "message" => "No hay datos"]));

// Extraer datos
$c_patrimonial = $conn->real_escape_string($data['codigo_patrimonial']);
$c_identificativo = $conn->real_escape_string($data['codigo_identificativo']);
$tipo = $conn->real_escape_string($data['tipo_equipo']);
$marca = $conn->real_escape_string($data['marca']);
$modelo = $conn->real_escape_string($data['modelo']);
$serie = $conn->real_escape_string($data['serie']);
$color = $conn->real_escape_string($data['color']);

// OJO: area_asignada y responsable_asignado en React ahora deben enviar IDs numéricos
$area_id = intval($data['area_asignada']); 
$responsable_id = intval($data['responsable_asignado']);

// Iniciar Transacción para asegurar que ambas tablas se guarden o ninguna
$conn->begin_transaction();

try {
    // 1. Validar Duplicados
    $check = $conn->query("SELECT id FROM v2_equipos WHERE codigo_patrimonial = '$c_patrimonial'");
    if ($check && $check->num_rows > 0) throw new Exception("El Código Patrimonial ya existe.");

    // Parseo de ram y disco (Limpiar "GB" de los textos enviados por React)
    $ram_num = isset($data['ram']) ? preg_replace('/[^0-9.]/', '', $data['ram']) : 'NULL'; 
    $disco_num = isset($data['disco_duro']) ? preg_replace('/[^0-9]/', '', $data['disco_duro']) : 'NULL'; 
    $ram_num = $ram_num === '' ? 'NULL' : $ram_num;
    $disco_num = $disco_num === '' ? 'NULL' : $disco_num;

    // 2. Insertar en tabla `v2_equipos`
    $sql_equipo = "INSERT INTO v2_equipos (codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo, numero_serie, ram_gb, almacenamiento_gb, area_id, responsable_id) 
                   VALUES ('$c_patrimonial', '$c_identificativo', '$tipo', '$marca', '$modelo', '$serie', $ram_num, $disco_num, $area_id, $responsable_id)";
    
    if (!$conn->query($sql_equipo)) throw new Exception("Error al guardar equipo: " . $conn->error);
    
    $equipo_id = $conn->insert_id; // Obtenemos el ID recién creado

    // 3. Insertar Hardware en v2_fichas_tecnicas (Si aplica)
    if (in_array($tipo, ['CPU', 'Laptop'])) {
        $proc = isset($data['procesador']) ? $conn->real_escape_string($data['procesador']) : '';
        $so = isset($data['sistema_operativo']) ? $conn->real_escape_string($data['sistema_operativo']) : '';
        
        $sql_specs = "INSERT INTO v2_fichas_tecnicas (equipo_id, procesador, sistema_operativo) 
                      VALUES ($equipo_id, '$proc', '$so')";
        
        if (!$conn->query($sql_specs)) throw new Exception("Error al guardar ficha técnica: " . $conn->error);
    }

    // Si todo salió bien, confirmamos la transacción
    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Equipo registrado correctamente en la nueva BD."]);

} catch (Exception $e) {
    // Si algo falló, revertimos todo
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>