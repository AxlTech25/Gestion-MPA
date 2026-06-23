<?php
require_once __DIR__ . '/../api/v2/controllers/MlController.php';

$start = microtime(true);
ob_start();
$controller = new MlController();
$controller->alertas();
$output = ob_get_clean();
$elapsed = round(microtime(true) - $start, 2);

echo "Elapsed: {$elapsed}s\n";
echo "Output length: " . strlen($output) . "\n";
$data = json_decode($output, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo "JSON ERROR: " . json_last_error_msg() . "\n";
    echo substr($output, 0, 500) . "\n";
} else {
    echo "success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "count: " . count($data['data'] ?? []) . "\n";
    echo "message: " . ($data['message'] ?? '') . "\n";
}
