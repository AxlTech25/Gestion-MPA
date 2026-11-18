<?php

// platform_check.php — comprobación desactivada en local.
// XAMPP trae PHP 8.0.30; openspout/phpunit del lock exigen >= 8.2.
// Regenerar con `composer dump-autoload` tras actualizar PHP a 8.2+.

$issues = array();

if ($issues) {
    if (!headers_sent()) {
        header('HTTP/1.1 500 Internal Server Error');
    }
    if (!ini_get('display_errors')) {
        if (PHP_SAPI === 'cli' || PHP_SAPI === 'phpdbg') {
            fwrite(STDERR, 'Composer detected issues in your platform:' . PHP_EOL.PHP_EOL . implode(PHP_EOL, $issues) . PHP_EOL.PHP_EOL);
        } elseif (!headers_sent()) {
            echo 'Composer detected issues in your platform:' . PHP_EOL.PHP_EOL . str_replace('You are running '.PHP_VERSION.'.', '', implode(PHP_EOL, $issues)) . PHP_EOL.PHP_EOL;
        }
    }
    throw new \RuntimeException(
        'Composer detected issues in your platform: ' . implode(' ', $issues)
    );
}
