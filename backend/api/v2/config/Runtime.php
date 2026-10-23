<?php

class V2Detener extends RuntimeException
{
}

function v2Detener(): never
{
    if (!empty($GLOBALS['V2_SIN_EXIT'])) {
        throw new V2Detener();
    }
    exit;
}

function v2CuerpoRaw(): string
{
    if (array_key_exists('V2_CUERPO_PRUEBA', $GLOBALS)) {
        return (string) $GLOBALS['V2_CUERPO_PRUEBA'];
    }
    $raw = file_get_contents('php://input');
    return $raw === false ? '' : $raw;
}
