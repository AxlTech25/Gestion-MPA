<?php
require_once __DIR__ . '/../api/v2/config/Ml.php';

$url = MlConfig::getServiceUrl() . '/predict/riesgo/batch';
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, MlConfig::getTimeoutSeconds());

$start = microtime(true);
$response = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);
$elapsed = round(microtime(true) - $start, 2);

echo "URL: $url\n";
echo "Elapsed: {$elapsed}s\n";
echo "HTTP: $code\n";
echo "Curl error: " . ($error ?: 'none') . "\n";

if ($response) {
    $data = json_decode($response, true);
    echo "JSON error: " . json_last_error_msg() . "\n";
    echo "Count: " . (is_array($data) ? count($data) : 'not array') . "\n";
    if (is_array($data) && count($data) > 0) {
        usort($data, fn($a, $b) => ($b['score_riesgo'] ?? 0) <=> ($a['score_riesgo'] ?? 0));
        echo "Top score: " . $data[0]['score_riesgo'] . " (" . $data[0]['nivel_riesgo'] . ")\n";
    }
} else {
    echo "Empty response\n";
}
