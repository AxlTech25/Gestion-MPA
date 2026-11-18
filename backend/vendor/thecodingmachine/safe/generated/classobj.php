<?php

// Compat local: XAMPP PHP 8.0 no carga los shims 8.1; sabberworm necesita Safe\class_alias.
if (str_starts_with(PHP_VERSION, "8.0.")) {
    require_once __DIR__ . '/8.1/classobj.php';
}
if (str_starts_with(PHP_VERSION, "8.1.")) {
    require_once __DIR__ . '/8.1/classobj.php';
}
if (str_starts_with(PHP_VERSION, "8.2.")) {
    require_once __DIR__ . '/8.1/classobj.php';
}
if (str_starts_with(PHP_VERSION, "8.3.")) {
    require_once __DIR__ . '/8.1/classobj.php';
}
if (str_starts_with(PHP_VERSION, "8.4.")) {
    require_once __DIR__ . '/8.1/classobj.php';
}
if (str_starts_with(PHP_VERSION, "8.5.")) {
    require_once __DIR__ . '/8.1/classobj.php';
}
if (str_starts_with(PHP_VERSION, "8.6.")) {
    require_once __DIR__ . '/8.1/classobj.php';
}
