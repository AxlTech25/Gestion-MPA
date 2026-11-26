<?php
/**
 * One-shot: rota contraseñas de todos los usuarios en v2_usuarios.
 *
 * Uso:
 *   php backend/tools/reset_user_passwords.php
 *   php backend/tools/reset_user_passwords.php --json=passwords.local.json
 *
 * El JSON opcional es un mapa { "admin": "ClaveFuerte...", ... }.
 * Sin JSON, genera claves ≥16 caracteres.
 *
 * Imprime usuario → password SOLO en consola. No escriba el resultado en Git.
 */
require_once __DIR__ . '/../api/v2/config/Database.php';

const PASS_LEN = 18;

function generarPassword(int $len = PASS_LEN): string {
    $upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    $lower = 'abcdefghijkmnopqrstuvwxyz';
    $digits = '23456789';
    $symbols = '!@#$%&*+-?=';
    $all = $upper . $lower . $digits . $symbols;

    $chars = [
        $upper[random_int(0, strlen($upper) - 1)],
        $lower[random_int(0, strlen($lower) - 1)],
        $digits[random_int(0, strlen($digits) - 1)],
        $symbols[random_int(0, strlen($symbols) - 1)],
    ];
    for ($i = count($chars); $i < $len; $i++) {
        $chars[] = $all[random_int(0, strlen($all) - 1)];
    }
    shuffle($chars);
    return implode('', $chars);
}

/** @return array<string, string> */
function cargarMapaCli(array $argv): array {
    foreach ($argv as $arg) {
        if (str_starts_with($arg, '--json=')) {
            $path = substr($arg, 7);
            if (!is_file($path)) {
                fwrite(STDERR, "No existe el archivo JSON: {$path}\n");
                exit(1);
            }
            $raw = file_get_contents($path);
            $data = json_decode((string) $raw, true);
            if (!is_array($data)) {
                fwrite(STDERR, "JSON inválido en {$path}\n");
                exit(1);
            }
            $out = [];
            foreach ($data as $user => $pass) {
                if (!is_string($user) || !is_string($pass) || $pass === '') {
                    continue;
                }
                $out[$user] = $pass;
            }
            return $out;
        }
    }
    return [];
}

$mapa = cargarMapaCli($argv);
$conn = (new Database())->getConnection();

$rows = $conn->query('SELECT id, usuario, nombre_completo, rol FROM v2_usuarios ORDER BY id')
    ->fetchAll(PDO::FETCH_ASSOC);

if ($rows === []) {
    echo "No hay usuarios en v2_usuarios.\n";
    exit(0);
}

$update = $conn->prepare('UPDATE v2_usuarios SET password_hash = :hash WHERE id = :id');

echo "=== Rotación de contraseñas ===\n";
echo "Guarde este listado fuera del repositorio.\n\n";

foreach ($rows as $row) {
    $usuario = (string) $row['usuario'];
    $plain = $mapa[$usuario] ?? generarPassword();
    if (strlen($plain) < 8) {
        fwrite(STDERR, "Contraseña demasiado corta para {$usuario}; se omite.\n");
        continue;
    }
    $hash = password_hash($plain, PASSWORD_DEFAULT);
    $update->execute([':hash' => $hash, ':id' => (int) $row['id']]);
    echo sprintf(
        "%s\t%s\t%s\t%s\n",
        $usuario,
        $plain,
        (string) $row['rol'],
        (string) $row['nombre_completo']
    );
}

echo "\nListo. Verifique el login y elimine cualquier copia temporal del listado.\n";
