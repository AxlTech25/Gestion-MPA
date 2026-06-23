-- Vista de extracción para Dataset A (riesgo por equipo)
-- Uso: SELECT * FROM v2_ml_equipos_features;

USE gestion_equipos_mpa_v2;

CREATE OR REPLACE VIEW v2_ml_equipos_features AS
SELECT
    e.id AS equipo_id,
    e.codigo_patrimonial,
    e.tipo_equipo,
    e.marca,
    e.modelo,
    e.ram_gb,
    e.almacenamiento_gb,
    e.tipo_disco,
    e.fecha_adquisicion,
    TIMESTAMPDIFF(MONTH, e.fecha_adquisicion, CURDATE()) AS antiguedad_meses,
    e.estado_conservacion,
    e.estado_operativo,
    e.area_id,
    a.nombre AS area_nombre,
    COUNT(fm.id) AS total_mantenimientos,
    SUM(CASE
        WHEN fm.tipo_mantenimiento = 'Correctivo'
         AND fm.fecha_intervencion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        THEN 1 ELSE 0
    END) AS correctivos_12m,
    SUM(CASE
        WHEN fm.tipo_mantenimiento = 'Preventivo'
         AND fm.fecha_intervencion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        THEN 1 ELSE 0
    END) AS preventivos_12m,
    DATEDIFF(NOW(), MAX(fm.fecha_intervencion)) AS dias_desde_ultimo_mantenimiento,
    COALESCE(MAX(
        CASE cf.severidad
            WHEN 'Baja' THEN 1 WHEN 'Media' THEN 2 WHEN 'Alta' THEN 3 WHEN 'Critica' THEN 4 ELSE 0
        END
    ), 0) AS severidad_max_historica,
    SUM(CASE
        WHEN cf.severidad IN ('Alta', 'Critica')
         AND fm.fecha_intervencion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        THEN 1 ELSE 0
    END) AS fallas_altas_criticas_12m
FROM v2_equipos e
LEFT JOIN v2_areas a ON e.area_id = a.id
LEFT JOIN v2_fichas_mantenimiento fm ON fm.equipo_id = e.id
LEFT JOIN v2_categorias_falla cf ON fm.categoria_falla_id = cf.id
GROUP BY e.id, e.codigo_patrimonial, e.tipo_equipo, e.marca, e.modelo,
         e.ram_gb, e.almacenamiento_gb, e.tipo_disco, e.fecha_adquisicion,
         e.estado_conservacion, e.estado_operativo, e.area_id, a.nombre;
