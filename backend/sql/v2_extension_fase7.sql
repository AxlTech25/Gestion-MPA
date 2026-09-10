-- ============================================================
-- Sprint 7 — Fase 1: Extensión ML predictivo
-- Extender v2_equipos y v2_fichas_mantenimiento
-- Ejecutar sobre: gestion_equipos_mpa_v2
-- ============================================================

USE gestion_equipos_mpa_v2;

-- ------------------------------------------------------------
-- A. v2_equipos — telemetría y snapshot
-- ------------------------------------------------------------

ALTER TABLE v2_equipos
  ADD COLUMN IF NOT EXISTS horas_uso INT NOT NULL DEFAULT 0
    COMMENT 'Horas de uso acumuladas' AFTER tipo_disco,
  ADD COLUMN IF NOT EXISTS errores_smart INT NOT NULL DEFAULT 0
    COMMENT 'Conteo errores SMART del disco' AFTER horas_uso,
  ADD COLUMN IF NOT EXISTS contador_paginas INT NULL DEFAULT NULL
    COMMENT 'Páginas impresas (impresoras)' AFTER errores_smart,
  ADD COLUMN IF NOT EXISTS salud_bateria DECIMAL(5,2) NULL DEFAULT NULL
    COMMENT 'Porcentaje salud batería 0-100 (laptops)' AFTER contador_paginas,
  ADD COLUMN IF NOT EXISTS ultima_temp_cpu DECIMAL(5,2) NULL DEFAULT NULL
    COMMENT 'Última temperatura CPU en °C' AFTER salud_bateria,
  ADD COLUMN IF NOT EXISTS ultima_temp_disco DECIMAL(5,2) NULL DEFAULT NULL
    COMMENT 'Última temperatura disco en °C' AFTER ultima_temp_cpu,
  ADD COLUMN IF NOT EXISTS fecha_ultimo_mantenimiento DATE NULL DEFAULT NULL
    COMMENT 'Fecha última intervención registrada' AFTER ultima_temp_disco;

-- MySQL < 8.0.12 no soporta IF NOT EXISTS en ADD COLUMN.
-- Si falla, usar migrate_fase7.php que verifica columna por columna.

-- Ampliar estado_operativo (requiere redefinir ENUM completo)
ALTER TABLE v2_equipos
  MODIFY COLUMN estado_operativo
    ENUM('Operativo', 'Dañado', 'En Reparacion', 'Excedencia', 'Baja')
    NOT NULL DEFAULT 'Operativo';

-- ------------------------------------------------------------
-- B. v2_fichas_mantenimiento — contexto de intervención
-- ------------------------------------------------------------

ALTER TABLE v2_fichas_mantenimiento
  ADD COLUMN IF NOT EXISTS sintoma_usuario TEXT NULL
    COMMENT 'Reporte del usuario' AFTER categoria_falla_id,
  ADD COLUMN IF NOT EXISTS causa_raiz VARCHAR(150) NULL DEFAULT NULL
    COMMENT 'Causa raíz identificada' AFTER sintoma_usuario,
  ADD COLUMN IF NOT EXISTS componente_principal VARCHAR(100) NULL DEFAULT NULL
    COMMENT 'Componente afectado: Disco, Batería, Fuser, etc.' AFTER causa_raiz,
  ADD COLUMN IF NOT EXISTS nivel_polvo ENUM('Bajo', 'Medio', 'Alto', 'Critico') NULL DEFAULT NULL
    COMMENT 'Nivel de polvo observado' AFTER componente_principal,
  ADD COLUMN IF NOT EXISTS temperatura_cpu DECIMAL(5,2) NULL DEFAULT NULL
    COMMENT 'Temperatura CPU °C en intervención' AFTER nivel_polvo,
  ADD COLUMN IF NOT EXISTS temperatura_disco DECIMAL(5,2) NULL DEFAULT NULL
    COMMENT 'Temperatura disco °C en intervención' AFTER temperatura_cpu,
  ADD COLUMN IF NOT EXISTS horas_uso_acumuladas INT NULL DEFAULT NULL
    COMMENT 'Lectura horas de uso al momento' AFTER temperatura_disco,
  ADD COLUMN IF NOT EXISTS salud_bateria_pct DECIMAL(5,2) NULL DEFAULT NULL
    COMMENT 'Salud batería % al momento' AFTER horas_uso_acumuladas,
  ADD COLUMN IF NOT EXISTS contador_paginas_lectura INT NULL DEFAULT NULL
    COMMENT 'Contador páginas al momento (impresoras)' AFTER salud_bateria_pct,
  ADD COLUMN IF NOT EXISTS tiempo_inactividad_min INT NOT NULL DEFAULT 0
    COMMENT 'Minutos fuera de servicio' AFTER contador_paginas_lectura;

-- Ampliar tipo_mantenimiento
ALTER TABLE v2_fichas_mantenimiento
  MODIFY COLUMN tipo_mantenimiento
    ENUM('Preventivo', 'Correctivo', 'Predictivo', 'Evaluacion')
    NOT NULL;

-- Extender estado_operativo para evaluaciones con causales específicas
ALTER TABLE v2_equipos
  MODIFY COLUMN estado_operativo
    ENUM('DAÑO','ESTADO DE EXCEDENCIA','ESTADO DE CHATARRA','MANTENIMIENTO O REPARACION','ONEROSA','OBSOLESCENCIA TECNICA','RAEE','Operativo','Dañado','En Reparacion','Excedencia','Baja')
    NOT NULL DEFAULT 'Operativo';

-- Agregar campos de diagnóstico y fotos a la ficha técnica
ALTER TABLE v2_fichas_tecnicas
  ADD COLUMN IF NOT EXISTS diagnostico TEXT NULL
    COMMENT 'Diagnóstico técnico de la evaluación' AFTER observaciones_evaluacion,
  ADD COLUMN IF NOT EXISTS conclusion_motivo TEXT NULL
    COMMENT 'Conclusión o motivo de la evaluación' AFTER diagnostico,
  ADD COLUMN IF NOT EXISTS imagen_1 VARCHAR(255) NULL DEFAULT NULL
    COMMENT 'Nombre de archivo de imagen 1' AFTER conclusion_motivo,
  ADD COLUMN IF NOT EXISTS imagen_2 VARCHAR(255) NULL DEFAULT NULL
    COMMENT 'Nombre de archivo de imagen 2' AFTER imagen_1;

-- Numeración correlativa global de fichas técnicas, independiente del tipo de equipo
ALTER TABLE v2_fichas_tecnicas
  ADD COLUMN IF NOT EXISTS numero_ficha VARCHAR(20) UNIQUE AFTER equipo_id;

-- Color identificativo del equipo
ALTER TABLE v2_equipos
  ADD COLUMN IF NOT EXISTS color VARCHAR(30) NULL AFTER modelo;

-- ------------------------------------------------------------
-- C. Índices útiles para consultas ML / reportes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_equipos_errores_smart ON v2_equipos (errores_smart);
CREATE INDEX IF NOT EXISTS idx_equipos_horas_uso ON v2_equipos (horas_uso);
CREATE INDEX IF NOT EXISTS idx_mant_componente ON v2_fichas_mantenimiento (componente_principal);
CREATE INDEX IF NOT EXISTS idx_mant_nivel_polvo ON v2_fichas_mantenimiento (nivel_polvo);
