<?php
require_once __DIR__ . '/../api/v2/config/Ml.php';

$url = MlConfig::getServiceUrl() . '/health';
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Health URL: $url\n";
echo "HTTP: $code\n";
echo "Error: " . ($error ?: 'none') . "\n";
echo "Response: " . substr((string) $response, 0, 200) . "\n";
