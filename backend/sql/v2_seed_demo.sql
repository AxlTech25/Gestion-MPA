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

INSERT INTO v2_fichas_tecnicas (equipo_id, numero_ficha, procesador, sistema_operativo, funcionamiento, resultado_evaluacion, fecha_evaluacion)
VALUES
  (1, 'FT-SIM-001', 'Intel Core i5-1235U', 'Windows 11 Pro', 'Operativo', 'Apto', NOW()),
  (2, 'FT-SIM-002', 'Intel Core i5-1135G7', 'Windows 11 Pro', 'Operativo', 'Apto', NOW()),
  (6, 'FT-SIM-003', 'Intel Core i5-10500', 'Windows 10 Pro', 'Operativo', 'Apto', NOW()),
  (7, 'FT-SIM-004', 'Intel Core i3-9100', 'Windows 10 Pro', 'Con fallas', 'No apto', NOW()),
  (8, 'FT-SIM-005', 'Intel Core i5-12400', 'Windows 11 Pro', 'Operativo', 'Apto', NOW())
ON DUPLICATE KEY UPDATE
  procesador = VALUES(procesador),
  sistema_operativo = VALUES(sistema_operativo),
  funcionamiento = VALUES(funcionamiento),
  resultado_evaluacion = VALUES(resultado_evaluacion);

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
