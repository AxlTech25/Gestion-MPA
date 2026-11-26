-- Seed demo (opción A): pocos datos para mostrar inventario sin el dump municipal.
-- Idempotente con INSERT IGNORE / ON DUPLICATE KEY.
-- Usuario demo: admin / DemoMPA2026!Segura  (rotar en producción real)
-- Técnico: tecnico / DemoMPA2026!Segura

INSERT INTO v2_gerencias (id, nombre, orden) VALUES
  (1, 'Gerencia de Administración', 1),
  (2, 'Gerencia de Planeamiento y Presupuesto', 2)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), orden = VALUES(orden);

INSERT INTO v2_areas (id, nombre, jefe_encargado, descripcion, gerencia_id) VALUES
  (1, 'Tecnología de la Información', 'Admin Demo', 'Área de sistemas y soporte técnico', 2),
  (2, 'Unidad de Contabilidad', 'Luis Contador', 'Contabilidad municipal (demo)', 1),
  (3, 'Unidad de Tesorería', 'Ana Tesoro', 'Tesorería (demo)', 1)
ON DUPLICATE KEY UPDATE
  jefe_encargado = VALUES(jefe_encargado),
  descripcion = VALUES(descripcion),
  gerencia_id = VALUES(gerencia_id);

-- password_hash de DemoMPA2026!Segura (bcrypt)
INSERT INTO v2_usuarios (id, nombre_completo, usuario, password_hash, rol, area_id) VALUES
  (1, 'Administrador Demo', 'admin', '$2y$10$EKtVVHpArFNmqW0WT/RxCOOcdu74e2EDmhXkvS3DoZkGBobL.XZgC', 'Administrador', 1),
  (2, 'Técnico Demo', 'tecnico', '$2y$10$EKtVVHpArFNmqW0WT/RxCOOcdu74e2EDmhXkvS3DoZkGBobL.XZgC', 'Tecnico', 1)
ON DUPLICATE KEY UPDATE
  nombre_completo = VALUES(nombre_completo),
  password_hash = VALUES(password_hash),
  rol = VALUES(rol),
  area_id = VALUES(area_id);

INSERT INTO v2_equipos (
  id, codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo, color,
  numero_serie, ram_gb, almacenamiento_gb, tipo_disco, fecha_adquisicion,
  ubicacion_fisica, area_id, responsable_nombre, estado_conservacion, estado_operativo
) VALUES
  (1, '740000000001', 'LT-DEMO-01', 'Laptop', 'Lenovo', 'ThinkPad E14', 'Negro',
   'SN-LT-001', 16, 512, 'SSD', '2023-03-15', 'Oficina TI', 1, 'Admin Demo', 'Bueno', 'Operativo'),
  (2, '740000000002', 'CPU-DEMO-01', 'CPU', 'Dell', 'OptiPlex 7090', 'Negro',
   'SN-CPU-001', 8, 256, 'SSD', '2022-08-01', 'Contabilidad mesa 1', 2, 'Luis Contador', 'Bueno', 'Operativo'),
  (3, '740000000003', 'CPU-DEMO-02', 'CPU', 'HP', 'ProDesk 400', 'Negro',
   'SN-CPU-002', 8, 500, 'HDD', '2020-01-20', 'Contabilidad mesa 2', 2, 'Luis Contador', 'Regular', 'Dañado'),
  (4, '740000000004', 'LT-DEMO-02', 'Laptop', 'HP', 'ProBook 450', 'Gris',
   'SN-LT-002', 8, 256, 'SSD', '2024-02-10', 'Tesorería', 3, 'Ana Tesoro', 'Nuevo', 'Operativo'),
  (5, '740000000005', 'IMP-DEMO-01', 'Impresora', 'Epson', 'L3250', 'Negro',
   'SN-IMP-001', NULL, NULL, NULL, '2023-11-05', 'Recepción Contabilidad', 2, 'Luis Contador', 'Bueno', 'Operativo'),
  (6, '740000000006', 'MON-DEMO-01', 'Monitor', 'Samsung', '24"', 'Negro',
   'SN-MON-001', NULL, NULL, NULL, '2022-05-12', 'TI sala servidores', 1, 'Admin Demo', 'Bueno', 'Operativo'),
  (7, '740000000007', 'LT-DEMO-03', 'Laptop', 'Acer', 'Aspire 5', 'Plata',
   'SN-LT-003', 16, 512, 'NVMe', '2021-09-01', 'Planeamiento', 1, 'Técnico Demo', 'Regular', 'En Reparacion'),
  (8, '740000000008', 'CPU-DEMO-03', 'CPU', 'Lenovo', 'ThinkCentre', 'Negro',
   'SN-CPU-003', 16, 512, 'SSD', '2023-06-18', 'Tesorería caja', 3, 'Ana Tesoro', 'Bueno', 'Operativo')
ON DUPLICATE KEY UPDATE
  marca = VALUES(marca),
  modelo = VALUES(modelo),
  estado_operativo = VALUES(estado_operativo),
  area_id = VALUES(area_id);

INSERT INTO v2_fichas_tecnicas (equipo_id, numero_ficha, procesador, sistema_operativo, funcionamiento, resultado_evaluacion, fecha_evaluacion)
VALUES
  (1, 'FT-DEMO-001', 'Intel Core i5-1235U', 'Windows 11 Pro', 'Operativo', 'Apto', NOW()),
  (2, 'FT-DEMO-002', 'Intel Core i5-10500', 'Windows 10 Pro', 'Operativo', 'Apto', NOW())
ON DUPLICATE KEY UPDATE
  procesador = VALUES(procesador),
  sistema_operativo = VALUES(sistema_operativo);

INSERT INTO v2_tickets (
  id, codigo, gerencia_id, area_id, motivo, descripcion, solicitante_nombre, estado
) VALUES
  (1, 'TK-2026-0001', 1, 2, 'Problema de red / internet', 'PC no tiene acceso a intranet (dato demo).', 'Luis', 'Abierto'),
  (2, 'TK-2026-0002', 2, 1, 'Software / aplicaciones', 'Solicitud de instalación de PDF reader (demo).', 'Ana', 'En atencion')
ON DUPLICATE KEY UPDATE
  motivo = VALUES(motivo),
  estado = VALUES(estado);
