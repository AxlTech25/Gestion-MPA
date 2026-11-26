-- Seed simulado (NO datos reales municipales).
-- Códigos patrimoniales ficticios: 450000000001 …
-- Áreas genéricas de una municipalidad de ejemplo.
-- Usuarios: admin / tecnico / practicante (claves fuertes; ver railway.md tras deploy).

INSERT INTO v2_gerencias (id, nombre, orden) VALUES
  (1, 'Gerencia Municipal', 1),
  (2, 'Gerencia de Administración y Finanzas', 2),
  (3, 'Gerencia de Desarrollo Social', 3),
  (4, 'Gerencia de Infraestructura', 4)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), orden = VALUES(orden);

INSERT INTO v2_areas (id, nombre, jefe_encargado, descripcion, gerencia_id) VALUES
  (1, 'Oficina de Tecnología de la Información', 'Carla Ríos', 'Sistemas, redes y soporte', 2),
  (2, 'Unidad de Contabilidad', 'Pedro Salas', 'Registro contable municipal', 2),
  (3, 'Unidad de Tesorería', 'María Quispe', 'Caja y pagos', 2),
  (4, 'Secretaría General', 'Rosa Huamán', 'Trámite documentario', 1),
  (5, 'Oficina de Recursos Humanos', 'Jorge Paredes', 'Personal y legajos', 2),
  (6, 'Unidad de Logística', 'Elena Vargas', 'Almacén y adquisiciones', 2),
  (7, 'Oficina de Atención al Ciudadano', 'Luis Torres', 'Mesa de partes y orientación', 3),
  (8, 'Oficina de Obras Públicas', 'Miguel Castro', 'Obras y mantenimiento urbano', 4)
ON DUPLICATE KEY UPDATE
  jefe_encargado = VALUES(jefe_encargado),
  descripcion = VALUES(descripcion),
  gerencia_id = VALUES(gerencia_id);

-- bcrypt de claves fuertes (no usar admin123 ni DemoMPA)
INSERT INTO v2_usuarios (id, nombre_completo, usuario, password_hash, rol, area_id) VALUES
  (1, 'Administrador Sistema', 'admin', '$2y$10$CKByWNv42qlfDtFY2r7jXeiBuUBRXFxskFoOtK0QG0PCTO2LymwQC', 'Administrador', 1),
  (2, 'Técnico de Soporte', 'tecnico', '$2y$10$hUx.FNvyG5C4oDmpC57nM.G/dYjQK4gkIqoUpFXpFLGNDyNurtKbm', 'Tecnico', 1),
  (3, 'Practicante TI', 'practicante', '$2y$10$n43vubHh.6v8G.SmKb2Lx.wa2oM0Iv8sLAkFAqMbW6vagJn395wy6', 'Practicante', 1)
ON DUPLICATE KEY UPDATE
  nombre_completo = VALUES(nombre_completo),
  password_hash = VALUES(password_hash),
  rol = VALUES(rol),
  area_id = VALUES(area_id);

