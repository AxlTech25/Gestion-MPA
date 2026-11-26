<?php
header('Content-Type: application/json; charset=UTF-8');
http_response_code(200);
echo json_encode(['success' => true, 'service' => 'sigemad-api', 'ok' => true]);
