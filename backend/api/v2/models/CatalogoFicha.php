<?php

class CatalogoFicha {
    public const CATEGORIAS = ['procesador', 'sistema_operativo', 'software', 'tipo_impresora'];

    private PDO $conn;

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function listar(?string $categoria = null): array {
        if ($categoria !== null) {
            if (!in_array($categoria, self::CATEGORIAS, true)) {
                return [];
            }
            $stmt = $this->conn->prepare(
                'SELECT categoria, valor, es_predefinido
                 FROM v2_catalogo_ficha
                 WHERE categoria = :categoria
                 ORDER BY es_predefinido DESC, valor ASC'
            );
            $stmt->execute(['categoria' => $categoria]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $filas = $this->conn->query(
            'SELECT categoria, valor, es_predefinido
             FROM v2_catalogo_ficha
             ORDER BY categoria ASC, es_predefinido DESC, valor ASC'
        )->fetchAll(PDO::FETCH_ASSOC);

        $agrupado = [];
        foreach (self::CATEGORIAS as $cat) {
            $agrupado[$cat] = [];
        }
        foreach ($filas as $fila) {
            $agrupado[$fila['categoria']][] = [
                'valor' => $fila['valor'],
                'es_predefinido' => (int) $fila['es_predefinido'] === 1,
            ];
        }
        return $agrupado;
    }

    public function eliminar(string $categoria, ?string $valor): array {
        if (!in_array($categoria, self::CATEGORIAS, true)) {
            return ['ok' => false, 'code' => 400, 'message' => 'Categoría de catálogo no válida.'];
        }
        $texto = trim((string) $valor);
        if ($texto === '') {
            return ['ok' => false, 'code' => 400, 'message' => 'Indique el valor a eliminar.'];
        }

        $stmt = $this->conn->prepare(
            'SELECT es_predefinido FROM v2_catalogo_ficha
             WHERE categoria = :categoria AND valor = :valor
             LIMIT 1'
        );
        $stmt->execute(['categoria' => $categoria, 'valor' => $texto]);
        $fila = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$fila) {
            return ['ok' => false, 'code' => 404, 'message' => 'Ese valor no está en el catálogo.'];
        }
        if ((int) $fila['es_predefinido'] === 1) {
            return ['ok' => false, 'code' => 409, 'message' => 'No se puede eliminar un valor predefinido del catálogo.'];
        }

        $borrar = $this->conn->prepare(
            'DELETE FROM v2_catalogo_ficha WHERE categoria = :categoria AND valor = :valor AND es_predefinido = 0'
        );
        $borrar->execute(['categoria' => $categoria, 'valor' => $texto]);
        return ['ok' => true, 'code' => 200, 'message' => 'Valor eliminado del catálogo.'];
    }

    public function registrar(string $categoria, ?string $valor): ?string {
        if (!in_array($categoria, self::CATEGORIAS, true)) {
            return null;
        }
        $texto = trim((string) $valor);
        if ($texto === '') {
            return null;
        }
        if (mb_strlen($texto) > 120) {
            $texto = mb_substr($texto, 0, 120);
        }
        $driver = $this->conn->getAttribute(PDO::ATTR_DRIVER_NAME);
        $sql = $driver === 'sqlite'
            ? 'INSERT OR IGNORE INTO v2_catalogo_ficha (categoria, valor, es_predefinido)
               VALUES (:categoria, :valor, 0)'
            : 'INSERT IGNORE INTO v2_catalogo_ficha (categoria, valor, es_predefinido)
               VALUES (:categoria, :valor, 0)';
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['categoria' => $categoria, 'valor' => $texto]);
        return $texto;
    }

    /**
     * @param list<string> $valores
     * @return list<string>
     */
    public function registrarVarios(string $categoria, array $valores): array {
        $limpios = [];
        foreach ($valores as $valor) {
            $texto = $this->registrar($categoria, is_string($valor) ? $valor : null);
            if ($texto !== null) {
                $limpios[] = $texto;
            }
        }
        return array_values(array_unique($limpios));
    }

    public static function partirSoftware(?string $bloque): array {
        if ($bloque === null || trim($bloque) === '') {
            return [];
        }
        $partes = preg_split('/\s*\|\s*|\r\n|\n|\r/', $bloque) ?: [];
        $limpios = [];
        foreach ($partes as $parte) {
            $texto = trim((string) $parte);
            if ($texto !== '') {
                $limpios[] = $texto;
            }
        }
        return array_values(array_unique($limpios));
    }

    public static function unirSoftware(array $valores): ?string {
        $limpios = [];
        foreach ($valores as $valor) {
            $texto = trim((string) $valor);
            if ($texto !== '') {
                $limpios[] = $texto;
            }
        }
        $limpios = array_values(array_unique($limpios));
        return $limpios === [] ? null : implode(' | ', $limpios);
    }
}
