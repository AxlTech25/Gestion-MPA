# Sigemad MPA — Gestión de Equipos V2

Sistema web para el inventario patrimonial, fichas técnicas, mantenimiento y análisis predictivo de equipos de cómputo.

**Stack:** React (Vite) · PHP API REST · MySQL · FastAPI (ML)

**Versión actual:** 0.8.0

---

## Tabla de contenido

- [Requisitos e instalación](#requisitos-e-instalación)
- [Guía de uso del sistema](#guía-de-uso-del-sistema)
  - [Inicio de sesión](#1-inicio-de-sesión)
  - [Dashboard](#2-dashboard)
  - [Inventario](#3-inventario)
  - [Ficha técnica](#4-ficha-técnica)
  - [Mantenimiento](#5-mantenimiento)
  - [Configuración](#6-configuración)
  - [Alertas predictivas (ML)](#7-alertas-predictivas-ml)
- [Roles y credenciales](#roles-y-credenciales)
- [Documentación adicional](#documentación-adicional)
- [Desarrollo](#desarrollo)

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
   - **Estado operativo:** Operativo, Dañado, En reparación, Excedencia, Baja
   - **Conservación:** Nuevo, Bueno, Regular, Malo
3. La tabla inferior muestra los equipos que coinciden.

**Tipos personalizados (Otro):** al elegir la etiqueta **Otro**, aparece un campo de texto al lado. Escriba el tipo específico (ej. `Plotter`, `Detector de billetes`) para refinar la búsqueda. Sin texto, se listan todos los equipos no estándar.

---

### 3. Inventario

Gestión del catálogo de equipos patrimoniales.

#### Buscar y filtrar

- Use el cuadro de búsqueda por **código patrimonial**, identificativo, marca o modelo.
- Combine con los filtros de **tipo** y **estado de conservación**.

#### Registrar un equipo nuevo

1. Pulse **Nuevo Equipo**.
2. Complete los campos obligatorios:
   - **Código patrimonial:** exactamente **12 dígitos numéricos**
   - **Área asignada**
   - **Tipo de equipo**
3. Si elige **Otro**, especifique el nombre del tipo (Plotter, Escáner, etc.).
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

En el panel de la ficha puede:

- Ver datos generales (marca, modelo, área, ubicación).
- Editar **hardware y software** (solo CPU/Laptop).
- Actualizar **conservación** y **estado operativo**.
- Registrar **observaciones** de la evaluación.
- Pulse **Guardar Evaluación** para persistir los cambios.
- Pulse **PDF** para exportar la ficha técnica.

> La evaluación de estado también puede hacerse desde el inventario (icono de engranaje).

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

### 6. Configuración

Panel de administración organizacional (requiere rol **Administrador**).

#### Pestaña Áreas

- Ver áreas registradas.
- Crear área con nombre, jefe encargado y descripción.
- Las áreas creadas aparecen automáticamente al registrar equipos.

#### Pestaña Personal

- Ver técnicos y usuarios del sistema.
- Registrar nuevo personal con usuario, contraseña, rol y área.
- Roles disponibles: **Administrador**, **Técnico**, **Practicante**.

---

### 7. Alertas predictivas (ML)

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
| Configuración | ✓ | — | — |
| Carga masiva Excel | ✓ | — | — |

---

## Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [`documents/architecture.md`](documents/architecture.md) | Arquitectura técnica V2 |
| [`documents/changelog.md`](documents/changelog.md) | Historial de versiones |
| [`documents/historias_usuario/`](documents/historias_usuario/) | Historias de usuario por épica |
| [`documents/pruebas/`](documents/pruebas/) | Planes de pruebas funcionales y unitarias |
| [`documents/sprints/`](documents/sprints/) | Registro de sprints |
| [`ml/README.md`](ml/README.md) | Microservicio ML y entrenamiento |

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
└── documents/              # Documentación del proyecto
```

### API base

```
/gestion_mpa/backend/api/v2
```

Rutas principales: `/auth`, `/equipos`, `/mantenimientos`, `/fichas-tecnicas`, `/dashboard`, `/reportes`, `/ml`, `/areas`, `/usuarios`.

---

*Sigemad MPA V2 — Sistema de Gestión de Equipos con soporte para Machine Learning predictivo.*
