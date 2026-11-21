# Sigemad MPA — Gestión de Equipos V2

Sistema web para el inventario patrimonial, fichas técnicas, mantenimiento y análisis predictivo de equipos de cómputo.

**Stack:** React (Vite) · PHP API REST · MySQL · FastAPI (ML)

**Metodología:** Prompt-Centered SDLC v1.2  
**Versión actual:** 0.11.5 (hoja técnica en una A4 y versiones en el reporte)

---

## Tabla de contenido

- [Requisitos e instalación](#requisitos-e-instalación)
- [Guía de uso del sistema](#guía-de-uso-del-sistema)
  - [Inicio de sesión](#1-inicio-de-sesión)
  - [Dashboard](#2-dashboard)
  - [Inventario](#3-inventario)
  - [Ficha técnica](#4-ficha-técnica)
  - [Mantenimiento](#5-mantenimiento)
  - [Cronograma](#6-cronograma)
  - [Configuración](#7-configuración)
  - [Alertas predictivas (ML)](#8-alertas-predictivas-ml)
  - [Reportes](#9-reportes)
- [Roles y credenciales](#roles-y-credenciales)
- [Documentación adicional](#documentación-adicional)
- [Desarrollo](#desarrollo)

El marco de trabajo es la propuesta **Prompt-Centered SDLC v1.2** (en validación con este sistema; no Scrum). Ver [`documents/metodologia.md`](documents/metodologia.md).

---

## Requisitos e instalación

### Requisitos

| Componente | Versión recomendada |
|------------|---------------------|
| XAMPP (Apache + MySQL + PHP) | PHP 8.1+ |
| Node.js | 18+ |
| Python (solo ML) | 3.10+ |

### Pasos rápidos (entorno local)

1. **Base de datos**
   - Crear la BD ejecutando `backend/sql/v2_estructura.sql`
   - Si actualizas desde una versión anterior, aplicar también:
     - `backend/sql/v2_extension_fase7.sql` (o `php backend/tools/migrate_fase7.php`)
     - `backend/sql/v2_ml_predicciones.sql`
     - `php backend/tools/migrate_cronograma.php` (Incremento 8)
     - `php backend/tools/migrate_gerencias.php` (0.10.7)
     - `php backend/tools/migrate_hoja_revision.php` (0.11.0, hoja de revisión técnica)
     - `php backend/tools/migrate_ficha_historial.php` (0.11.1, historial de la ficha)

2. **Backend PHP**
   ```bash
   cd backend
   composer install
   ```

3. **Frontend**
   ```bash
   npm install
   npm run dev
   ```

4. **Microservicio ML** (opcional, para badges de riesgo y sugerencias IA)
   ```bash
   cd ml
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

5. **Acceder**
   - Frontend: `http://localhost:5173`
   - API: `http://localhost/gestion_mpa/backend/api/v2`

---

## Guía de uso del sistema

### 1. Inicio de sesión

1. Abra la aplicación en el navegador.
2. Ingrese **usuario** y **contraseña**.
3. Tras un login correcto, el sistema lo lleva al **Dashboard**.

Si cierra sesión con el botón **Salir** (barra superior), deberá volver a autenticarse para acceder a cualquier módulo.

---

### 2. Dashboard

Vista general del parque tecnológico.

| Sección | Qué muestra |
|---------|-------------|
| Tarjetas superiores | Total de equipos, mantenimientos, áreas y equipos dañados |
| Gráficos | Distribución por estado operativo, tipo de equipo y área |
| Fallas por categoría | Tipos de falla más frecuentes en mantenimientos |
| Alertas predictivas | Top 10 equipos con mayor riesgo (requiere ML activo) |
| Mantenimientos recientes | Últimas intervenciones registradas |

#### Consultar equipos con etiquetas

1. Pulse **Consultar equipos**.
2. Seleccione una o más **etiquetas**:
   - **Tipo:** Laptop, CPU, Impresora, Monitor, Otro
     - **Otro** agrupa el resto del parque (teclado, cámara, estabilizador, audio, red, etc.). Escriba el nombre exacto del tipo para ver solo ese grupo.
   - **Estado operativo:** Operativo, Dañado, En reparación, Excedencia, Baja
   - **Conservación:** Nuevo, Bueno, Regular, Malo
3. La tabla inferior muestra los equipos que coinciden.

**Tipos personalizados (Otro):** al elegir la etiqueta **Otro**, aparece un campo de texto al lado. Escriba el tipo tal como está en el inventario (`Cámara`, `Teclado`, `Equipo de audio`) para refinar la búsqueda. Sin texto, se listan todos los equipos que no son Laptop, CPU, Impresora ni Monitor.

---

### 3. Inventario

Gestión del catálogo de equipos patrimoniales.

#### Buscar y filtrar

- Use el cuadro de búsqueda por **código patrimonial**, identificativo, marca o modelo.
- Combine con los filtros de **tipo** y **estado de conservación**. El filtro de tipo muestra los tipos que hay cargados (Laptop, CPU, Monitor, Impresora, Escáner, Teclado, Mouse, Estabilizador, Switch, Access point, UPS, Router, Disco externo, Cámara, Equipo de audio).
- La columna **Responsable** es el encargado de ese equipo. No es un usuario del sistema. El jefe del área se ve en Configuración.

#### Registrar un equipo nuevo

1. Pulse **Nuevo Equipo**.
2. Complete los campos obligatorios:
   - **Código patrimonial:** exactamente **12 dígitos numéricos**
   - **Área asignada**
   - **Tipo de equipo**
3. Si elige **Otro**, escriba el nombre del tipo (Teclado, Cámara, Escáner, etc.). El inventario guarda ese nombre.
4. Para **CPU/Laptop**, complete RAM, almacenamiento, procesador y SO.
5. Pulse **Registrar Equipo**.

#### Editar un equipo

1. En la columna **Acciones**, pulse el icono del **lápiz**.
2. Modifique los datos necesarios.
3. Pulse **Guardar cambios**.

#### Carga masiva (Excel)

1. Pulse **Carga Excel**.
2. Descargue la plantilla si no la tiene.
3. Complete el archivo y súbalo.
4. Revise el resumen de filas importadas y errores.

La plantilla sirve para altas nuevas de Laptop, CPU, Impresora, Monitor u Otro. El parque municipal de 2026 no entró por esta pantalla: se cargó aparte para conservar oficina, encargado y tipos como Teclado o Cámara. El detalle está en [`documents/05_mantenimiento/carga_patrimonial_2026.md`](documents/05_mantenimiento/carga_patrimonial_2026.md).

#### Acciones por fila

| Icono | Acción |
|-------|--------|
| Lápiz | Editar datos del equipo |
| Documento verde | Descargar **ficha técnica en PDF** |
| Engranaje | Abrir **ficha técnica** (evaluación detallada) |

La columna **Riesgo ML** muestra el nivel predictivo de cada equipo cuando el servicio ML está en ejecución.

---

### 4. Ficha técnica

Consulta y evaluación del estado de un equipo.

#### Buscar por código patrimonial

1. Vaya a **Ficha Técnica** en el menú.
2. Ingrese el **código patrimonial** (12 dígitos).
3. Pulse **Buscar Equipo**.

#### Evaluar un equipo

La ficha sigue la **Hoja de revisión técnica 2026**. En el panel puede:

- Ver datos generales: patrimonial, identificativo, marca, modelo, serie, área, responsable, ubicación, costo y fecha de adquisición.
- Editar el **N° de orden** y la **fecha**. Si deja el número en blanco, se conserva el que ya tenía o se asigna el siguiente. No puede repetir un número que ya usa otra ficha. La fecha vacía queda en el día de hoy. El PDF imprime esos dos datos, no la fecha del momento de imprimir.
- Registrar **estado físico** (Nuevo, Bueno, Regular, Malo), **funcionamiento** (Sin fallas / Con fallas), **obsolescencia tecnológica** (Sí / No), **repuestos disponibles** (Sí / No) y uno de estos **resultados**:
  - Puede continuar en servicio
  - Requiere mantenimiento
  - Requiere reparación
  - Técnicamente no resulta ser utilizado
  - Se recomienda retirar del servicio
- Escribir **diagnóstico** y **conclusión**.
- Adjuntar hasta dos fotos JPG o PNG.
- Pulse **Guardar Evaluación** para persistir los cambios. Cada guardado queda en **Historial de cambios**, con la persona, la fecha y el valor anterior y el nuevo. Si no cambió ningún dato, no se agrega una fila.
- Pulse **PDF** para exportar la hoja vigente. Sale en una página A4: datos generales en dos columnas; en CPU, laptop o PC, el hardware y el software al lado de la evaluación; diagnóstico y conclusión en la misma fila cuando ambos existen. Una foto ocupa el ancho de la hoja y dos se reparten a la mitad, siempre alineadas con el rótulo IMAGEN. La firma impresa es Tec. Denky Navarro Navarro, Técnico PAD. Las versiones anteriores de esa hoja se descargan desde Reportes.

**Hardware, software y red** (procesador, RAM, disco, sistema operativo, licencia, MAC e IP) solo aparecen en equipos cuyo tipo contiene CPU, laptop o PC. Un teclado, una impresora, una cámara o un equipo de audio no muestran esos apartados y, al guardar, no se les escribe procesador ni sistema operativo.

Si el disco no tenía tipo (HDD, SSD o NVMe), el selector queda vacío. Guardar sin elegir uno no le asigna SSD.

> La misma evaluación se abre desde el inventario (icono de engranaje).

---

### 5. Mantenimiento

Registro e historial de intervenciones técnicas.

#### Ver historial general

Al entrar al módulo se muestra una **línea de tiempo** con todas las intervenciones recientes, ordenadas por fecha.

#### Buscar historial de un equipo

1. En la sección superior, ingrese el **código patrimonial**.
2. Pulse **Buscar Historial**.
3. Verá el resumen del equipo y su cronología de mantenimientos.
4. Use **Ver todo** para volver al listado general.
5. Pulse **Exportar historial PDF** para descargar el reporte completo.

#### Registrar una intervención

1. Pulse **Registrar Intervención**.
2. Ingrese el **código patrimonial** — el sistema valida y muestra tipo y modelo del equipo.
3. Seleccione **tipo de mantenimiento:**
   - **Preventivo / Predictivo / Evaluación:** campos de telemetría según el tipo de equipo
   - **Correctivo:** síntoma, componente, causa raíz y sección de **reparación** (diagnóstico, piezas, costo)
4. Complete actividades realizadas y **estado posterior**.
5. Pulse **Guardar Ficha**.

#### Ver detalle de una intervención

En cualquier tarjeta del timeline, pulse **Ver detalle** para abrir el modal con información completa. Desde ahí puede exportar el **PDF** de esa ficha individual.

#### Campos según tipo de equipo

| Tipo | Campos visibles en el formulario |
|------|----------------------------------|
| Laptop / CPU | Polvo, temperaturas, horas de uso, batería, inactividad |
| Impresora | Contador de páginas |
| Monitor / Otro | Solo datos generales y actividades |

En mantenimiento **correctivo**, si el ML está activo, puede aparecer una **sugerencia de categoría de falla** basada en el historial del equipo.

---

### 6. Cronograma

Plan anual de preventivo **por área** (no sustituye el historial de fichas).

1. En el menú abra **Cronograma**. La primera vista es el **historial** de planes (puede haber varios en el mismo año).
2. Cree un plan (año + nombre) o abra uno existente.
3. En la matriz, un clic en un día laborable abre el selector **X1…Xn** (cuántos PC o laptop se atienden ese día). Las impresoras se cuentan en la tabla pero no entran en Xn.
4. El recuadro **HORA PROGRAMADA** lista las personas del preventivo, no los bienes del área.
5. **Imprimir PDF** descarga A4 apaisado (dos meses por hoja, lunes a viernes).
6. Si las áreas tienen gerencia, la matriz y el PDF muestran **bandas** de agrupación.
7. Un Practicante puede ver e imprimir; no marca ni elimina planes.

Marcar una celda **no** registra una ficha de mantenimiento.

---

### 7. Configuración

Panel de administración organizacional (requiere rol **Administrador** en UI y en API).

#### Pestaña Áreas

- Ver, crear, **editar y eliminar** áreas (no se elimina un área que tenga equipos).
- Cada área tiene un **jefe a cargo**. En la carga de 2026 ese nombre es el responsable principal de la dependencia. El encargado de un equipo puede ser otra persona y se ve en el inventario.
- Asignar cada área a una **gerencia** (selector; opcional). Las 47 áreas cargadas en 2026 quedaron sin gerencia.
- Las áreas aparecen en inventario y en el cronograma.

#### Pestaña Gerencias

- Catálogo de gerencias para agrupar el cronograma como el papel municipal.

#### Pestaña Personal

- Ver técnicos y usuarios del sistema.
- Registrar nuevo personal con usuario, contraseña, rol y área.
- Roles disponibles: **Administrador**, **Técnico**, **Practicante**.

---

### 8. Alertas predictivas (ML)

Funcionalidades que dependen del microservicio FastAPI en el puerto **8000**:

| Función | Dónde se ve |
|---------|-------------|
| Badge de riesgo por equipo | Inventario (columna Riesgo ML) |
| Top 10 equipos en riesgo | Dashboard → Alertas predictivas |
| Sugerencia de categoría de falla | Formulario de mantenimiento correctivo |

Si el servicio ML no está corriendo, el resto del sistema **sigue funcionando**; solo se omiten las alertas predictivas y se muestra un aviso informativo.

Para iniciar el servicio:

```bash
cd ml
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Más detalle en [`ml/README.md`](ml/README.md).

---

### 9. Reportes

Apartado para Administrador y Técnico. Cada botón descarga un PDF.

Hay dos bloques. En cada uno se puede pedir un equipo o un año.

| Bloque | Por equipo | Por año |
|--------|------------|---------|
| Fichas técnicas | Cada hoja de revisión que tuvo ese código, de la primera a la actual | La hoja vigente de cada equipo cuya fecha cae en el año elegido |
| Fichas de mantenimiento | Cada ficha de mantenimiento de ese código | Las fichas de mantenimiento registradas en el año elegido |

El año se elige en un menú. Si el código no existe, no se descarga el archivo y la pantalla muestra «Equipo no encontrado». Un año sin fichas sí genera el PDF, con el aviso. El reporte por equipo reconstruye cada guardado como una hoja completa; la lista de antes y después sigue viéndose al pie de la ficha, no como tabla en el PDF. Una ficha que nunca se volvió a guardar sale en una sola hoja.

El PDF de una sola ficha de mantenimiento sigue descargándose desde el detalle de la intervención. Desde la búsqueda de Mantenimiento, «Exportar fichas PDF» adjunta las fichas de mantenimiento de ese equipo.

---

## Roles y credenciales

### Usuario por defecto (desarrollo)

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Rol | Administrador |

> Cambie estas credenciales en entornos de producción.

### Permisos por rol

| Módulo | Administrador | Técnico | Practicante |
|--------|:-------------:|:-------:|:-----------:|
| Dashboard | ✓ | ✓ | ✓ |
| Inventario (ver/registrar) | ✓ | ✓ | ✓ |
| Inventario (editar) | ✓ | ✓ | — |
| Ficha técnica | ✓ | ✓ | — |
| Mantenimiento | ✓ | ✓ | — |
| Cronograma (ver / imprimir) | ✓ | ✓ | ✓ |
| Cronograma (marcar / crear / borrar) | ✓ | ✓ | — |
| Configuración | ✓ | — | — |
| Carga masiva Excel | ✓ | — | — |
| Reportes | ✓ | ✓ | — |

La API refuerza lo mismo: `POST`/`PUT`/`PATCH`/`DELETE` `/usuarios` responden **403** si el token no es de Administrador. No basta con ocultar botones en la interfaz.

---

## Despliegue en producción

Guía completa: [`documents/05_mantenimiento/produccion.md`](documents/05_mantenimiento/produccion.md)

### Resumen rápido

```bash
# 1. Backend — dependencias y configuración
cd backend
composer install --no-dev
cp api/v2/config/local.example.php api/v2/config/local.php
# Editar local.php con credenciales MySQL de producción

# 2. Frontend — compilar para producción
cd ..
cp .env.production.example .env.production
# Editar: VITE_API_BASE_URL=/backend/api/v2  y  VITE_BASE_PATH=/
npm install
npm run build

# 3. Copiar al DocumentRoot del servidor
#    - Contenido de dist/  →  raíz del sitio
#    - Carpeta backend/    →  {DocumentRoot}/backend/
```

4. Importe `backend/sql/v2_estructura.sql` (instalación nueva) o ejecute las migraciones pendientes (`migrate_fase7.php`, `migrate_cronograma.php`, `migrate_gerencias.php`, `migrate_hoja_revision.php`, `migrate_ficha_historial.php`) sobre la BD existente.  
5. Active SSL y cambie la contraseña del usuario `admin`.

> Si FastAPI no está desplegado, deje `ml_service_url` vacío. El resto del sistema funciona con normalidad.

---

## Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [`documents/metodologia.md`](documents/metodologia.md) | Propuesta SDLC centrada en prompts (validación vs Scrum) |
| [`documents/desarrollo_softwareIA/`](documents/desarrollo_softwareIA/) | Libros y artículos del estado del arte |
| [`documents/README.md`](documents/README.md) | Índice por fases del ciclo de vida |
| [`prompts/`](prompts/) | Repositorio de prompts por fase |
| [`documents/05_mantenimiento/produccion.md`](documents/05_mantenimiento/produccion.md) | Guía de despliegue en producción |
| [`documents/05_mantenimiento/changelog.md`](documents/05_mantenimiento/changelog.md) | Historial de versiones |
| [`documents/05_mantenimiento/carga_patrimonial_2026.md`](documents/05_mantenimiento/carga_patrimonial_2026.md) | Reglas y conteos de la carga municipal 2026 |
| [`documents/01_requisitos/historias_usuario/`](documents/01_requisitos/historias_usuario/) | Historias de usuario por épica |
| [`documents/04_testing/`](documents/04_testing/) | Planes de pruebas funcionales y unitarias |
| [`documents/06_calidad/`](documents/06_calidad/) | Pruebas estáticas (SonarQube) y no conformidades |
| [`documents/ISO/plantillas/`](documents/ISO/plantillas/) | Plantillas ISO 9001 (macroproceso, procedimiento, actividad) |
| [`documents/03_implementacion/incrementos/`](documents/03_implementacion/incrementos/) | Incrementos de implementación |
| [`ml/README.md`](ml/README.md) | Microservicio ML y entrenamiento |
| [`documents/entregables/Manual_Sigemad_MPA.pdf`](documents/entregables/Manual_Sigemad_MPA.pdf) | Documentación técnica y manual de usuario en PDF |
| [`documents/entregables/Manual_Sigemad_MPA.docx`](documents/entregables/Manual_Sigemad_MPA.docx) | Versión editable para Microsoft Word |

---

## Desarrollo

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo (Vite)
npm run build        # Build de producción
npm test             # Pruebas unitarias frontend (Vitest)
cd backend && composer test   # Pruebas unitarias PHP (PHPUnit)
cd ml && pytest -v            # Pruebas unitarias ML
```

### Estructura del proyecto

```
gestion_mpa/
├── src/                    # Frontend React
│   ├── features/           # Módulos por dominio
│   ├── components/         # Componentes compartidos
│   └── lib/                # Cliente API (Axios)
├── backend/
│   ├── api/v2/             # API REST PHP
│   └── sql/                # Scripts de base de datos
├── ml/                     # Microservicio FastAPI + modelos
├── documents/              # Documentación por fases SDLC
└── prompts/                # Prompt-Centered SDLC v1.2
```

### API base

```
/gestion_mpa/backend/api/v2
```

Rutas principales: `/auth`, `/equipos`, `/mantenimientos`, `/fichas-tecnicas`, `/dashboard`, `/reportes`, `/ml`, `/areas`, `/gerencias`, `/usuarios`, `/cronogramas`.

---

*Sigemad MPA V2 — Sistema de Gestión de Equipos con soporte para Machine Learning predictivo.*