INSERT INTO v2_equipos (
  id, codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo, color,
  numero_serie, ram_gb, almacenamiento_gb, tipo_disco, fecha_adquisicion, costo_estimado,
  ubicacion_fisica, area_id, responsable_nombre, estado_conservacion, estado_operativo
) VALUES
  (1,  '450000000001', '000001', 'Laptop', 'Lenovo', 'ThinkPad E14', 'Negro', 'SN-SIM-LT-001', 16, 512, 'SSD', '2023-03-15', 3200.00, 'Oficina TI — mesa 1', 1, 'Carla Ríos', 'Bueno', 'Operativo'),
  (2,  '450000000002', '000002', 'Laptop', 'HP', 'ProBook 450', 'Gris', 'SN-SIM-LT-002', 8, 256, 'SSD', '2024-01-20', 2800.00, 'Oficina TI — mesa 2', 1, 'Jorge Paredes', 'Nuevo', 'Operativo'),
  (3,  '450000000003', '000003', 'Laptop', 'Dell', 'Latitude 3420', 'Negro', 'SN-SIM-LT-003', 16, 512, 'NVMe', '2022-07-08', 3500.00, 'Secretaría General', 4, 'Rosa Huamán', 'Bueno', 'Operativo'),
  (4,  '450000000004', '000004', 'Laptop', 'Acer', 'Aspire 5', 'Plata', 'SN-SIM-LT-004', 8, 512, 'SSD', '2021-11-12', 2400.00, 'RR.HH. jefatura', 5, 'Jorge Paredes', 'Regular', 'En Reparacion'),
  (5,  '450000000005', '000005', 'Laptop', 'Lenovo', 'V15', 'Negro', 'SN-SIM-LT-005', 8, 256, 'SSD', '2023-09-01', 2100.00, 'Atención al ciudadano', 7, 'Luis Torres', 'Bueno', 'Operativo'),
  (6,  '450000000006', '000006', 'CPU', 'Dell', 'OptiPlex 7090', 'Negro', 'SN-SIM-CPU-001', 8, 256, 'SSD', '2022-08-01', 2600.00, 'Contabilidad mesa 1', 2, 'Pedro Salas', 'Bueno', 'Operativo'),
  (7,  '450000000007', '000007', 'CPU', 'HP', 'ProDesk 400', 'Negro', 'SN-SIM-CPU-002', 8, 500, 'HDD', '2020-01-20', 1800.00, 'Contabilidad mesa 2', 2, 'Pedro Salas', 'Regular', 'Dañado'),
  (8,  '450000000008', '000008', 'CPU', 'Lenovo', 'ThinkCentre M70', 'Negro', 'SN-SIM-CPU-003', 16, 512, 'SSD', '2023-06-18', 2900.00, 'Tesorería caja', 3, 'María Quispe', 'Bueno', 'Operativo'),
  (9,  '450000000009', '000009', 'CPU', 'HP', 'EliteDesk 800', 'Negro', 'SN-SIM-CPU-004', 16, 512, 'SSD', '2024-03-05', 3100.00, 'Logística almacén', 6, 'Elena Vargas', 'Nuevo', 'Operativo'),
  (10, '450000000010', '000010', 'CPU', 'Dell', 'Vostro 3681', 'Negro', 'SN-SIM-CPU-005', 8, 1000, 'HDD', '2019-05-14', 1500.00, 'Obras — sala técnica', 8, 'Miguel Castro', 'Regular', 'Operativo'),
  (11, '450000000011', '000011', 'CPU', 'Lenovo', 'IdeaCentre', 'Negro', 'SN-SIM-CPU-006', 8, 256, 'SSD', '2022-02-28', 2000.00, 'Secretaría — archivo', 4, 'Rosa Huamán', 'Bueno', 'Operativo'),
  (12, '450000000012', '000012', 'Monitor', 'Samsung', '24"', 'Negro', 'SN-SIM-MON-001', NULL, NULL, NULL, '2022-05-12', 450.00, 'TI sala servidores', 1, 'Carla Ríos', 'Bueno', 'Operativo'),
  (13, '450000000013', '000013', 'Monitor', 'LG', '22"', 'Negro', 'SN-SIM-MON-002', NULL, NULL, NULL, '2021-04-03', 380.00, 'Contabilidad mesa 1', 2, 'Pedro Salas', 'Bueno', 'Operativo'),
  (14, '450000000014', '000014', 'Monitor', 'Dell', 'P2419H', 'Negro', 'SN-SIM-MON-003', NULL, NULL, NULL, '2023-01-19', 520.00, 'Tesorería', 3, 'María Quispe', 'Bueno', 'Operativo'),
  (15, '450000000015', '000015', 'Monitor', 'HP', '22y', 'Negro', 'SN-SIM-MON-004', NULL, NULL, NULL, '2020-09-30', 320.00, 'RR.HH.', 5, 'Jorge Paredes', 'Regular', 'Operativo'),
  (16, '450000000016', '000016', 'Impresora', 'Epson', 'L3250', 'Negro', 'SN-SIM-IMP-001', NULL, NULL, NULL, '2023-11-05', 890.00, 'Recepción Contabilidad', 2, 'Pedro Salas', 'Bueno', 'Operativo'),
  (17, '450000000017', '000017', 'Impresora', 'HP', 'LaserJet M404', 'Blanco', 'SN-SIM-IMP-002', NULL, NULL, NULL, '2022-10-11', 1200.00, 'Secretaría General', 4, 'Rosa Huamán', 'Bueno', 'Operativo'),
  (18, '450000000018', '000018', 'Impresora', 'Brother', 'HL-L2350', 'Negro', 'SN-SIM-IMP-003', NULL, NULL, NULL, '2021-08-22', 750.00, 'Mesa de partes', 7, 'Luis Torres', 'Regular', 'Dañado'),
  (19, '450000000019', '000019', 'Impresora', 'Epson', 'EcoTank L14150', 'Negro', 'SN-SIM-IMP-004', NULL, NULL, NULL, '2024-02-14', 2100.00, 'Logística', 6, 'Elena Vargas', 'Nuevo', 'Operativo'),
  (20, '450000000020', '000020', 'Impresora', 'Canon', 'imageCLASS MF445', 'Blanco', 'SN-SIM-IMP-005', NULL, NULL, NULL, '2023-05-07', 1600.00, 'Obras públicas', 8, 'Miguel Castro', 'Bueno', 'Operativo'),
  (21, '450000000021', '000021', 'Teclado', 'Logitech', 'K120', 'Negro', 'SN-SIM-TEC-001', NULL, NULL, NULL, '2022-01-15', 45.00, 'Contabilidad', 2, 'Pedro Salas', 'Bueno', 'Operativo'),
  (22, '450000000022', '000022', 'Teclado', 'Microsoft', 'Wired 600', 'Negro', 'SN-SIM-TEC-002', NULL, NULL, NULL, '2021-06-01', 55.00, 'Tesorería', 3, 'María Quispe', 'Bueno', 'Operativo'),
  (23, '450000000023', '000023', 'Mouse', 'Logitech', 'M90', 'Negro', 'SN-SIM-MOU-001', NULL, NULL, NULL, '2022-01-15', 25.00, 'Contabilidad', 2, 'Pedro Salas', 'Bueno', 'Operativo'),
  (24, '450000000024', '000024', 'Estabilizador', 'Forza', 'FVR-1202', 'Negro', 'SN-SIM-EST-001', NULL, NULL, NULL, '2020-03-18', 180.00, 'TI rack', 1, 'Carla Ríos', 'Bueno', 'Operativo'),
  (25, '450000000025', '000025', 'Estabilizador', 'CDP', 'R-AVR1008', 'Negro', 'SN-SIM-EST-002', NULL, NULL, NULL, '2019-12-02', 150.00, 'Secretaría', 4, 'Rosa Huamán', 'Regular', 'Operativo'),
  (26, '450000000026', '000026', 'UPS', 'APC', 'BV650', 'Negro', 'SN-SIM-UPS-001', NULL, NULL, NULL, '2023-04-21', 420.00, 'TI sala servidores', 1, 'Carla Ríos', 'Bueno', 'Operativo'),
  (27, '450000000027', '000027', 'Switch', 'TP-Link', 'TL-SG1024D', 'Negro', 'SN-SIM-SW-001', NULL, NULL, NULL, '2021-02-09', 680.00, 'TI rack principal', 1, 'Carla Ríos', 'Bueno', 'Operativo'),
  (28, '450000000028', '000028', 'Access point', 'Ubiquiti', 'UAP-AC-Lite', 'Blanco', 'SN-SIM-AP-001', NULL, NULL, NULL, '2022-11-30', 350.00, 'Patio municipal', 1, 'Carla Ríos', 'Bueno', 'Operativo'),
  (29, '450000000029', '000029', 'Router', 'Mikrotik', 'hAP ac2', 'Blanco', 'SN-SIM-RT-001', NULL, NULL, NULL, '2021-07-16', 290.00, 'TI rack', 1, 'Carla Ríos', 'Bueno', 'Operativo'),
  (30, '450000000030', '000030', 'Escáner', 'Epson', 'DS-530', 'Negro', 'SN-SIM-ESC-001', NULL, NULL, NULL, '2023-08-25', 980.00, 'Mesa de partes', 7, 'Luis Torres', 'Bueno', 'Operativo'),
  (31, '450000000031', '000031', 'Laptop', 'HP', '250 G8', 'Gris', 'SN-SIM-LT-006', 8, 256, 'SSD', '2022-04-10', 2300.00, 'Gerencia Municipal', 4, 'Rosa Huamán', 'Bueno', 'Operativo'),
  (32, '450000000032', '000032', 'CPU', 'HP', '280 G5', 'Negro', 'SN-SIM-CPU-007', 8, 256, 'SSD', '2023-12-01', 2200.00, 'Atención ventanilla 2', 7, 'Luis Torres', 'Nuevo', 'Operativo'),
  (33, '450000000033', '000033', 'Monitor', 'Samsung', '27"', 'Negro', 'SN-SIM-MON-005', NULL, NULL, NULL, '2024-01-08', 780.00, 'Oficina TI', 1, 'Carla Ríos', 'Nuevo', 'Operativo'),
  (34, '450000000034', '000034', 'Impresora', 'HP', 'DeskJet 2775', 'Blanco', 'SN-SIM-IMP-006', NULL, NULL, NULL, '2020-06-19', 400.00, 'RR.HH. archivo', 5, 'Jorge Paredes', 'Malo', 'Dañado'),
  (35, '450000000035', '000035', 'CPU', 'Dell', 'OptiPlex 3080', 'Negro', 'SN-SIM-CPU-008', 16, 512, 'SSD', '2024-05-02', 3000.00, 'Obras — jefatura', 8, 'Miguel Castro', 'Nuevo', 'Operativo')
