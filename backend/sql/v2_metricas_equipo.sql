-- Fase 2 Sprint 7: series temporales de telemetría por equipo (HU-ML-007)
-- Ejecutar en phpMyAdmin o: mysql -u root gestion_equipos_mpa_v2 < backend/sql/v2_metricas_equipo.sql

CREATE TABLE IF NOT EXISTS `v2_metricas_equipo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipo_id` int(11) NOT NULL,
  `mantenimiento_id` int(11) DEFAULT NULL,
  `horas_uso` int(11) DEFAULT NULL,
  `errores_smart` int(11) DEFAULT NULL,
  `contador_paginas` int(11) DEFAULT NULL,
  `salud_bateria` decimal(5,2) DEFAULT NULL,
  `temp_cpu` decimal(5,2) DEFAULT NULL,
  `temp_disco` decimal(5,2) DEFAULT NULL,
  `nivel_polvo` enum('Bajo','Medio','Alto','Critico') DEFAULT NULL,
  `registrado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_metricas_equipo` (`equipo_id`),
  KEY `idx_metricas_mantenimiento` (`mantenimiento_id`),
  CONSTRAINT `fk_metricas_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `v2_equipos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_metricas_mantenimiento` FOREIGN KEY (`mantenimiento_id`) REFERENCES `v2_fichas_mantenimiento` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
