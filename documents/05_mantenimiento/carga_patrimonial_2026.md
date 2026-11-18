# Carga patrimonial 2026

Registro de la carga aplicada el **17 de noviembre de 2026** sobre `gestion_equipos_mpa_v2`. Versión de producto: **0.11.0**.

Fuente: `bienes patrimoniales 2026.XLS` (hoja única, 2111 filas, 41 columnas, sin encabezados). Solo entró el parque de cómputo y red. El resto del inventario municipal (muebles, vehículos, radios, proyectores y similares) no se cargó.

La plantilla **Carga Excel** del sistema no se usó. Esa plantilla solo acepta Laptop, CPU, Impresora, Monitor y Otro, y al guardar reemplaza ubicación y responsable con los del área. La carga municipal se insertó directo en MySQL, en UTF-8, para conservar el tipo, la oficina y el nombre del encargado.

Antes de insertar se vaciaron equipos, áreas, fichas, mantenimientos y predicciones de prueba. Se conservaron los 3 usuarios (`admin`, `Jfernandez`, `Dnavarro`) y las 5 gerencias. Las áreas nuevas quedaron sin gerencia (`gerencia_id` nulo).

## Resultado

| Concepto | Cantidad |
|----------|----------:|
| Equipos | 756 |
| Áreas | 47, todas con jefe |
| Usuarios del sistema | 3 (sin cambios) |
| Fichas con procesador o sistema operativo | 16 |
| Equipos sin código identificativo | 34 |
| Operativo / Dañado | 568 / 188 |
| Conservación Nuevo / Bueno / Regular / Malo | 2 / 283 / 283 / 188 |

| Tipo | Equipos |
|------|--------:|
| Impresora | 148 |
| Estabilizador | 112 |
| Teclado | 102 |
| Monitor | 100 |
| CPU | 97 |
| Laptop | 72 |
| Equipo de audio | 47 |
| Cámara | 27 |
| Switch | 17 |
| Escáner | 9 |
| Access point | 7 |
| Mouse | 6 |
| UPS | 6 |
| Disco externo | 3 |
| Router | 3 |

Impresora incluye multifuncional, fotocopiadora y plotter. Equipo de audio incluye megáfono, micrófono, parlante, consola, mezcladora, amplificador, audífonos y grabadora. Cámara incluye fotográfica, de video y circuito cerrado. No entraron instrumentos, radios, trípodes ni proyectores.

## De qué columna sale cada dato

Las columnas se numeran desde 0, como en el archivo sin encabezados.

| Dato en el sistema | Columna del Excel | Regla |
|--------------------|-------------------|--------|
| Código patrimonial | 0 | 12 dígitos. Es único. |
| Tipo | 1 (denominación) | Según la tabla de tipos de arriba. |
| Área | 3 (dependencia) | Nombre del área. No se usa la ubicación física como área. |
| Encargado del equipo | 4 (responsable) | `responsable_nombre`. No crea usuario. |
| Fecha de adquisición | 7 | Años 1980 a 2026. La columna 9 es otra fecha y no se usó. |
| Costo | 8 | Solo si es mayor que 0. |
| Ubicación física | 13 | Oficina, almacén o ambiente. Máximo 150 caracteres. |
| Código identificativo | 17 | Numérico, completado a 6 dígitos. Si falta, queda vacío. No se inventa. |
| Modelo | 18 | Máximo 50 caracteres. |
| Marca | 26 | Vacío si dice SIN MARCA, S/M o N/A. |
| Conservación | 28 | Nuevo, Bueno, Regular o Malo. «Chatarra» (1 bien) quedó como Malo. |
| Serie | 33 | Vacío si dice S/S, S/N o 0. |
| Color | 38, y si no alcanza la 20 | Solo un color conocido (Negro, Blanco, Gris, etc.). |
| Observación técnica | 39 | Texto libre. De aquí salen RAM, disco, procesador y sistema cuando el texto es claro. |

No se usaron: sede (columna 2, todas dicen SEDE PRINCIPAL), proveedor, cuenta contable, tipo de ingreso, valor depreciado, código de entidad ni las notas SIAF.

La columna 5 es el usuario del bien. A menudo coincide con el responsable y a veces es otra persona. El encargado guardado es el de la columna 4.

## Estado operativo

Si la conservación es **Malo**, el estado operativo es **Dañado**. Nuevo, Bueno y Regular quedaron **Operativo**. El bien en chatarra sigue esa misma regla (Malo y Dañado).

## Jefe del área y encargado del equipo

Son dos datos distintos.

- **Jefe a cargo** (`v2_areas.jefe_encargado`): una persona por área. Es quien figura como responsable en la mayor parte de los bienes de esa dependencia en el Excel completo, no solo en los equipos de cómputo.
- **Encargado del equipo** (`v2_equipos.responsable_nombre`): la persona de la columna 4 de esa fila. Sigue en el equipo aunque no sea el jefe del área.

Dos casos para no mezclar:

- **HUILLCAMIZA PEREZ ANTONIO GIL** es jefe de Oficina de Secretaría General y también de Unidad de Trámite Documentario y Archivo.
- **Unidad de Obras:** el jefe del área es **RIVEROS IZARRA NOEMI BELINDA** (74 bienes en el Excel). De los equipos de cómputo de esa área, 12 quedaron a nombre de **BELITO CHOCCE JHON FRANCO** y 3 a nombre de Riveros.

En Administración Tributaria hay una fila escrita «RUFINO AUQUI MANUELO». El jefe del área es **AUQUI MANUELO RUFINO**, que es la forma usada en las otras 40 filas. El texto de esa fila no se reescribió.

## Hardware que sí se copió

Solo en Laptop y CPU, y solo cuando el texto no deja dos lecturas posibles. La observación del bien (columna 39) manda sobre el título del catálogo (columna 1).

- RAM en GB, como máximo 256. Si junto a «RAM» o «MEMORIA» aparecen dos cantidades en GB distintas, no se guarda RAM.
- Los MB solo se aceptan si son 1024, 2048, 4096, 8192 o 16384.
- Almacenamiento en GB, como máximo 8192. «1 TB» equivale a 1024 GB.
- Tipo de disco solo si el texto dice NVMe, SSD o disco duro / HDD. Si no lo dice, queda vacío. El formulario de la ficha muestra «SSD» como primera opción de la lista; no hay que guardarlo si el Excel no lo decía.
- Procesador: Core i3, i5, i7 o i9 (también si el Excel escribe «COER»), Pentium IV y Celeron. «INTEL» solo, o «3.4 GHz» solo, no se tomó como procesador.
- Sistema operativo solo si el texto nombra Windows 7, 8, 8.1, 10 u 11, Linux o macOS.
- No se interpretó «S/T», un cargador suelto ni códigos ambiguos.

Ejemplo revisado: el CPU `740899500181` (Lenovo ThinkCentre M80S) tiene RAM 16 GB, Core i7 y Windows 10 por su observación. El almacenamiento 1024 GB sale del título, porque la observación no indica disco. Su conservación es Bueno y su estado es Operativo. Área ALCALDE, encargado MENDIETA LANDEO CARLOS MIGUEL, identificativo 000744.

Se creó fila en `v2_fichas_tecnicas` solo cuando hubo procesador o sistema operativo (16 fichas). El número de orden y la fecha de la hoja 2026 se completan al evaluar; la carga no les inventó un N°.
