# -*- coding: utf-8 -*-
"""Genera MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx a partir de la plantilla V3."""
from copy import copy
from pathlib import Path

from openpyxl import load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.styles.fills import FILL_SOLID
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.hyperlink import Hyperlink

BASE = Path(__file__).resolve().parent
SRC = BASE / "MATRIZ-DOBLE-ENTRADA-V3-AMARO-JIANG-MONEY-ME.xlsx"
DST = BASE / "MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx"

REPO = "https://github.com/AxlTech25/Gestion-MPA"
COMMIT_HEAD = "3394712"  # Incremento 8 / 0.10.7 en origin/main
RESPONSABLE = "AxlTech25"
ROL = "Desarrollador"
CHANGELOG = "documents/05_mantenimiento/changelog.md"
SHA_LOCAL = "working-tree"  # no usar si el código ya está en GitHub
SHA_INC8 = "3394712"

PROMPT_FILES = {
    "I-002": "prompts/03_implementacion/I-002_inventario_v1.md",
    "I-003": "prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md",
    "I-004": "prompts/03_implementacion/I-004_reportes_pdf_v1.md",
    "I-005": "prompts/03_implementacion/I-005_configuracion_v1.md",
    "I-006": "prompts/03_implementacion/I-006_auth_dashboard_v1.md",
    "I-007": "prompts/03_implementacion/I-007_microservicio_ml_v1.md",
    "I-008": "prompts/03_implementacion/I-008_telemetria_ficha_predictiva_v1.md",
    "I-009": "prompts/03_implementacion/I-009_rbac_plantilla_excel_v1.md",
    "I-010": "prompts/03_implementacion/I-010_cronograma_v1.md",
    "I-011": "prompts/03_implementacion/I-011_cronograma_totales_horarios_pdf_v1.md",
    "I-012": "prompts/03_implementacion/I-012_cronograma_pdf_matriz_v1.md",
    "I-013": "prompts/03_implementacion/I-013_cronograma_personal_v1.md",
    "I-014": "prompts/03_implementacion/I-014_cronograma_cantidad_xn_v1.md",
    "I-015": "prompts/03_implementacion/I-015_cronograma_pdf_a4_baja_v1.md",
    "I-016": "prompts/03_implementacion/I-016_cronograma_pdf_encaje_v1.md",
    "I-017": "prompts/03_implementacion/I-017_gerencias_crud_areas_v1.md",
}

FILL_HEADER = PatternFill(fill_type=FILL_SOLID, fgColor="1F4E78")
FILL_SI = PatternFill(fill_type=FILL_SOLID, fgColor="E2EFDA")
FILL_PARCIAL = PatternFill(fill_type=FILL_SOLID, fgColor="FFF2CC")
FILL_NO = PatternFill(fill_type=FILL_SOLID, fgColor="FCE4E4")
FILL_ALTO = PatternFill(fill_type=FILL_SOLID, fgColor="FCE4E4")
FILL_MEDIO = PatternFill(fill_type=FILL_SOLID, fgColor="E2EFDA")
FILL_WHITE = PatternFill(fill_type=FILL_SOLID, fgColor="FFFFFF")
FILL_ALT = PatternFill(fill_type=FILL_SOLID, fgColor="F2F2F2")

FONT_HEADER = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
FONT_CELL = Font(name="Calibri", size=10)
FONT_LINK = Font(name="Calibri", size=10, color="0563C1", underline="single")
FONT_TITLE = Font(name="Calibri", size=16, bold=True, color="FFFFFF")
FONT_SECTION = Font(name="Calibri", size=12, bold=True, color="1F4E78")
FONT_BOLD = Font(name="Calibri", size=10, bold=True)

THIN = Border(
    left=Side(style="thin", color="BDD7EE"),
    right=Side(style="thin", color="BDD7EE"),
    top=Side(style="thin", color="BDD7EE"),
    bottom=Side(style="thin", color="BDD7EE"),
)
WRAP = Alignment(wrap_text=True, vertical="center")
WRAP_LEFT = Alignment(wrap_text=True, vertical="center", horizontal="left")


def devops_fill(value: str) -> PatternFill:
    if value == "Sí":
        return FILL_SI
    if value == "Parcial":
        return FILL_PARCIAL
    return FILL_NO


def github_blob(path: str, sha: str) -> str:
    return f"{REPO}/blob/{sha}/{path}"


def github_commit(sha: str) -> str:
    return f"{REPO}/commit/{sha}"


def github_main(path: str) -> str:
    return f"{REPO}/blob/main/{path}"


def sha_published(sha: str) -> bool:
    return bool(sha) and sha != SHA_LOCAL