ON DUPLICATE KEY UPDATE
  marca = VALUES(marca),
  modelo = VALUES(modelo),
  estado_operativo = VALUES(estado_operativo),
  estado_conservacion = VALUES(estado_conservacion),
  area_id = VALUES(area_id),
  responsable_nombre = VALUES(responsable_nombre),
  ubicacion_fisica = VALUES(ubicacion_fisica);

INSERT INTO v2_fichas_tecnicas (
  equipo_id, numero_ficha, procesador, sistema_operativo, licencia_so,
  mac_address, ip_asignada, software_base, funcionamiento,
  obsolescencia_tecnologica, repuestos_disponibles, resultado_evaluacion,
  diagnostico, observaciones_evaluacion, fecha_evaluacion
) VALUES
  (1, 'FT-SIM-001', 'Intel Core i5-1235U', 'Windows 11 Pro', 'OEM',
   'AA:BB:CC:11:22:01', '10.0.1.11', 'Office 365; Antivirus institucional', 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'Equipo en buen estado. Sin alertas SMART.', 'Revisión rutinaria TI.', '2026-03-10 10:00:00'),
  (2, 'FT-SIM-002', 'Intel Core i5-1135G7', 'Windows 11 Pro', 'OEM',
   'AA:BB:CC:11:22:02', '10.0.1.12', 'Office 365', 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'Laptop reciente, rendimiento adecuado.', NULL, '2026-04-02 11:30:00'),
  (3, 'FT-SIM-003', 'Intel Core i5-10210U', 'Windows 11 Pro', 'Retail',
   'AA:BB:CC:11:22:03', '10.0.2.21', 'Office 2019', 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'Uso administrativo normal.', NULL, '2026-02-18 09:15:00'),
  (4, 'FT-SIM-004', 'AMD Ryzen 5 5500U', 'Windows 10 Pro', 'OEM',
   'AA:BB:CC:11:22:04', '10.0.3.14', 'Office 365', 'Con fallas',
   'No', 'Si', 'Requiere reparación',
   'Sobrecalentamiento y ventilador ruidoso. En taller.', 'Pendiente cambio de pasta térmica.', '2026-05-20 16:00:00'),
  (6, 'FT-SIM-005', 'Intel Core i5-10500', 'Windows 10 Pro', 'OEM',
   'AA:BB:CC:11:22:06', '10.0.2.31', 'Office 365; SIAP', 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'PC de contabilidad estable.', NULL, '2026-01-22 14:20:00'),
  (7, 'FT-SIM-006', 'Intel Core i3-9100', 'Windows 10 Pro', 'OEM',
   'AA:BB:CC:11:22:07', '10.0.2.32', 'Office 2016', 'Con fallas',
   'Si', 'No', 'Se recomienda retirar del servicio',
   'Disco HDD con sectores defectuosos. Lentitud extrema.', 'Candidato a baja o reposición.', '2026-06-01 08:45:00'),
  (8, 'FT-SIM-007', 'Intel Core i5-12400', 'Windows 11 Pro', 'OEM',
   'AA:BB:CC:11:22:08', '10.0.2.41', 'Office 365; Sistema de caja', 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'Equipo de tesorería OK.', NULL, '2026-03-28 13:10:00'),
  (16, 'FT-SIM-008', NULL, NULL, NULL,
   NULL, '10.0.2.50', NULL, 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'Impresora multifuncional operativa. Contador normal.', NULL, '2026-04-15 10:40:00'),
  (17, 'FT-SIM-009', NULL, NULL, NULL,
   NULL, '10.0.4.12', NULL, 'Sin fallas',
   'No', 'Si', 'Requiere mantenimiento',
   'Atascos ocasionales de papel. Limpieza pendiente.', NULL, '2026-05-05 09:00:00'),
  (18, 'FT-SIM-010', NULL, NULL, NULL,
   NULL, NULL, NULL, 'Con fallas',
   'Si', 'No', 'Requiere reparación',
   'No enciende / error de fusor (simulado).', 'Equipo dañado en mesa de partes.', '2026-05-28 15:30:00'),
  (31, 'FT-SIM-011', 'Intel Core i5-1135G7', 'Windows 11 Home', 'OEM',
   'AA:BB:CC:11:22:31', '10.0.4.5', 'Office 365', 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'Laptop de gerencia sin observaciones.', NULL, '2026-02-10 12:00:00'),
  (35, 'FT-SIM-012', 'Intel Core i7-12700', 'Windows 11 Pro', 'OEM',
   'AA:BB:CC:11:22:35', '10.0.8.2', 'Office 365; AutoCAD viewer', 'Sin fallas',
   'No', 'Si', 'Puede continuar en servicio',
   'Equipo nuevo de obras.', NULL, '2026-05-12 11:00:00')
