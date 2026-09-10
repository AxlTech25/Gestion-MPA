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
COMMIT_HEAD = "7a1c402"  # snapshot origin/main al documentar la matriz
RESPONSABLE = "AxlTech25"
ROL = "Desarrollador"

PROMPT_FILES = {
    "I-001": "prompts/03_implementacion/I-001_api_auth_inventario_v1.md",
    "I-002": "prompts/03_implementacion/I-002_microservicio_ml_v1.md",
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


# Una fila por épica (solo implementación). Capa = archivo principal.
FUNCIONES = [
    {
        "id": "F-001",
        "modulo": "auth",
        "funcion": "Autenticación JWT y sesión (login, RBAC)",
        "fase": "Implementación",
        "capa": "Presentation (React)",
        "impacto": "Alto (integración/validación)",
        "ci": "No",
        "cd": "No",
        "test_auto": "No",
        "monitor": "No",
        "prompt": "I-001",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "Login JWT, AuthContext, middleware y protección de rutas API/UI",
        "ruta": "src/features/auth/",
        "archivo": "Login.jsx",
        "completa": "src/features/auth/Login.jsx",
        "commit": "5ce7575",
        "test": "documents/04_testing/plan_pruebas_funcionales.md (casos AUTH)",
        "obs": "Commit 5ce7575 (migración V2 JWT). También AuthMiddleware.php, Jwt.php y AuthContext.jsx. Historial Git agregado (no un commit por prompt). Sin prueba unitaria de login.",
    },
    {
        "id": "F-002",
        "modulo": "configuracion",
        "funcion": "Áreas y personal (RBAC organizacional)",
        "fase": "Implementación",
        "capa": "Presentation (React)",
        "impacto": "Medio (entrega/despliegue)",
        "ci": "No",
        "cd": "No",
        "test_auto": "No",
        "monitor": "No",
        "prompt": "I-001",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "CRUD de áreas y usuarios con roles Administrador / Técnico / Practicante",
        "ruta": "src/features/configuracion/",
        "archivo": "ConfiguracionPage.jsx",
        "completa": "src/features/configuracion/components/ConfiguracionPage.jsx",
        "commit": "9950f99",
        "test": "documents/04_testing/plan_pruebas_funcionales.md (casos CFG)",
        "obs": "Commit 9950f99 (estructura inicial; incremento 5 v0.5.0 via en ese lote). API: AreaController.php y UsuarioController.php.",
    },
    {
        "id": "F-003",
        "modulo": "inventario",
        "funcion": "Inventario patrimonial de equipos (CRUD, filtros, carga Excel)",
        "fase": "Implementación",
        "capa": "API (PHP)",
        "impacto": "Alto (integración/validación)",
        "ci": "No",
        "cd": "No",
        "test_auto": "Parcial",
        "monitor": "No",
        "prompt": "I-001",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "CRUD equipos, código de 12 dígitos, tipos personalizados y carga masiva",
        "ruta": "backend/api/v2/controllers/",
        "archivo": "EquipoController.php",
        "completa": "backend/api/v2/controllers/EquipoController.php",
        "commit": "9950f99",
        "test": "src/lib/equipoTipo.test.js",
        "obs": "Commit 9950f99 (origen del CRUD). Evoluciones posteriores en 06d75b1 y 1c63dbe. Test unitario solo de tipo de equipo (Vitest).",
    },
    {
        "id": "F-004",
        "modulo": "ficha",
        "funcion": "Ficha técnica y evaluación de hardware/software",
        "fase": "Implementación",
        "capa": "API (PHP)",
        "impacto": "Alto (integración/validación)",
        "ci": "No",
        "cd": "No",
        "test_auto": "No",
        "monitor": "No",
        "prompt": "I-001",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "Alta/edición de ficha, evaluación y bloque predictivo en UI",
        "ruta": "backend/api/v2/controllers/",
        "archivo": "FichaTecnicaController.php",
        "completa": "backend/api/v2/controllers/FichaTecnicaController.php",
        "commit": "9950f99",
        "test": "documents/04_testing/plan_pruebas_funcionales.md (casos FIC)",
        "obs": "Commit 9950f99 (origen). UI: FichaTecnicaPage.jsx y FichaTecnicaPanel.jsx. Bloque predictivo en 8b20337 (v0.9.0).",
    },
    {
        "id": "F-005",
        "modulo": "mantenimiento",
        "funcion": "Historial de mantenimiento, telemetría y correctivo estructurado",
        "fase": "Implementación",
        "capa": "API (PHP)",
        "impacto": "Alto (integración/validación)",
        "ci": "No",
        "cd": "No",
        "test_auto": "Parcial",
        "monitor": "No",
        "prompt": "I-001",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "Timeline, registro estructurado y sync de telemetría post-mantenimiento",
        "ruta": "backend/api/v2/controllers/",
        "archivo": "MantenimientoController.php",
        "completa": "backend/api/v2/controllers/MantenimientoController.php",
        "commit": "8b20337",
        "test": "backend/tests/MantenimientoTest.php",
        "obs": "Commit 8b20337 (v0.9.0 telemetría y correctivo estructurado). Origen del módulo: 9950f99. PHPUnit: sync de telemetría.",
    },
    {
        "id": "F-006",
        "modulo": "dashboard",
        "funcion": "Indicadores operativos y consulta de equipos por etiquetas",
        "fase": "Implementación",
        "capa": "Presentation (React)",
        "impacto": "Medio (entrega/despliegue)",
        "ci": "No",
        "cd": "No",
        "test_auto": "Parcial",
        "monitor": "No",
        "prompt": "I-001",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "Dashboard de métricas, alertas ML y panel de consulta con filtros",
        "ruta": "src/features/dashboard/",
        "archivo": "DashboardPage.jsx",
        "completa": "src/features/dashboard/components/DashboardPage.jsx",
        "commit": "5ce7575",
        "test": "backend/tests/DashboardConsultaTest.php",
        "obs": "Commit 5ce7575 (dashboard de métricas + JWT). Alertas ML y consulta: 8b20337. PHPUnit cubre filtros de consulta. Monitoring de software = No.",
    },
    {
        "id": "F-007",
        "modulo": "ml",
        "funcion": "Riesgo predictivo, lote, categoría de falla y reentrenamiento",
        "fase": "Implementación",
        "capa": "ML (FastAPI)",
        "impacto": "Alto (integración/validación)",
        "ci": "No",
        "cd": "No",
        "test_auto": "Parcial",
        "monitor": "No",
        "prompt": "I-002",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "Microservicio FastAPI + proxy PHP /api/v2/ml/* + badges de riesgo en UI",
        "ruta": "ml/app/",
        "archivo": "main.py",
        "completa": "ml/app/main.py",
        "commit": "e9a0965",
        "test": "ml/tests/test_features.py",
        "obs": "Commit e9a0965 (FastAPI). Proxy PHP y cierre v0.9.0: 06d75b1 / 8b20337. pytest: test_features.py y test_ml_schemas.py. ML opcional.",
    },
    {
        "id": "F-008",
        "modulo": "reportes",
        "funcion": "Reportes PDF de ficha técnica y mantenimiento",
        "fase": "Implementación",
        "capa": "API (PHP)",
        "impacto": "Medio (entrega/despliegue)",
        "ci": "No",
        "cd": "No",
        "test_auto": "No",
        "monitor": "No",
        "prompt": "I-001",
        "tecnica": "Zero-shot",
        "ver_prompt": "v1",
        "iter": 0,
        "criterio": "Aprobado",
        "resultado": "PDF de ficha de equipo e historial/detalle de mantenimiento con JWT en descarga",
        "ruta": "backend/api/v2/controllers/",
        "archivo": "ReporteController.php",
        "completa": "backend/api/v2/controllers/ReporteController.php",
        "commit": "5ce7575",
        "test": "documents/04_testing/plan_pruebas_funcionales.md (casos RPT)",
        "obs": "Commit 5ce7575 (descarga PDF con JWT). Origen del controlador: 9950f99. Sin prueba unitaria del PDF.",
    },
]

PROMPTS = [
    {
        "id": "I-001",
        "funcion": "F-001 a F-006, F-008",
        "prompt": (
            "Actúa como un desarrollador senior PHP/React. Contexto: API en backend/api/v2, "
            "frontend organizado por features, JWT y RBAC (Administrador, Técnico, Practicante). "
            "Implementa autenticación, CRUD de equipos, fichas técnicas, mantenimientos, áreas, "
            "usuarios, dashboard y reportes PDF. Restricciones: respuestas JSON estándar "
            "{success, data, message}; middleware JWT en todas las rutas salvo /auth; código "
            "patrimonial de 12 dígitos. No inventar integraciones SIGA/SIAF ni portal ciudadano."
        ),
        "tecnica": "Zero-shot",
        "ver": "v1",
        "iter": 0,
        "motivo": "Registro retrospectivo en prompts/; aprobado en primera versión documentada (incrementos 1–6, v0.1.0–0.6.0).",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "API V2 + features React de auth, configuración, inventario, ficha, mantenimiento, dashboard y reportes",
        "evidencia": "prompts/03_implementacion/I-001_api_auth_inventario_v1.md",
        "evidencia_commits": "Código: 9950f99 (origen), 5ce7575 (JWT/dashboard). Ver columna Commit de F-001 a F-006 y F-008.",
    },
    {
        "id": "I-002",
        "funcion": "F-007",
        "prompt": (
            "Actúa como ingeniero ML y backend. Contexto: dataset estructurado desde inventario "
            "y mantenimientos. Modelo de riesgo por equipo (Random Forest) y sugerencia de "
            "categoría de falla. Implementa microservicio FastAPI (entrenamiento e inferencia), "
            "tabla v2_predicciones_ml, proxy PHP autenticado /api/v2/ml/*, badges de riesgo en "
            "inventario y alertas en dashboard. Restricciones: PHP es el único cliente del puerto "
            "8000; si FastAPI no responde, el resto del sistema continúa (degradación controlada)."
        ),
        "tecnica": "Zero-shot",
        "ver": "v1",
        "iter": 0,
        "motivo": "Registro retrospectivo en prompts/; aprobado en incrementos 6–7 (v0.7.0–0.9.0).",
        "ver_final": "v1",
        "estado": "Aprobado",
        "resultado": "FastAPI + proxy PHP + UI de riesgo y ficha predictiva; pytest de features y schemas",
        "evidencia": "prompts/03_implementacion/I-002_microservicio_ml_v1.md",
        "evidencia_commits": "Código: e9a0965 (FastAPI), 8b20337 (cierre v0.9.0). Ver F-007.",
    },
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
        "En Sigemad los IDs siguen el repositorio prompts/: I-001 (API V2 e inventario) e I-002 (microservicio ML)."
    )
    ws["B8"] = (
        "Ninguna de las dos fuentes por separado construye un instrumento aplicado que conecte capacidades DevOps + "
        "calidad de prompts + ubicación física navegable en GitHub. Esta operacionalización sobre Sigemad MPA "
        "(Municipalidad Provincial de Acobamba) es la contribución metodológica dentro del modelo Prompt-Centered SDLC v1.2. "
        "Granularidad: una fila por módulo/épica. Fase documentada: Implementación. Capas: Presentation (React), API (PHP), "
        "Data (modelos/SQL), ML (FastAPI), Core/Infra — no Clean Architecture de Flutter."
    )
    ws["B11"] = "Busca en 'Matriz Consolidada' por 'Feature/Módulo' (auth, inventario, ficha, mantenimiento, dashboard, ml, reportes, configuracion) o 'ID Función' (F-001 a F-008)."
    ws["B12"] = (
        "Observa las 5 columnas DevOps (Amaro): verde = Sí implementado, amarillo = Parcial, rojo = No implementado. "
        "En este caso: Control de Versiones = Sí (Git); CI y CD = No (no hay pipeline GitHub Actions ni despliegue automático; "
        "Hostinger es manual); Test Automation = Parcial en inventario, mantenimiento, dashboard y ML; Continuous Monitoring = No."
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
        "3) haz commit con el ID del prompt en el mensaje, p. ej. feat(inventario): validar código [I-001]; "
        "4) actualiza SHA, Link GitHub y N.º de iteraciones en esta matriz."
    )
    ws["A20"] = (
        "Explica que las 5 columnas DevOps operan bajo Amaro et al. (2025); las de prompt versionado bajo Jiang et al. (2025); "
        "y que la trazabilidad de mantenimiento es prompt → commit GitHub → archivo (síntesis original del caso Sigemad). "
        "Limitación: el historial Git anterior a esta matriz es agregado (pocos commits grandes), no un SHA por cada prompt; "
        "I-001 e I-002 se documentaron de forma retrospectiva (metodologia.md §7). A partir de este registro, cada cambio asistido por IA debe dejar SHA propio."
    )


def fill_config(ws):
    ws["B2"] = REPO
    ws["B3"] = COMMIT_HEAD
    ws["B4"] = (
        "B3 es el HEAD de origin/main al publicar la matriz. Cada fila de 'Matriz Consolidada' tiene su propio SHA "
        "en la columna Commit (hipervínculo al diff). Los prompts se leen en rama main: prompts/03_implementacion/."
    )
    ws["A5"] = "URL de esta matriz en GitHub"
    ws["B5"] = github_main("documents/matriz_doble_entrada/MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx")
    ws["A6"] = "Convención de commits con prompt"
    ws["B6"] = "tipo(modulo): mensaje [I-001]  — ejemplo: feat(inventario): filtro por área [I-001]"
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
        link_file = github_blob(f["completa"], sha)
        link_commit = github_commit(sha)
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
            sha,
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
        ws.row_dimensions[i].height = 48

    ws.auto_filter.ref = f"A1:Z{1 + len(FUNCIONES)}"
    ws.freeze_panes = "A2"
    ws.row_dimensions[1].height = 50
    for col in range(1, 27):
        cell = ws.cell(row=1, column=col)
        cell.font = FONT_HEADER
        cell.fill = FILL_HEADER
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = THIN


def fill_prompts(ws):
    if ws.max_row > 1:
        ws.delete_rows(2, ws.max_row - 1)
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
            p["evidencia"],
        ]
        stripe = FILL_ALT if i % 2 == 0 else FILL_WHITE
        for col, val in enumerate(valores, start=1):
            cell = ws.cell(row=i, column=col)
            apply_data_cell(cell, val, fill=stripe)
        # ID prompt y evidencia → GitHub (rama main, tras publicar prompts/)
        ws.cell(row=i, column=1).hyperlink = github_main(p["evidencia"])
        ws.cell(row=i, column=1).font = FONT_LINK
        evid_cell = ws.cell(row=i, column=11)
        evid_cell.value = f"{p['evidencia']} · {p['evidencia_commits']}"
        evid_cell.hyperlink = github_main(p["evidencia"])
        evid_cell.font = FONT_LINK
        evid_cell.alignment = WRAP
        ws.row_dimensions[i].height = 90
    for col in range(1, 12):
        cell = ws.cell(row=1, column=col)
        cell.font = FONT_HEADER
        cell.fill = FILL_HEADER
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = THIN
    ws.row_dimensions[1].height = 30
    ws.freeze_panes = "A2"


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
                "Identificador del prompt que generó o modificó el módulo (I-001, I-002). "
                "En la matriz es un hipervínculo al markdown en GitHub (prompts/)."
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


def main():
    wb = load_workbook(SRC)
    # Nombres pueden llegar mojibake según locale; localizar por posición
    sheets = {ws.title: ws for ws in wb.worksheets}
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
    print(f"Filas matriz: {len(FUNCIONES)}")
    print(f"Prompts: {len(PROMPTS)}")


if __name__ == "__main__":
    main()
