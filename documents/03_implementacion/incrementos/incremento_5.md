# Incremento 5 — Módulo de configuración organizacional

> Registro de la **fase de implementación** (Prompt-Centered SDLC v1.2). No es un sprint Scrum. Prompt: [I-005](../../../prompts/03_implementacion/I-005_configuracion_v1.md). RBAC de `/usuarios`: [I-009](../../../prompts/03_implementacion/I-009_rbac_plantilla_excel_v1.md).

**Fecha de finalización:** 2026-04-30
**Estado:** Completado

## Objetivos del incremento
Proveer al administrador de un panel centralizado para gestionar las áreas de la empresa y el personal técnico/operativo asociado a dichas áreas, de manera que el sistema sea escalable y no dependa de opciones pre-codeadas en el frontend ni de inserciones directas en base de datos.

## Entregables
1. **Backend PHP (REST API V2)**
   - Creados `Area.php` y `Usuario.php` (Modelos con PDO).
   - Creados `AreaController.php` y `UsuarioController.php` (Controladores con lógica de inserción y lectura). En la creación de usuarios, se aplicó `password_hash()` con algoritmo BCRYPT para asegurar las credenciales de los nuevos técnicos.
   - Rutas `/api/v2/areas` y `/api/v2/usuarios` mapeadas en el `index.php` principal.

2. **Frontend React (Configuración)**
   - Añadida la nueva ruta `/v2/configuracion` conectada al `Navbar.jsx`.
   - Se diseñó el `ConfiguracionPage.jsx`, un panel de administración con dos pestañas de navegación interna: una vista en tarjetas para las Áreas y una vista en tabla detallada para el Personal.
   - Creación de dos modales dinámicos (`AreaForm.jsx` y `UsuarioForm.jsx`) que interconectan datos (por ejemplo, al crear un usuario, el select de Área obtiene sus opciones de las áreas recién registradas en la V2).

3. **Interconexión con Inventario**
   - El componente de creación de equipos (`EquipoForm.jsx`) fue actualizado para hacer uso de las nuevas APIs. Ahora, en lugar de mostrar "Recursos Humanos" de forma estática, obtiene la lista de áreas reales desde la base de datos y permite también asignar un "Responsable" al equipo.

4. **Documentación**
   - Registro de estos cambios en `changelog.md` bajo la versión **0.5.0**.

## Corrección posterior (0.9.1)

Las mutaciones de `/usuarios` quedaron solo autenticadas (JWT) en el incremento 5. En **0.9.1** se exige rol Administrador en servidor, con bloqueo de autoeliminación y del último administrador. Ver `documents/05_mantenimiento/changelog.md` y `documents/02_diseno/architecture.md`.