ON DUPLICATE KEY UPDATE
  procesador = VALUES(procesador),
  sistema_operativo = VALUES(sistema_operativo),
  funcionamiento = VALUES(funcionamiento),
  obsolescencia_tecnologica = VALUES(obsolescencia_tecnologica),
  repuestos_disponibles = VALUES(repuestos_disponibles),
  resultado_evaluacion = VALUES(resultado_evaluacion),
  diagnostico = VALUES(diagnostico),
  observaciones_evaluacion = VALUES(observaciones_evaluacion),
  fecha_evaluacion = VALUES(fecha_evaluacion);

-- Categorías de falla: 1 preventivo, 4 red, 6 sobrecalentamiento, 8 disco, etc. (v2_estructura)
INSERT INTO v2_fichas_mantenimiento (
  id, nro_orden, equipo_id, fecha_intervencion, tecnico_id, tipo_mantenimiento,
  categoria_falla_id, sintoma_usuario, causa_raiz, componente_principal,
  nivel_polvo, temperatura_cpu, diagnostico_texto, actividades_realizadas,
  piezas_reemplazadas, costo_reparacion, estado_post_mantenimiento
) VALUES
  (1, 'OM-2026-0001', 1, '2025-11-12 10:00:00', 2, 'Preventivo',
   1, 'Limpieza programada', 'Suciedad acumulada', 'Ventilación',
   'Medio', 48.5, 'Preventivo semestral.', 'Limpieza interna, actualización de SO y antivirus.',
   NULL, 0.00, 'Operativo'),
  (2, 'OM-2026-0002', 6, '2026-01-15 09:30:00', 2, 'Preventivo',
   1, 'Mantenimiento de rutina', NULL, 'Gabinete',
   'Bajo', 42.0, 'Sin fallas detectadas.', 'Limpieza y revisión de cables.',
   NULL, 0.00, 'Operativo'),
  (3, 'OM-2026-0003', 7, '2026-02-20 14:00:00', 2, 'Correctivo',
   8, 'PC muy lenta / cuelga al abrir Excel', 'Sectores defectuosos en HDD', 'Disco duro',
   'Alto', 55.0, 'SMART con errores. Se recomienda SSD.', 'Respaldo de datos; diagnóstico de disco.',
   NULL, 0.00, 'Dañado'),
  (4, 'OM-2026-0004', 4, '2026-05-18 11:20:00', 2, 'Correctivo',
   6, 'Se apaga solo / muy caliente', 'Pasta térmica seca; polvo en disipador', 'Ventilador CPU',
   'Alto', 78.0, 'Sobrecalentamiento confirmado.', 'Limpieza profunda; cambio de pasta térmica.',
   'Pasta térmica', 25.00, 'Operativo'),
  (5, 'OM-2026-0005', 8, '2026-03-05 16:45:00', 2, 'Preventivo',
   1, 'Revisión de caja', NULL, 'Gabinete',
   'Bajo', 40.0, 'OK.', 'Limpieza y prueba de impresión de tickets.',
   NULL, 0.00, 'Operativo'),
  (6, 'OM-2026-0006', 16, '2026-04-08 10:10:00', 2, 'Preventivo',
   1, 'Mantenimiento impresora', 'Tóner / cabezal', 'Impresora',
   'Medio', NULL, 'Contador normal.', 'Limpieza de rodillos y prueba de página.',
   NULL, 0.00, 'Operativo'),
  (7, 'OM-2026-0007', 17, '2026-05-06 09:50:00', 2, 'Correctivo',
   3, 'Atasco de papel frecuente', 'Rodillos gastados', 'Alimentador',
   'Medio', NULL, 'Atascos en bandeja 1.', 'Limpieza de rodillos; ajuste de bandeja.',
   NULL, 40.00, 'Operativo'),
  (8, 'OM-2026-0008', 18, '2026-05-29 13:00:00', 2, 'Correctivo',
   9, 'No enciende', 'Posible falla de fuente/fusor', 'Fuente',
   'Bajo', NULL, 'Equipo no responde. Pendiente repuesto.', 'Diagnóstico inicial; baja temporal de uso.',
   NULL, 0.00, 'Dañado'),
  (9, 'OM-2026-0009', 2, '2026-04-22 15:15:00', 2, 'Preventivo',
   2, 'Actualización de SO', NULL, 'Software',
   'Bajo', 45.0, 'Parches de seguridad aplicados.', 'Windows Update y reinicio verificado.',
   NULL, 0.00, 'Operativo'),
  (10, 'OM-2026-0010', 27, '2026-03-01 08:30:00', 2, 'Preventivo',
   4, 'Revisión de switch de rack', NULL, 'Switch',
   'Bajo', NULL, 'Puertos OK, sin errores de enlace.', 'Inspección visual y prueba de ping.',
   NULL, 0.00, 'Operativo'),
  (11, 'OM-2026-0011', 1, '2026-06-10 10:30:00', 2, 'Predictivo',
   1, 'Alerta de riesgo medio (simulado)', NULL, 'Sistema',
   'Bajo', 50.0, 'Seguimiento post-alerta ML.', 'Revisión de logs y temperatura.',
   NULL, 0.00, 'Operativo'),
  (12, 'OM-2026-0012', 35, '2026-05-20 12:00:00', 2, 'Evaluacion',
   1, 'Puesta en servicio', NULL, 'CPU',
   'Bajo', 38.0, 'Equipo nuevo verificado.', 'Imagen institucional e ingreso a dominio (simulado).',
   NULL, 0.00, 'Operativo')