def commit_label(sha: str) -> str:
    return sha if sha_published(sha) else "0.10.7 local"


def commit_url(sha: str) -> str:
    return github_commit(sha) if sha_published(sha) else github_main(CHANGELOG)


def file_url(path: str, sha: str) -> str:
    return github_blob(path, sha) if sha_published(sha) else github_main(path)


# Una fila por función atómica (grano Money Me: login, registro, …).
from _funciones_atomicas import FUNCIONES

# Una fila por función (hoja Prompts Detallados, instrumento Jiang). Texto = resumen D1.
PROMPTS = [
    {
        "id": "I-006",
        "funcion": "F-001, F-002, F-003, F-004, F-031, F-041",
        "prompt": (
            "Actúa como desarrollador senior PHP (firebase/php-jwt) y React (AuthContext, Axios). "
            "Contexto: API v2 y módulos INV/MNT/CFG sin JWT obligatorio; ADR-001 exige Bearer salvo /auth. "
            "Objetivo: login, sesión persistente y protección de /v2/* y de la API. "
            "Tarea: POST /auth/login → JWT; AuthMiddleware::requireAuth excepto /auth; Login.jsx, "
            "AuthContext, PrivateRoute; interceptor Axios; 401 → login; Navbar con Salir. "
            "Restricciones: secret solo en config no versionada; no revelar si el usuario existe; no FastAPI. "
            "Criterios: login correcto → /v2/dashboard; F5 mantiene sesión; sin token API 401."
        ),
        "tecnica": "CoT guiado",
        "ver": "v1",
        "iter": 0,
        "motivo": "N/A — aprobado en primera versión documentada. El endurecimiento de roles es I-009.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Login JWT funcional (AuthContext, PrivateRoute, middleware)",
        "archivo": "prompts/03_implementacion/I-006_auth_dashboard_v1.md",
        "commit": "5ce7575",
    },
    {
        "id": "I-005",
        "funcion": "F-006, F-007, F-010, F-011",
        "prompt": (
            "Actúa como desarrollador senior PHP/React. Contexto: áreas y responsables no deben "
            "estar hardcodeados en EquipoForm; tablas v2_areas y v2_usuarios existen; ruta "
            "/v2/configuracion; roles Administrador, Tecnico, Practicante. "
            "Objetivo: CRUD de áreas y alta/listado de personal. "
            "Tarea: modelos PDO; password_hash BCRYPT; rutas /areas y /usuarios; ConfiguracionPage "
            "(pestañas); EquipoForm consume áreas desde API. "
            "Restricciones: no MD5; no requireRole en este incremento (deuda → I-009). "
            "Criterios: crear un área y verla en EquipoForm; usuario con hash en BD."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "La API de usuarios quedó solo autenticada. I-009 añade requireRole Administrador.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Áreas y personal funcionales; EquipoForm dinámico",
        "archivo": "prompts/03_implementacion/I-005_configuracion_v1.md",
        "commit": "4e08b9e",
    },
    {
        "id": "I-002",
        "funcion": "F-014, F-015, F-016, F-019",
        "prompt": (
            "Actúa como desarrollador senior PHP/React sobre el esqueleto I-001. "
            "Contexto: v2_equipos ya existe; CRUD mínimo ML-ready (ram_gb, almacenamiento_gb, fechas); "
            "código patrimonial de 12 dígitos; tabla + modal Tailwind. "
            "Objetivo: listado y alta vía /api/v2/equipos y src/features/inventario, sin fichas ni PDF. "
            "Tarea: Equipo.php (getAll, create); EquipoController JSON {success, data, message}; "
            "InventarioPage y EquipoForm. "
            "Restricciones: 12 dígitos únicos; no texto “8 GB”; no FastAPI. "
            "Criterios: POST persiste y GET lista; el form rechaza código ≠ 12."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 0,
        "motivo": "N/A — no confundir con I-002-ML histórico (ahora I-007).",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "CRUD de equipos con código de 12 dígitos y RAM numérica",
        "archivo": "prompts/03_implementacion/I-002_inventario_v1.md",
        "commit": "f086a63",
    },
    {
        "id": "I-003",
        "funcion": "F-021, F-022, F-023",
        "prompt": (
            "Actúa como desarrollador senior PHP/React; replica el patrón I-002. "
            "Contexto: equipos ya se listan; hace falta consultar/editar ficha técnica del equipo. "
            "Tarea: modelo/controlador/ruta de fichas; GET por id y por código patrimonial; "
            "acceso desde inventario (modal o /v2/ficha-tecnica). "
            "Restricciones: no PDF (I-004); no bloque ML (I-008). "
            "Criterios: GET ficha existente o vacío controlado (no 500)."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 0,
        "motivo": "N/A — evaluación predictiva en ficha es I-008.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "API y UI de ficha técnica por id o código",
        "archivo": "prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md",
        "commit": "f086a63",
    },
    {
        "id": "I-003",
        "funcion": "F-025, F-026, F-027, F-028",
        "prompt": (
            "Actúa como desarrollador senior PHP/React; patrón I-002. "
            "Contexto: historial de intervenciones con categoria_falla_id del catálogo "
            "v2_categorias_falla; no texto libre como verdad de la falla. "
            "Objetivo: registrar y listar mantenimientos. "
            "Tarea: Mantenimiento.php getAll (JOIN categoría y técnico) y create; timeline + modal; "
            "select de categoría. "
            "Restricciones: categoría obligatoria en correctivo; no telemetría (I-008); no ML (I-007). "
            "Criterios: POST liga equipo_id; timeline muestra fecha, tipo y categoría nombrada."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 0,
        "motivo": "N/A — sync de telemetría es I-008.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Timeline y alta estructurada de mantenimientos",
        "archivo": "prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md",
        "commit": "8b20337",
    },
    {
        "id": "I-006",
        "funcion": "F-031",
        "prompt": (
            "Actúa como desarrollador senior PHP/React (mismo incremento 0.6.0 que F-001). "
            "Objetivo: métricas operativas en GET /api/v2/dashboard y UI DashboardPage (conteos, no ML). "
            "Tarea: DashboardController + DashboardPage; no badges de riesgo (I-007); "
            "no panel de consulta por etiquetas (I-008). "
            "Restricciones: no llamar a :8000. "
            "Criterios: dashboard muestra conteos persistidos tras login."
        ),
        "tecnica": "CoT guiado",
        "ver": "v1",
        "iter": 0,
        "motivo": "N/A — consulta tipo_otro es I-008; alertas ML son I-007.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Dashboard de métricas operativas funcional",
        "archivo": "prompts/03_implementacion/I-006_auth_dashboard_v1.md",
        "commit": "5ce7575",
    },
    {
        "id": "I-007",
        "funcion": "F-020, F-030, F-032, F-034, F-035, F-036, F-037",
        "prompt": (
            "Actúa como ingeniero de ML aplicado y backend PHP. "
            "Contexto: datos estructurados (I-002, I-003); JWT (I-006); FastAPI en :8000; "
            "PHP único cliente; FastAPI opcional. "
            "Objetivo: riesgo por equipo, sugerencia de categoría, proxy JWT y UI degradable. "
            "Tarea: dataset sintético ~200; Random Forest; /health, /predict/riesgo, batch, "
            "/predict/categoria, /train; tabla v2_predicciones_ml; proxy /api/v2/ml/*; badges. "
            "Restricciones: batch JSON {} no []; si FastAPI cae, inventario y login siguen. "
            "Criterios: /health OK; 401 sin token; UI sin crash con uvicorn down."
        ),
        "tecnica": "CoT guiado",
        "ver": "v1",
        "iter": 2,
        "motivo": "Batch enviaba []; curl devolvía HTTP 503 con cuerpo OK.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "FastAPI + proxy PHP + badges; degradación controlada",
        "archivo": "prompts/03_implementacion/I-007_microservicio_ml_v1.md",
        "commit": "e9a0965",
    },
    {
        "id": "I-004",
        "funcion": "F-017, F-038, F-039, F-040",
        "prompt": (
            "Actúa como desarrollador senior PHP (dompdf) y React. "
            "Contexto: inventario y ficha ya existen. "
            "Objetivo: GET /api/v2/reportes/equipo/{id} genera PDF; InventarioPage filtra en cliente "
            "y ofrece descargar ficha. "
            "Tarea: Composer dompdf; ReporteController HTML→PDF; botón en la fila. "
            "Restricciones: PDF binario, no base64; no reportes de mantenimiento en este incremento. "
            "Criterios: PDF muestra código patrimonial; filtro de texto reduce filas."
        ),
        "tecnica": "Zero-shot + few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "window.open sin token; I-006 cambia la descarga a blob + Authorization.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "PDF de ficha y filtros de inventario funcionales",
        "archivo": "prompts/03_implementacion/I-004_reportes_pdf_v1.md",
        "commit": "f086a63",
    },
    {
        "id": "I-008",
        "funcion": "F-024, F-029, F-033",
        "prompt": (
            "Actúa como desarrollador PHP/React e ingeniero de datos ML. "
            "Contexto: ML 0.7.0 ya opera (I-007). Ampliar v2_equipos y v2_fichas_mantenimiento "
            "con telemetría y contexto de intervención; syncTelemetria al registrar mantenimiento; "
            "consulta de dashboard; bloque predictivo en ficha. "
            "No agente WMI ni DELETE de equipos. "
            "Criterios: migrate sobre BD 0.7.0 sin pérdida; POST mantenimiento actualiza snapshot; "
            "ficha muestra score si ML está arriba."
        ),
        "tecnica": "CoT guiado",
        "ver": "v1",
        "iter": 2,
        "motivo": "I-007 no incluía telemetría; D-005 pidió evolución por fases (0.8.0 y 0.9.0).",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Telemetría, sync, ficha predictiva y consulta de equipos",
        "archivo": "prompts/03_implementacion/I-008_telemetria_ficha_predictiva_v1.md",
        "commit": "8b20337",
    },
    {
        "id": "I-009",
        "funcion": "F-005, F-012, F-018",
        "prompt": (
            "Actúa como desarrollador senior de API PHP y React. "
            "Contexto: 0.9.1; JWT existe; un Técnico puede mutar /usuarios; plantilla Excel "
            "desalinea numero_serie/area por falta de color. "
            "Objetivo: requireRole Administrador en escritura de usuarios; no autoeliminación "
            "ni borrar el último admin; RoleRoute en Configuración; fila ejemplo Excel alineada. "
            "Criterios: Técnico en POST /usuarios → 403."
        ),
        "tecnica": "CoT guiado",
        "ver": "v1",
        "iter": 1,
        "motivo": "I-005 no puso autorización en servidor (deuda de RBAC).",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "requireRole en /usuarios y plantilla Excel alineada",
        "archivo": "prompts/03_implementacion/I-009_rbac_plantilla_excel_v1.md",
        "commit": "8b20337",
    },
    {
        "id": "I-010",
        "funcion": "F-043, F-044, F-051",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / React 19. "
            "Contexto: 0.9.1; R-006 y D-007; ADR-003 (v2_cronogramas / v2_cronograma_celdas); "
            "no usar v2_cronograma_mantenimiento. "
            "Objetivo: historial, alta de documento, matriz área×día×turno, cobertura y PDF. "
            "Tarea: SQL+migrate; modelo; controller; GET /reportes/cronograma/{id}; "
            "feature cronograma; Navbar; PHPUnit/Vitest. "
            "Restricciones: no ML; no dual-write; Practicante GET sí / POST 403. "
            "Criterios: dos planes el mismo año; clic crea/libera celda; PDF autenticado."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 0,
        "motivo": "N/A en origen. Totales, PDF papel, Xn, A4, gerencias = I-011…I-017.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Historial, matriz y PDF autenticado (0.10.0)",
        "archivo": "prompts/03_implementacion/I-010_cronograma_v1.md",
        "commit": SHA_INC8,
    },
    {
        "id": "I-011",
        "funcion": "F-047",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / React 19. "
            "Contexto: 0.10.0. Faltan subtotal/total; hay que programar hora de cada equipo; "
            "Imprimir PDF abre pestaña en blanco. "
            "Objetivo: parche 0.10.1. El asiento sigue área+fecha+turno (ADR-003). "
            "Tarea: columna Tot y pie Subtotal/Total; v2_cronograma_horarios + modal PUT; "
            "downloadPdf con attachment y Content-Type PDF. "
            "Criterios: pie de totales; modal horas; PDF descarga archivo."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "I-010 no tenía totales ni horas por equipo; downloadPdf sin attachment.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Totales, horarios por equipo e impresión con download",
        "archivo": "prompts/03_implementacion/I-011_cronograma_totales_horarios_pdf_v1.md",
        "commit": SHA_INC8,
    },
    {
        "id": "I-012",
        "funcion": "F-042",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / Dompdf. "
            "Contexto: el PDF era un listado; el papel 2024 es una matriz N°/área/PC/"
            "laptop/impresora × meses y días con marcas X1/X2. "
            "Objetivo: GET /reportes/cronograma/{id} imprime esa grilla. "
            "Tarea: A3 apaisado; rango de meses con marca; un día = una columna; "
            "última hoja leyenda y nota. No cambiar el asiento. "
            "Criterios: el PDF se parece al papel; las X coinciden con la UI."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "I-011 imprimía listado, no la grilla del papel.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "PDF tipo matriz (papel 2024)",
        "archivo": "prompts/03_implementacion/I-012_cronograma_pdf_matriz_v1.md",
        "commit": SHA_INC8,
    },
    {
        "id": "I-013",
        "funcion": "F-048",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / React 19. "
            "Contexto: el recuadro HORA PROGRAMADA del papel son las personas que "
            "hacen el preventivo, no los bienes del área. "
            "Objetivo: recuadro editable en matriz y PDF. "
            "Tarea: v2_cronograma_personal; PUT /cronogramas/{id}/personal; "
            "quitar del PDF la tabla grande de horas por CPU. "
            "Criterios: se edita el nombre y se ve igual en el PDF."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "I-012 listaba PCs del inventario en HORA PROGRAMADA; el papel lista personas.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Personal del preventivo en HORA PROGRAMADA",
        "archivo": "prompts/03_implementacion/I-013_cronograma_personal_v1.md",
        "commit": SHA_INC8,
    },
    {
        "id": "I-014",
        "funcion": "F-045, F-046",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / React 19. "
            "Contexto: X1/X2 no son mañana/tarde: son cuántos PC/laptop se atienden ese día. "
            "Objetivo: asiento = cronograma + área + fecha + cantidad; una columna por día. "
            "Tarea: SQL cantidad + UNIQUE(área,fecha); POST {cantidad}; selector X1…Xn; "
            "cobertura = suma(cantidad) vs PC+laptop. "
            "Restricciones: no 10 columnas; no auto-fill; impresoras no entran en Xn."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "I-010 modeló X1/X2 como turnos; el papel usa cantidad por día.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Xn = cantidad por día (no turnos)",
        "archivo": "prompts/03_implementacion/I-014_cronograma_cantidad_xn_v1.md",
        "commit": SHA_INC8,
    },
    {
        "id": "I-015",
        "funcion": "F-049",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / React 19 / Dompdf. "
            "Contexto: PDF A3 4 meses con sábados/domingos; hace falta A4, L–V, "
            "2 meses/hoja, año del documento y poder borrar un plan. "
            "Objetivo: PDF A4 apaisado laborable; DELETE /cronogramas/{id} CASCADE; "
            "matriz UI sin fines de semana. "
            "Restricciones: no auto-fill; Practicante no elimina; conservar N°/área/conteos."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "I-012 era A3 calendario completo; el responsable pidió A4 laborable y baja.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "PDF A4 L–V 2 meses/hoja y DELETE del plan",
        "archivo": "prompts/03_implementacion/I-015_cronograma_pdf_a4_baja_v1.md",
        "commit": SHA_INC8,
    },
    {
        "id": "I-016",
        "funcion": "F-042",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / Dompdf. "
            "Contexto: el PDF A4 aplastaba ÁREA (colspan calendario vs L–V); N° enorme; "
            "PC/LAP/IMP acrónimos; dos tablas desalineadas; HORA PROGRAMADA sin reja. "
            "Objetivo: una sola tabla; textos sin distorsión; pie N°/EQUIPO/HORARIO con borde. "
            "Criterios: áreas se leen; PC/LAPTOP/IMPRESORA completos; filas Xn alineadas."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 2,
        "motivo": "I-015 encajaba mal colspan y el pie no tenía borde.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "PDF encajado; HORA PROGRAMADA con borde",
        "archivo": "prompts/03_implementacion/I-016_cronograma_pdf_encaje_v1.md",
        "commit": SHA_INC8,
    },
    {
        "id": "I-017",
        "funcion": "F-008, F-009, F-013, F-050",
        "prompt": (
            "Actúa como desarrollador senior PHP 8 / React 19. "
            "Contexto: el papel agrupa áreas bajo filas de gerencia; v2_areas solo tenía alta. "
            "Objetivo: catálogo v2_gerencias; área.gerencia_id; CRUD de área (Admin); "
            "matriz y PDF con fila banda. "
            "Restricciones: no auto-fill; SIGA/SAF son áreas, no gerencias; "
            "no borrar área con equipos (409); no etiqueta libre. "
            "Criterios: asignar gerencia; 409 si hay equipos; bandas en cronograma/PDF."
        ),
        "tecnica": "Few-shot",
        "ver": "v1",
        "iter": 1,
        "motivo": "Cierre del Incremento 8: gerencias del papel y CRUD de áreas pendiente desde I-005.",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "Gerencias, CRUD de áreas y bandas en cronograma (0.10.7)",
        "archivo": "prompts/03_implementacion/I-017_gerencias_crud_areas_v1.md",
        "commit": SHA_INC8,
    },
]

PROMPT_HEADERS = [
    "ID prompt",
    "Función asociada",
    "Prompt exacto",
    "Técnica",
    "Versión prompt",
    "N.º de iteraciones",
    "Motivo de refinamiento",
    "Versión final",
    "Estado",
    "Resultado obtenido",
    "Evidencia",
]


def copy_style(src_cell, dst_cell):
    if src_cell.has_style:
        dst_cell.font = copy(src_cell.font)
        dst_cell.border = copy(src_cell.border)
        dst_cell.fill = copy(src_cell.fill)
        dst_cell.number_format = src_cell.number_format
        dst_cell.protection = copy(src_cell.protection)
        dst_cell.alignment = copy(src_cell.alignment)


def apply_data_cell(cell, value, fill=None, font=None, hyperlink=None):
    cell.value = value
    cell.font = font or FONT_CELL
    cell.alignment = WRAP
    cell.border = THIN
    if fill is not None:
        cell.fill = fill
    if hyperlink:
        cell.hyperlink = hyperlink
        cell.font = FONT_LINK


def fill_guia(ws):
    ws["A1"] = "MATRIZ DE DOBLE ENTRADA V3 — TRAZABILIDAD DE MANTENIMIENTO (CASO — SIGEMAD MPA)"
    ws["A3"] = "Novedad de la versión 3 (adaptada al caso Sigemad MPA)"
    ws["A4"] = (
        "Esta versión exprime con mayor profundidad el marco de Amaro, Pereira y Mira da Silva (2025), "
        "reemplazando la columna genérica 'Capacidad DevOps' por las 5 capacidades técnicas específicas "
        "que el estudio identifica con mayor correlación e impacto sobre los procesos del ciclo de vida (LCPs) "
        "del estándar IEEE 2675-2021. El caso documentado es Sigemad MPA V2 (React + PHP API + MySQL + FastAPI opcional), "
        "no el ejemplo Flutter de la plantilla Money Me."
    )
    ws["B6"] = (
        "Mapean 37 capacidades DevOps contra 30 procesos del ciclo de vida (LCPs). Esta matriz opera 5 de las "
        "capacidades técnicas más correlacionadas: Control de Versiones, Continuous Integration (CI), "
        "Continuous Delivery/Deployment (CD), Test Automation y Continuous Monitoring. Se reflejan en columnas "
        "independientes con estado Sí/Parcial/No, más la columna 'Impacto LCP' que indica si el módulo corresponde "
        "a un proceso de impacto alto o medio según su hallazgo de que CI y Test Automation tienen impacto muy alto "
        "sobre integración y validación."
    )
    ws["B7"] = (
        "Aporta el modelo de versionado y gestión de calidad de prompts (control de iteraciones, criterio de aceptación). "
        "Se refleja en 'ID Prompt', 'Versión del prompt', 'N.º de iteraciones' y 'Criterio de aceptación'. "
        "En Sigemad cada fila de Matriz Consolidada es una función atómica (F-001 inicio de sesión, F-011 registro de usuario, …), no un módulo entero. Los IDs de prompt vigentes son I-002…I-017."
    )
    ws["B8"] = (
        "Ninguna de las dos fuentes por separado construye un instrumento aplicado que conecte capacidades DevOps + "
        "calidad de prompts + ubicación física navegable en GitHub. Esta operacionalización sobre Sigemad MPA "
        "(Municipalidad Provincial de Acobamba) es la contribución metodológica dentro del modelo Prompt-Centered SDLC v1.2. "
        "Granularidad: una fila por módulo/épica. Fase documentada: Implementación. Capas: Presentation (React), API (PHP), "
        "Data (modelos/SQL), ML (FastAPI), Core/Infra — no Clean Architecture de Flutter."
    )
    ws["B11"] = "Busca en 'Matriz Consolidada' por 'Feature/Módulo' (auth, configuracion, inventario, ficha, mantenimiento, dashboard, ml, reportes, cronograma) o 'ID Función' (F-001 a F-051). Una fila = una función (login distinto de registro, alta de área distinta de baja)."
    ws["B12"] = (
        "Observa las 5 columnas DevOps (Amaro): verde = Sí implementado, amarillo = Parcial, rojo = No implementado. "
        "En este caso: Control de Versiones = Sí (Git); CI y CD = No (no hay pipeline GitHub Actions ni despliegue automático; "
        "la publicación a producción es manual); Test Automation = Parcial en auth, configuración, inventario, mantenimiento, dashboard, ML, reportes (PDF cronograma) y cronograma; Continuous Monitoring = No."
    )
    ws["B14"] = (
        "Consulta 'ID Prompt' (enlace al markdown en GitHub, rama main) y ve a 'Prompts Detallados' "
        "para leer el prompt exacto, técnica e iteraciones. Cadena de evidencia: prompt versionado → commit GitHub → archivo."
    )
    ws["B15"] = (
        "Haz clic en 'Link GitHub' para abrir el archivo en el commit que cerró ese módulo. "
        "Haz clic en 'Commit' para ver el diff completo de ese SHA. Repositorio: AxlTech25/Gestion-MPA."
    )
    ws["B16"] = "Usa 'Test asociado' (Vitest, PHPUnit, pytest o el plan funcional) antes de modificar."
    ws["B17"] = (
        "Al mantener el sistema: 1) registra o reutiliza un prompt en prompts/; 2) implementa el cambio; "
        "3) haz commit con el ID del prompt en el mensaje, p. ej. feat(inventario): validar código [I-002]; "
        "4) actualiza SHA, Link GitHub y N.º de iteraciones en esta matriz."
    )
    ws["A20"] = (
        "Explica que las 5 columnas DevOps operan bajo Amaro et al. (2025); las de prompt versionado bajo Jiang et al. (2025); "
        "y que la trazabilidad de mantenimiento es prompt → commit GitHub → archivo (síntesis original del caso Sigemad). "
        "Limitación: el historial Git anterior a esta matriz es agregado (pocos commits grandes), no un SHA por cada prompt; "
        "los I-00N se documentaron de forma retrospectiva (metodologia.md). A partir de este registro, cada cambio asistido por IA debe dejar SHA propio."
    )


def fill_config(ws):
    ws["B2"] = REPO
    ws["B3"] = COMMIT_HEAD
    ws["B4"] = (
        "B3 es el HEAD de origin/main al regenerar la matriz. Cada fila de Matriz Consolidada tiene su propio SHA "
        "en Commit (F-009 / I-010…I-017 → 3394712). Los prompts se leen en rama main: prompts/03_implementacion/."
    )
    ws["A5"] = "URL de esta matriz en GitHub"
    ws["B5"] = github_main("documents/matriz_doble_entrada/MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx")
    ws["A6"] = "Convención de commits con prompt"
    ws["B6"] = "tipo(modulo): mensaje [I-002]  — ejemplo: feat(inventario): filtro por área [I-002]"
    for row in range(5, 7):
        ws.cell(row=row, column=1).font = FONT_CELL
        ws.cell(row=row, column=2).font = FONT_CELL
        ws.cell(row=row, column=2).alignment = WRAP
    ws["B5"].font = FONT_LINK
    ws["B5"].hyperlink = ws["B5"].value
    ws.row_dimensions[5].height = 22
    ws.row_dimensions[6].height = 32


def fill_matriz(ws):
    # Encabezado capa adaptado
    ws["E1"] = "Capa (arquitectura Sigemad)"

    # Borrar filas de Money Me
    if ws.max_row > 1:
        ws.delete_rows(2, ws.max_row - 1)

    headers_fill_idx = {6, 7, 8, 9, 10}  # F-K impactos/devops 0-based later

    for i, f in enumerate(FUNCIONES, start=2):
        sha = f["commit"]
        link_file = file_url(f["completa"], sha)
        link_commit = commit_url(sha)
        link_prompt = github_main(PROMPT_FILES[f["prompt"]])
        valores = [
            f["id"],
            f["modulo"],
            f["funcion"],
            f["fase"],
            f["capa"],
            f["impacto"],
            "Sí",
            f["ci"],
            f["cd"],
            f["test_auto"],
            f["monitor"],
            f["prompt"],
            f["tecnica"],
            f["ver_prompt"],
            f["iter"],
            f["criterio"],
            f["resultado"],
            f["ruta"],
            f["archivo"],
            f["completa"],
            link_file,
            commit_label(sha),
            f["test"],
            RESPONSABLE,
            ROL,
            f["obs"],
        ]
        stripe = FILL_ALT if i % 2 == 0 else FILL_WHITE
        for col, val in enumerate(valores, start=1):
            cell = ws.cell(row=i, column=col)
            fill = stripe
            font = FONT_CELL
            hyperlink = None
            if col == 6:
                fill = FILL_ALTO if str(val).startswith("Alto") else FILL_MEDIO
            elif col in (7, 8, 9, 10, 11):
                fill = devops_fill(str(val))
            if col == 12:
                hyperlink = link_prompt
                font = FONT_LINK
            if col == 21:
                hyperlink = link_file
                font = FONT_LINK
            if col == 22:
                hyperlink = link_commit
                font = FONT_LINK
            apply_data_cell(cell, val, fill=fill, font=font, hyperlink=hyperlink)
        ws.row_dimensions[i].height = 36

    ws.auto_filter.ref = f"A1:Z{1 + len(FUNCIONES)}"
    ws.freeze_panes = "A2"
    ws.row_dimensions[1].height = 50
    ws.column_dimensions["A"].width = 12
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 38
    for col in range(1, 27):
        cell = ws.cell(row=1, column=col)
        cell.font = FONT_HEADER
        cell.fill = FILL_HEADER
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = THIN


def fill_prompts(ws):
    if ws.max_row > 1:
        ws.delete_rows(2, ws.max_row - 1)
    for col, header in enumerate(PROMPT_HEADERS, start=1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = FONT_HEADER
        cell.fill = FILL_HEADER
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = THIN
    for i, p in enumerate(PROMPTS, start=2):
        valores = [
            p["id"],
            p["funcion"],
            p["prompt"],
            p["tecnica"],
            p["ver"],
            p["iter"],
            p["motivo"],
            p["ver_final"],
            p["estado"],
            p["resultado"],
            p["commit"],
        ]
        stripe = FILL_ALT if i % 2 == 0 else FILL_WHITE
        for col, val in enumerate(valores, start=1):
            cell = ws.cell(row=i, column=col)
            apply_data_cell(cell, val, fill=stripe)
        # ID prompt → markdown en main; Evidencia → commit de GitHub (como Money Me)
        ws.cell(row=i, column=1).hyperlink = github_main(p["archivo"])
        ws.cell(row=i, column=1).font = FONT_LINK
        evid_cell = ws.cell(row=i, column=11)
        evid_cell.value = commit_label(p["commit"]) if sha_published(p["commit"]) else "changelog 0.10.7"
        evid_cell.hyperlink = commit_url(p["commit"])
        evid_cell.font = FONT_LINK
        evid_cell.alignment = WRAP
        ws.row_dimensions[i].height = 90
    ws.row_dimensions[1].height = 30
    ws.freeze_panes = "A2"
    ws.column_dimensions["A"].width = 12
    ws.column_dimensions["B"].width = 28
    ws.column_dimensions["C"].width = 72
    ws.column_dimensions["D"].width = 18
    ws.column_dimensions["K"].width = 16


def fill_diccionario(ws):
    # Actualizar definición de Capa
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row, max_col=3):
        if row[0].value and "Capa" in str(row[0].value):
            row[0].value = "Capa (arquitectura Sigemad)"
            row[1].value = (
                "Capa donde vive el archivo principal del módulo: Presentation (React), API (PHP), "
                "Data (modelos/SQL), ML (FastAPI) o Core/Infra. Un módulo puede atravesar varias capas; "
                "la fila apunta al artefacto de código más representativo y las demás se anotan en Observaciones."
            )
            row[2].value = "Original (adaptado a Sigemad; no Clean Architecture Flutter)"
        if row[0].value and str(row[0].value).startswith("ID Prompt"):
            row[1].value = (
                "Identificador del prompt vigente (I-002…I-017). Varias funciones F-00N pueden compartir un I-* "
                "(el prompt generó más de un componente). Hipervínculo al markdown en GitHub (prompts/)."
            )
        if row[0].value and str(row[0].value) == "Link GitHub (línea exacta)":
            row[1].value = (
                "URL navegable al archivo en el SHA de la columna Commit: evidencia inmutable de qué código produjo ese prompt."
            )
        if row[0].value and str(row[0].value) == "Commit":
            row[1].value = (
                "SHA corto del commit de GitHub que introduce o cierra el alcance del módulo. "
                "Hipervínculo a /commit/{sha} (diff). No es necesariamente el HEAD del repo: cada fila apunta a su evidencia."
            )


def write_prompts_workbook(path: Path):
    """Hoja Prompts Detallados sin plantilla Money Me (si el .xlsx origen no está)."""
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "Prompts Detallados"
    fill_prompts(ws)
    wb.save(path)
    print(f"Escrito (solo prompts): {path}")


def main():
    if SRC.exists():
        wb = load_workbook(SRC)
        guia = wb.worksheets[0]
        config = wb.worksheets[1]
        matriz = wb.worksheets[2]
        prompts = wb.worksheets[3]
        dicc = wb.worksheets[4]

        fill_guia(guia)
        fill_config(config)
        fill_matriz(matriz)
        fill_prompts(prompts)
        fill_diccionario(dicc)

        wb.save(DST)
        print(f"Escrito: {DST}")
    else:
        print(f"Plantilla no encontrada: {SRC}")
        write_prompts_workbook(DST)

    print(f"Filas matriz: {len(FUNCIONES)}")
    print(f"Prompts detallados: {len(PROMPTS)}")


if __name__ == "__main__":
    main()