ON DUPLICATE KEY UPDATE
  tipo_mantenimiento = VALUES(tipo_mantenimiento),
  categoria_falla_id = VALUES(categoria_falla_id),
  diagnostico_texto = VALUES(diagnostico_texto),
  actividades_realizadas = VALUES(actividades_realizadas),
  estado_post_mantenimiento = VALUES(estado_post_mantenimiento),
  fecha_intervencion = VALUES(fecha_intervencion);

UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-06-10', horas_uso = 4200, errores_smart = 0, ultima_temp_cpu = 50.0 WHERE id = 1;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-04-22', horas_uso = 1800, errores_smart = 0 WHERE id = 2;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-05-18', horas_uso = 5100, errores_smart = 2, salud_bateria = 72.5, ultima_temp_cpu = 78.0 WHERE id = 4;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-01-15', horas_uso = 6200, errores_smart = 0, ultima_temp_cpu = 42.0 WHERE id = 6;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-02-20', horas_uso = 9800, errores_smart = 12, ultima_temp_cpu = 55.0 WHERE id = 7;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-03-05', horas_uso = 3500, errores_smart = 0 WHERE id = 8;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-04-08', contador_paginas = 12500 WHERE id = 16;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-05-06', contador_paginas = 48200 WHERE id = 17;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-05-29', contador_paginas = 91000 WHERE id = 18;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-03-01' WHERE id = 27;
UPDATE v2_equipos SET fecha_ultimo_mantenimiento = '2026-05-20', horas_uso = 400, errores_smart = 0 WHERE id = 35;

INSERT INTO v2_tickets (
  id, codigo, gerencia_id, area_id, motivo, descripcion, solicitante_nombre, estado
) VALUES
  (1, 'TK-2026-0001', 2, 2, 'Problema de red / internet', 'PC de contabilidad sin acceso a intranet (dato simulado).', 'Pedro Salas', 'Abierto'),
  (2, 'TK-2026-0002', 2, 1, 'Software / aplicaciones', 'Solicitud de instalación de lector PDF (simulado).', 'Carla Ríos', 'En atencion'),
  (3, 'TK-2026-0003', 2, 3, 'Hardware', 'Impresora de tesorería atascada (simulado).', 'María Quispe', 'Abierto'),
  (4, 'TK-2026-0004', 4, 8, 'Otro', 'Solicitud de cable de red adicional (simulado).', 'Miguel Castro', 'Cerrado')
ON DUPLICATE KEY UPDATE
  motivo = VALUES(motivo),
  estado = VALUES(estado),
  descripcion = VALUES(descripcion);
