# -*- coding: utf-8 -*-
"""Amplía ISO 25000, política de IA, repositorio GitHub y fases R/D/I/T/M del Anexo 07."""
from copy import deepcopy
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Rectangle
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.opc.constants import RELATIONSHIP_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from docx.text.paragraph import Paragraph

BASE = Path(__file__).resolve().parent
DOC = BASE / "Anexo7_Intervencion_Metodologica_Prompt_Centered_SDLC.docx"
IMG = BASE / "_figuras_anexo7"
FONT = "Times New Roman"
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
NAVY = "1F3A5F"
HEADER_FILL = "1F3A5F"
ROW_FILL = "F4F7FB"
BORDER = "8AA0B8"
GITHUB_PROMPTS = "https://github.com/AxlTech25/Gestion-MPA/tree/main/prompts"


def _font(run, size=12, bold=False, italic=False, color=BLACK):
    run.font.name = FONT
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.get_or_add_rFonts()
    rfonts.set(qn("w:eastAsia"), FONT)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color


def style_body(p, size=12, first_indent=0.75, after=8, justify=True, center=False):
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER if center else (
        WD_ALIGN_PARAGRAPH.JUSTIFY if justify else WD_ALIGN_PARAGRAPH.LEFT
    )
    pf = p.paragraph_format
    pf.space_before = Pt(0 if not center else 4)
    pf.space_after = Pt(after)
    pf.line_spacing = 1.0 if center else 1.5
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.first_line_indent = Cm(0 if center else first_indent)


def set_runs_text(p, text, size=12, bold=False, italic=False, justify=True, first_indent=0.75, after=8, center=False):
    if p.runs:
        p.runs[0].text = text
        _font(p.runs[0], size=size, bold=bold, italic=italic)
        for r in p.runs[1:]:
            r.text = ""
    else:
        run = p.add_run(text)
        _font(run, size=size, bold=bold, italic=italic)
    style_body(p, size=size, first_indent=first_indent, after=after, justify=justify, center=center)


def set_heading_text(p, text):
    if p.runs:
        p.runs[0].text = text
        for r in p.runs[1:]:
            r.text = ""
    else:
        run = p.add_run(text)
        _font(run, size=12, bold=True)


def insert_after(element, doc):
    new_p = OxmlElement("w:p")
    element.addnext(new_p)
    return Paragraph(new_p, doc)


def insert_body_after(element, text, doc, size=12, first_indent=0.75, after=8):
    p = insert_after(element, doc)
    run = p.add_run(text)
    _font(run, size=size)
    style_body(p, size=size, first_indent=first_indent, after=after)
    return p


def insert_caption_after(element, text, doc):
    p = insert_after(element, doc)
    run = p.add_run(text)
    _font(run, size=11, italic=True)
    style_body(p, size=11, first_indent=0, after=12, center=True)
    p.paragraph_format.space_before = Pt(4)
    return p


def find_para(doc, pred):
    for p in doc.paragraphs:
        if pred(p):
            return p
    return None


def has_text(doc, needle):
    return any(needle in p.text for p in doc.paragraphs)


def add_hyperlink(paragraph, text, url, size=12):
    part = paragraph.part
    r_id = part.relate_to(url, RELATIONSHIP_TYPE.HYPERLINK, is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)
    new_run = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    rfonts = OxmlElement("w:rFonts")
    rfonts.set(qn("w:ascii"), FONT)
    rfonts.set(qn("w:hAnsi"), FONT)
    rfonts.set(qn("w:eastAsia"), FONT)
    rpr.append(rfonts)
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), str(int(size * 2)))
    rpr.append(sz)
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "0563C1")
    rpr.append(color)
    u = OxmlElement("w:u")
    u.set(qn("w:val"), "single")
    rpr.append(u)
    new_run.append(rpr)
    t = OxmlElement("w:t")
    t.set(qn("xml:space"), "preserve")
    t.text = text
    new_run.append(t)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)
    shd.set(qn("w:val"), "clear")


def set_cell_text(cell, text, size=8, bold=False, color=BLACK, fill=None):
    p = cell.paragraphs[0]
    for extra in list(cell.paragraphs)[1:]:
        extra._element.getparent().remove(extra._element)
    if p.runs:
        p.runs[0].text = text
        _font(p.runs[0], size=size, bold=bold, color=color)
        for r in p.runs[1:]:
            r.text = ""
    else:
        run = p.add_run(text)
        _font(run, size=size, bold=bold, color=color)
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.0
    if fill:
        shade_cell(cell, fill)


def copy_tbl_borders(src_tbl, dst_tbl):
    src_pr = src_tbl._tbl.find(qn("w:tblPr"))
    dst_pr = dst_tbl._tbl.find(qn("w:tblPr"))
    if src_pr is None or dst_pr is None:
        return
    src_borders = src_pr.find(qn("w:tblBorders"))
    if src_borders is None:
        return
    old = dst_pr.find(qn("w:tblBorders"))
    if old is not None:
        dst_pr.remove(old)
    dst_pr.append(deepcopy(src_borders))
    src_jc = src_pr.find(qn("w:jc"))
    if src_jc is not None:
        old_jc = dst_pr.find(qn("w:jc"))
        if old_jc is not None:
            dst_pr.remove(old_jc)
        dst_pr.append(deepcopy(src_jc))


def insert_table_after(paragraph, headers, rows, doc, col_widths_cm):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.autofit = True
    src = next((t for t in doc.tables if len(t.columns) >= 3 and not (
        len(t.rows) == 1 and len(t.columns) == 1
    )), None)
    if src is not None:
        copy_tbl_borders(src, table)
    for i, h in enumerate(headers):
        set_cell_text(table.cell(0, i), h, size=8, bold=True, color=RGBColor(0xFF, 0xFF, 0xFF), fill=HEADER_FILL)
    for r, row in enumerate(rows, start=1):
        fill = ROW_FILL if r % 2 == 0 else "FFFFFF"
        for c, val in enumerate(row):
            set_cell_text(table.cell(r, c), val, size=8, fill=fill)
    tbl = table._tbl
    tbl.getparent().remove(tbl)
    paragraph._element.addnext(tbl)
    grid = tbl.find(qn("w:tblGrid"))
    if grid is not None:
        for child in list(grid):
            grid.remove(child)
        for w in col_widths_cm:
            gc = OxmlElement("w:gridCol")
            gc.set(qn("w:w"), str(int(w * 567)))
            grid.append(gc)
    return table


def replace_picture_before_caption(doc, caption_start, image_path, width_cm=15.5):
    paras = list(doc.paragraphs)
    for i, p in enumerate(paras):
        if not p.text.strip().startswith(caption_start):
            continue
        for j in range(i - 1, max(-1, i - 5), -1):
            q = paras[j]
            drawings = q._element.findall(
                ".//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}drawing"
            )
            if drawings or not q.text.strip():
                for child in list(q._element):
                    tag = child.tag
                    if tag.endswith("}r") or tag.endswith("}hyperlink"):
                        q._element.remove(child)
                q.alignment = WD_ALIGN_PARAGRAPH.CENTER
                q.paragraph_format.first_line_indent = Cm(0)
                q.paragraph_format.space_before = Pt(6)
                q.paragraph_format.space_after = Pt(2)
                run = q.add_run()
                run.add_picture(str(image_path), width=Cm(width_cm))
                return True
    return False


def _new_fig(w, h):
    plt.rcParams["font.family"] = "Times New Roman"
    fig, ax = plt.subplots(figsize=(w, h), dpi=170)
    fig.patch.set_facecolor("white")
    ax.axis("off")
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    return fig, ax


def _round_box(ax, x, y, w, h, facecolor, edge="#1F3A5F", lw=1.3):
    ax.add_patch(
        FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.02,rounding_size=0.08",
            linewidth=lw, edgecolor=edge, facecolor=facecolor,
        )
    )


def _arrow(ax, x1, y1, x2, y2):
    ax.add_patch(
        FancyArrowPatch(
            (x1, y1), (x2, y2),
            arrowstyle="-|>", mutation_scale=11, linewidth=1.25, color="#1F3A5F",
        )
    )


def draw_ciclo_rditm():
    IMG.mkdir(exist_ok=True)
    fig, ax = _new_fig(11.2, 4.55)
    ax.text(
        5.6, 4.28, "Ciclo de vida del Prompt-Centered SDLC",
        ha="center", va="center", fontsize=13, fontweight="bold", color="#1F3A5F",
    )
    ax.text(
        5.6, 3.96, "Cada letra es una fase; el rango es la familia de prompts vigentes de esa fase",
        ha="center", va="center", fontsize=8.4, color="#4A5568",
    )
    fases = [
        (0.18, "R", "Requisitos", "R-001 … R-005", "#C5DDD4"),
        (2.38, "D", "Diseño", "D-001 … D-006", "#D6E4F0"),
        (4.58, "I", "Implementación", "I-001 … I-009", "#B8CDE0"),
        (6.78, "T", "Pruebas", "T-001 … T-005", "#F3E4C8"),
        (8.98, "M", "Mantenimiento", "M-001 … M-004", "#E8EEF6"),
    ]
    bw, bh, by = 2.02, 2.05, 1.55
    for x, letra, nombre, rengo, color in fases:
        _round_box(ax, x, by, bw, bh, color)
        ax.text(x + bw / 2, by + 1.62, letra, ha="center", va="center",
                fontsize=18, fontweight="bold", color="#1F3A5F")
        ax.text(x + bw / 2, by + 1.08, nombre, ha="center", va="center",
                fontsize=9.4, fontweight="bold", color="#1A1A1A")
        ax.text(x + bw / 2, by + 0.55, rengo, ha="center", va="center",
                fontsize=7.6, color="#1A1A1A")
        ax.text(x + bw / 2, by + 0.22, "prompts vigentes", ha="center", va="center",
                fontsize=6.6, color="#4A5568")
    for x in (2.20, 4.40, 6.60, 8.80):
        _arrow(ax, x, by + bh / 2, x + 0.18, by + bh / 2)

    ax.add_patch(Rectangle((0.18, 0.18), 10.84, 1.18, facecolor="#F4F7FB", edgecolor="#1F3A5F", linewidth=1.0))
    ax.text(0.32, 1.12, "Clave de lectura", ha="left", va="center", fontsize=8.2,
            fontweight="bold", color="#1F3A5F")
    leyenda = (
        "R = Requisitos   ·   D = Diseño   ·   I = Implementación   ·   "
        "T = Pruebas (Testing)   ·   M = Mantenimiento"
    )
    ax.text(5.6, 0.78, leyenda, ha="center", va="center", fontsize=8.0, color="#1A1A1A")
    ax.text(
        5.6, 0.42,
        "Ejemplo: R-004 es el cuarto prompt de requisitos; I-002 es el prompt de implementación del inventario.",
        ha="center", va="center", fontsize=7.4, color="#4A5568",
    )
    path = IMG / "fig_a7_7_ciclo.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white", pad_inches=0.08)
    plt.close()
    return path


def draw_incrementos():
    fig, ax = _new_fig(11.2, 6.35)
    ax.text(
        5.6, 6.12, "Línea de incrementos de producto (no sprints Scrum)",
        ha="center", va="center", fontsize=13, fontweight="bold", color="#1F3A5F",
    )
    ax.text(
        5.6, 5.80,
        "Izquierda: versión del software.  Derecha: prompt de implementación (I = Implementación).  Abajo: módulo entregado.",
        ha="center", va="center", fontsize=8.2, color="#4A5568",
    )

    items = [
        ("0.1.0", "I-001", "Cimientos, API y esquema"),
        ("0.2.0", "I-002", "Inventario de equipos"),
        ("0.3.0", "I-003", "Fichas y mantenimiento"),
        ("0.4.0", "I-004", "Reportes PDF"),
        ("0.5.0", "I-005", "Configuración"),
        ("0.6.0", "I-006", "Auth JWT y dashboard"),
        ("0.7.0", "I-007", "Microservicio de ML"),
        ("0.8.0–0.9.0", "I-008", "Telemetría y ficha predictiva"),
        ("0.9.1", "I-009", "RBAC y plantilla Excel"),
    ]
    bw, bh = 3.12, 1.22
    gap_x, gap_y = 0.38, 0.38
    x0, y_top = 0.35, 4.35
    for i, (ver, code, mod) in enumerate(items):
        r, c = divmod(i, 3)
        x = x0 + c * (bw + gap_x)
        y = y_top - r * (bh + gap_y)
        _round_box(ax, x, y, bw, bh, "#D6E4F0")
        ax.text(x + 0.14, y + 0.88, ver, ha="left", va="center",
                fontsize=9.0, fontweight="bold", color="#1F3A5F")
        ax.text(x + bw - 0.14, y + 0.88, code, ha="right", va="center",
                fontsize=9.2, fontweight="bold", color="#1A1A1A")
        ax.text(x + bw / 2, y + 0.38, mod, ha="center", va="center",
                fontsize=8.0, color="#1A1A1A")
        if c < 2:
            _arrow(ax, x + bw, y + bh / 2, x + bw + gap_x, y + bh / 2)

    ax.add_patch(Rectangle((0.18, 0.16), 10.84, 1.05, facecolor="#F4F7FB", edgecolor="#1F3A5F", linewidth=1.0))
    ax.text(
        5.6, 0.88,
        "Cómo leerlo: 0.2.0 es la versión del producto; I-002 es el prompt de la fase de Implementación que la construyó.",
        ha="center", va="center", fontsize=8.0, color="#1A1A1A",
    )
    ax.text(
        5.6, 0.50,
        "La lectura es de izquierda a derecha y de arriba abajo. No hay caja de dos semanas: el incremento se cierra con artefacto, revisión y D2.",
        ha="center", va="center", fontsize=7.6, color="#4A5568",
    )
    path = IMG / "fig_a7_8_incrementos.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white", pad_inches=0.08)
    plt.close()
    return path


ISO9001 = [
    (
        "ISO 9001 establece requisitos para un sistema de gestión de la calidad basado en procesos, "
        "información documentada, verificación y mejora continua (ciclo planificar–hacer–verificar–actuar). "
        "En esta intervención no se certifica a la municipalidad ni al software bajo ISO 9001; la norma "
        "se usa como ancla de que un desarrollo asistido por inteligencia artificial debe dejar evidencia "
        "controlada, y no chats sueltos ni código integrado a ciegas."
    ),
    (
        "Esa exigencia se opera en el Prompt-Centered SDLC de la siguiente manera. El prompt versionado "
        "(dimensión D1) cumple la función de información documentada de lo pedido al modelo. La revisión "
        "humana antes de integrar equivale a la verificación. El ciclo D2 (medición, diagnóstico, "
        "refinamiento y decisión) cumple la función de tratar la no conformidad y de registrar la acción "
        "correctiva. El Definition of Done de la Tabla 7 es el criterio de aceptación de cada incremento. "
        "El ciclo de vida R/D/I/T/M ya cubre las fases de construcción; por ello no se adopta "
        "ISO/IEC/IEEE 12207 como norma rectora del caso."
    ),
]

ISO25000 = [
    (
        "La familia ISO/IEC 25000, conocida como SQuaRE (Systems and software Quality Requirements and "
        "Evaluation), es el marco internacional para especificar, medir y evaluar la calidad del producto "
        "de software. En este caso no se aplica el modelo completo de características SQuaRE. Se retienen "
        "tres características de calidad del producto, que se operan como requisitos no funcionales (R-005) "
        "y como criterios del Definition of Done (Tabla 7): adecuación funcional, mantenibilidad y "
        "eficiencia en el desempeño."
    ),
    (
        "La adecuación funcional exige que el software cubra las funciones acordadas de forma correcta y "
        "completa. Se evidencia en la ficha de proyecto, en las 56 historias de usuario, en el cierre de "
        "ambigüedades y en las pruebas que verifican los criterios de aceptación. La mantenibilidad exige "
        "que el software pueda analizarse, modificarse y restaurarse de forma controlada. Se evidencia en "
        "el modelo de datos, en los ADR-001 y ADR-002, en la regla de un prompt de implementación por "
        "incremento y en el plan de retorno (M-004). La eficiencia en el desempeño exige un uso razonable "
        "de recursos en el entorno real: el sistema opera sobre PHP y MySQL en un servidor de producción, el componente "
        "de aprendizaje automático se degrada si el servicio no responde (ADR-002) y los reportes y el "
        "inventario deben permanecer utilizables sin un servidor dedicado."
    ),
    (
        "No se pretende una evaluación SQuaRE de certificación. La seguridad, la usabilidad, la "
        "compatibilidad y la portabilidad no se puntúan aquí como características autónomas del producto: "
        "la seguridad se trata como requisito no funcional y como guardrail de gobernanza (apartado 4.1). "
        "El mapeo de las tres características retenidas sobre las fases del ciclo se presenta en la Tabla 3."
    ),
]

ISO29119 = [
    (
        "ISO/IEC/IEEE 29119-2 describe los procesos de prueba de software: planificación, diseño e "
        "implementación de pruebas, entorno, ejecución e informe de incidentes. En Sigemad esa estructura "
        "se alinea con la familia T. T-001 es el plan funcional, elaborado y ejecutado bajo responsabilidad "
        "humana. T-002, T-003 y T-004 implementan y ejecutan pruebas en PHPUnit, Vitest y pytest. T-005 "
        "queda como plantilla de diagnóstico cuando un caso falla. El responsable interpreta los resultados; "
        "el modelo no cierra la fase de pruebas por sí solo."
    ),
    (
        "ISO/IEC 29110 se menciona solo como contexto de un equipo muy pequeño (very small entity), no "
        "como norma de diseño del ciclo. El anclaje de pruebas de este caso es 29119-2, no el perfil 29110."
    ),
]

POLITICA = [
    (
        "Antes de ejecutar prompts se fijó una política mínima de uso de inteligencia artificial "
        "(versión 1.3). Su propósito no es declarativo: cada regla se tradujo en un artefacto o en un "
        "comportamiento observable en el repositorio. El agente (Cursor Agent) genera; el responsable "
        "humano define el prompt, revisa, prueba e integra. El nivel de automatización se mantiene en N2, "
        "como se justifica en el apartado 8."
    ),
    (
        "La política se concreta en ocho reglas. Primera, todo código generado pasa por revisión humana "
        "antes de integrarse: el campo Revisor de cada registro y el criterio 3 del Definition of Done "
        "(Tabla 7) lo documentan. Segunda, está prohibido pegar en el prompt credenciales, archivos .env, "
        "local.php, secretos de producción o datos personales reales; el control posterior es M-004 y los "
        "requisitos no funcionales de secretos. Tercera, se versiona la instrucción reejecutable en prompts/, "
        "con plantilla D1, y no el historial de conversación. Cuarta, un cambio de arquitectura se registra "
        "como ADR (ADR-001 de stack y ADR-002 de degradación del componente predictivo) y, antes de tocar "
        "base de datos o contrato, se usa la ficha M-002."
    ),
    (
        "Quinta, las salidas se verifican con el plan funcional y con PHPUnit, Vitest y pytest (T-001 a "
        "T-005). Sexta, el equipo debe poder explicar y mantener el código generado sin depender "
        "exclusivamente del modelo: en este caso el tesista actuó como desarrollador y revisor. Séptima, "
        "si el artefacto ya existía, el registro se marca Reconstruido a posteriori; los prompts nuevos se "
        "escriben antes o durante el cambio, y esa distinción aparece en las Tablas 9 a 13. Octava, un "
        "prompt de implementación debe ser acotable en una revisión (un incremento): los macros I-001 e "
        "I-002-ML quedaron Superados y los vigentes son I-001 a I-009. La Tabla 6 resume regla, aplicación "
        "y evidencia."
    ),
]

TABLA6_HEADERS = ["N.º", "Regla de la política", "Cómo se aplicó en Sigemad", "Evidencia"]
TABLA6_ROWS = [
    ["1", "Revisión humana antes de integrar",
     "El tesista revisó cada salida del agente; no se integró código a ciegas",
     "Campo Revisor de cada registro; Tabla 7, criterio 3"],
    ["2", "No secretos ni datos personales en el prompt",
     "No se pegaron .env, local.php ni datos patrimoniales reales",
     "M-004; RNF de secretos; política v1.3"],
    ["3", "Versionar el prompt, no el chat",
     "Cada instrucción reejecutable vive en prompts/ con plantilla D1",
     "Catálogo; Figura 9; repositorio GitHub"],
    ["4", "ADR ante cambio de arquitectura",
     "Stack y degradación del ML documentados antes de implementar",
     "ADR-001; ADR-002; ficha M-002"],
    ["5", "Verificar con pruebas",
     "Plan funcional más tres entornos de ejecución",
     "T-001 a T-005; Tabla 12"],
    ["6", "Poder mantener el código sin el modelo",
     "Un solo desarrollador-revisor; el DoD exige explicación",
     "Tabla 7, criterios 3 y 6"],
    ["7", "Distinguir reconstruido y ejecutado",
     "Estado honesto en cada registro de fase",
     "Tablas 9 a 13"],
    ["8", "Un I-* por incremento",
     "Macros Superados; I-001 a I-009 vigentes y citables en el commit",
     "Oleada 2; Tabla 11"],
]

REPO = [
    (
        "Los prompts se organizaron por fase en un repositorio versionado, según la Figura 9. La carpeta "
        "01_requisitos contiene R-001 a R-005; 02_diseno, D-001 a D-006; 03_implementacion, I-001 a I-009 "
        "(más dos macros Superados); 04_testing, T-001 a T-005; 05_mantenimiento, M-001 a M-004; y "
        "gobernanza reúne la plantilla maestra, el catálogo, la política de uso de IA y el registro de métricas. "
        "La convención de confirmación cita el código del prompt del incremento (por ejemplo, "
        "feat(inventario): descripción [I-002]). No se versiona el historial de conversación con el agente: "
        "el registro es la instrucción reejecutable."
    ),
]

FASE5_INTRO = [
    (
        "Cada fase se documentó con el mismo esquema: objetivo, entradas, técnica de prompting, prompts "
        "ejecutados, evaluación D2 y entregables. El texto completo de cada prompt se reserva al Apéndice B; "
        "en este apartado se presentan el código, la técnica y el artefacto. Las cinco fases no son sprints: "
        "son el ciclo de vida clásico del software, con inteligencia artificial insertada dentro de cada fase."
    ),
    (
        "La Figura 10 resume ese ciclo. La letra identifica la fase: R es requisitos, D es diseño, I es "
        "implementación, T es pruebas (del inglés testing) y M es mantenimiento. El número que sigue a la "
        "letra identifica el prompt vigente de esa fase, no un capítulo de la tesis ni un sprint. Así, R-004 "
        "es el registro de ambigüedades de requisitos y I-007 es el prompt con el que se construyó el "
        "microservicio de aprendizaje automático. Al cerrar mantenimiento puede abrirse un nuevo ciclo de "
        "requisitos si hay un cambio de alcance."
    ),
]

FASE5_DESPUES_FIG10 = [
    (
        "La Figura 10 se lee de izquierda a derecha. Cada recuadro muestra la letra de la fase, su nombre "
        "completo y el rango de prompts vigentes (R-001 a R-005, D-001 a D-006, I-001 a I-009, T-001 a "
        "T-005 y M-001 a M-004). Esos rangos son la familia D3 del caso, no una lista de tareas abiertas. "
        "El detalle de técnica, artefacto y decisión D2 se desarrolla en las Tablas 9 a 13."
    ),
    (
        "La Figura 11 no sustituye a la Figura 10: recorta solo la fase de implementación y muestra cómo "
        "el producto creció por incrementos. No es un calendario de sprints ni una caja de dos semanas. "
        "Cada recuadro tiene tres datos: la versión del software (0.1.0 a 0.9.1), el prompt de "
        "implementación que la produjo (I-001 a I-009) y el módulo entregado. I-001 no significa "
        "«incremento uno» de forma aislada: la I identifica la fase de implementación y el número es el "
        "identificador del prompt."
    ),
]

FASE5_DESPUES_FIG11 = [
    (
        "La lectura de la Figura 11 es acumulativa. I-001 (versión 0.1.0) dejó los cimientos, la API y el "
        "esquema. I-002 (0.2.0) entregó el inventario de equipos. I-003 (0.3.0) las fichas técnicas y el "
        "mantenimiento. I-004 (0.4.0) los reportes PDF. I-005 (0.5.0) la configuración organizacional. "
        "I-006 (0.6.0) la autenticación JWT y el tablero. I-007 (0.7.0) el microservicio de aprendizaje "
        "automático. I-008 (0.8.0 a 0.9.0) la telemetría y la ficha predictiva. I-009 (parche 0.9.1) el "
        "control de acceso por rol y la plantilla Excel. El puente con GitHub (SHA y archivo ancla) está "
        "en las Tablas 11 y 14."
    ),
]

FASE51 = [
    (
        "La fase de requisitos (código R) tuvo por objetivo cerrar el alcance, las personas, las historias "
        "de usuario, las ambigüedades y los requisitos no funcionales antes de diseñar. Las entradas fueron "
        "la ficha institucional y el conocimiento del área de informática de la Municipalidad Provincial de "
        "Acobamba; el mapa de procesos de los apartados 3.4 y 3.5 se incorpora como insumo de elicitación. "
        "Las técnicas predominantes fueron el encadenamiento de pensamiento guiado (CoT) en R-001 y R-004, "
        "y el few-shot en R-002, R-003 y R-005."
    ),
    (
        "Se ejecutaron cinco prompts vigentes. R-001 produjo la ficha del proyecto. R-002 produjo 56 "
        "historias agrupadas en ocho épicas, usadas como técnica de requisitos y no como ítems de sprint. "
        "R-003 describió las personas de Administrador, Técnico y Practicante. R-004 registró ambigüedades "
        "con estado honesto (cerrado o supuesto) y se ejecutó en la oleada 3. R-005 redactó requisitos no "
        "funcionales verificables, con identificador y evidencia. Los cinco registros recibieron decisión "
        "D2 Aprobado, con mezcla de estados Reconstruido y Ejecutado, según la Tabla 9. Los entregables "
        "quedan en documents/01_requisitos/."
    ),
]

FASE52 = [
    (
        "La fase de diseño (código D) tuvo por objetivo fijar el modelo de datos, el stack, el contrato de "
        "la API, el mapa del frontend y el recorte del componente predictivo, de modo que la implementación "
        "no improvisara arquitectura en el código. Las entradas fueron las historias, los requisitos no "
        "funcionales y el esquema ya existente. Las técnicas fueron few-shot sobre el DDL, Tree-of-Thought "
        "en las alternativas de los ADR, RAG sobre rutas y características del frontend, y CoT en el "
        "análisis de aprendizaje automático."
    ),
    (
        "D-001 produjo el esquema y el modelo entidad-relación. D-002 dejó el ADR-001 (React, PHP REST, "
        "MySQL y ML opcional detrás de PHP). D-003 formalizó el contrato de la API. D-004 mapeó las "
        "pantallas. D-005 analizó la viabilidad del mantenimiento predictivo. D-006 dejó el ADR-002: si el "
        "servicio predictivo no responde, el resto del sistema opera. Los registros y la decisión D2 se "
        "resumen en la Tabla 10. Los entregables viven en documents/02_diseno/."
    ),
]

FASE53 = [
    (
        "La fase de implementación (código I) entregó software por incrementos, con un prompt I-* por "
        "versión de producto. Las entradas fueron el diseño aceptado y las historias del incremento. Las "
        "técnicas fueron few-shot sobre el esqueleto de I-001 e I-002, y CoT en autenticación, aprendizaje "
        "automático, telemetría y control de acceso. A diferencia de un sprint Scrum, el incremento se "
        "cerró cuando hubo artefacto integrable, revisión humana y decisión D2, no cuando venció un "
        "calendario de dos semanas."
    ),
    (
        "Tres registros ilustran el patrón. I-002 construyó el CRUD de equipos y el código patrimonial de "
        "doce dígitos. I-007 levantó el microservicio de aprendizaje automático con degradación si el "
        "servicio no está disponible. I-009 incorporó requireRole tras un hallazgo de seguridad: la "
        "autorización no podía quedar solo en la interfaz. I-008 e I-009 no borran el commit de origen de "
        "los módulos que evolucionan. Las Tablas 11 y 14 concentran incrementos, versiones y anclas en el "
        "repositorio; la Figura 11 es la vista de esa línea de producto."
    ),
]

FASE54 = [
    (
        "La fase de pruebas (código T) tuvo por objetivo verificar adecuación funcional y no dar por "
        "cerrado un incremento porque el modelo hubiera generado código. Las entradas fueron las historias, "
        "el contrato de la API y los incrementos ya integrados. T-001 es el plan funcional, de "
        "responsabilidad humana. T-002, T-003 y T-004 son los entornos de ejecución (PHPUnit, Vitest y "
        "pytest). T-005 permanece como plantilla de diagnóstico de un caso fallido. El responsable "
        "interpreta los resultados y decide D2; el modelo no sustituye esa lectura."
    ),
    (
        "Esa división se alinea con ISO/IEC/IEEE 29119-2: plan, diseño e implementación de pruebas, "
        "ejecución e informe de incidentes. El resumen de registros y decisiones está en la Tabla 12. Los "
        "entregables viven en documents/04_testing/ y en las carpetas de prueba de cada entorno."
    ),
]

FASE55 = [
    (
        "La fase de mantenimiento y despliegue (código M) cerró el ciclo de vida hasta el ambiente de "
        "producción institucional. M-001 documentó la secuencia de puesta en producción, las pruebas de "
        "humo, el responsable y el plan de retorno. M-004 registró el rollback y la exclusión de secretos "
        "del repositorio. M-002 y M-003 quedan como plantillas para el siguiente cambio de base de datos "
        "o de contrato: análisis de impacto y documentación posterior al cambio. El autor actuó como "
        "desarrollador y revisor."
    ),
    (
        "En términos de ISO/IEC 25000, esta fase opera sobre todo la mantenibilidad: modificabilidad "
        "controlada y capacidad de restauración. El resumen está en la Tabla 13. Con ello el ciclo "
        "R–D–I–T–M queda evidenciado desde la elicitación hasta la operación, que era el propósito de "
        "esta intervención metodológica."
    ),
]


def fill_paragraphs_after_heading(doc, heading_text, paragraphs, replace_startswith=None):
    """Replace the first body paragraph after a heading, then insert the rest once."""
    heading = find_para(doc, lambda p: p.text.strip() == heading_text)
    if heading is None:
        raise RuntimeError(f"No se encontró el encabezado: {heading_text}")
    body = None
    seen_heading = False
    for p in doc.paragraphs:
        if p is heading:
            seen_heading = True
            continue
        if not seen_heading:
            continue
        t = p.text.strip()
        if not t:
            continue
        if t[:2].isdigit() or t.startswith("Tabla ") or t.startswith("Figura ") or t.startswith("Gráfico"):
            break
        body = p
        break
    if body is None:
        el = heading._element
        for text in paragraphs:
            p = insert_body_after(el, text, doc)
            el = p._element
        return
    first = paragraphs[0]
    if replace_startswith is None or body.text.strip().startswith(replace_startswith) or body.text.strip()[:40] in first:
        set_runs_text(body, first)
    else:
        # If the body was already rewritten with our first paragraph, keep it.
        if body.text.strip().startswith(first[:40]):
            pass
        else:
            set_runs_text(body, first)
    if len(paragraphs) == 1:
        return
    # Insert remaining only if the second paragraph is not already present.
    if has_text(doc, paragraphs[1][:48]):
        return
    el = body._element
    for text in paragraphs[1:]:
        p = insert_body_after(el, text, doc)
        el = p._element


def insert_block_after_caption(doc, caption_startswith, paragraphs, unique_needle):
    if has_text(doc, unique_needle):
        return
    cap = find_para(doc, lambda p: p.text.strip().startswith(caption_startswith))
    if cap is None:
        raise RuntimeError(f"No se encontró el título: {caption_startswith}")
    el = cap._element
    for text in paragraphs:
        p = insert_body_after(el, text, doc)
        el = p._element


def update_iso_and_tables(doc):
    h22 = find_para(doc, lambda p: p.text.strip() == "2.2 Posicionamiento frente a estándares")
    if h22 is not None and not has_text(doc, "El anclaje normativo de esta intervención se organiza en tres capas"):
        insert_body_after(
            h22._element,
            "El anclaje normativo de esta intervención se organiza en tres capas: calidad del proceso "
            "(ISO 9001), calidad del producto de software (ISO/IEC 25000, familia SQuaRE) y procesos de "
            "prueba (ISO/IEC/IEEE 29119-2).",
            doc,
        )

    fill_paragraphs_after_heading(
        doc, "2.2.1 ISO 9001", ISO9001,
        replace_startswith="ISO 9001 se emplea",
    )

    h250 = find_para(doc, lambda p: "2.2.2" in p.text and "250" in p.text)
    if h250 is not None:
        set_heading_text(h250, "2.2.2 ISO/IEC 25000")
    fill_paragraphs_after_heading(
        doc, "2.2.2 ISO/IEC 25000", ISO25000,
        replace_startswith="ISO/IEC 25010 orienta",
    )
    # If heading was already changed but body not, try again with new heading
    if not has_text(doc, "La familia ISO/IEC 25000"):
        fill_paragraphs_after_heading(doc, "2.2.2 ISO/IEC 25000", ISO25000)

    fill_paragraphs_after_heading(
        doc, "2.2.3 ISO/IEC/IEEE 29119-2", ISO29119,
        replace_startswith="La fase de pruebas se alinea",
    )

    cap3 = find_para(doc, lambda p: p.text.strip().startswith("Tabla 3."))
    if cap3 is not None:
        set_runs_text(
            cap3,
            "Tabla 3. Fases del Prompt-Centered SDLC y características de calidad ISO/IEC 25000.",
            size=11, italic=True, center=True, first_indent=0, after=12,
        )

    for t in doc.tables:
        if len(t.rows) >= 6 and "Fase" in t.cell(0, 0).text and "Prompt" in t.cell(0, 1).text:
            set_cell_text(t.cell(0, 2), "Característica ISO/IEC 25000 (producto)", size=8, bold=True)
            mapping = [
                (1, "Adecuación funcional"),
                (2, "Mantenibilidad (modularidad, analizabilidad)"),
                (3, "Eficiencia en el desempeño"),
                (4, "Adecuación funcional (corrección funcional)"),
                (5, "Mantenibilidad (modificabilidad y restauración)"),
            ]
            for r, val in mapping:
                set_cell_text(t.cell(r, 2), val, size=8)
            break

    bib = find_para(doc, lambda p: p.text.strip().startswith("[19]") and "25010" in p.text)
    if bib is not None:
        set_runs_text(
            bib,
            "[19]\tISO/IEC 25000, Systems and software engineering — Systems and software Quality "
            "Requirements and Evaluation (SQuaRE) — Guide to SQuaRE.",
            size=11, first_indent=0, after=6, justify=True,
        )


def update_politica(doc):
    fill_paragraphs_after_heading(
        doc, "4.1 Política mínima de uso de IA", POLITICA,
        replace_startswith="Se aplicó una política mínima",
    )
    if has_text(doc, "Tabla 6. Aplicación de la política mínima"):
        return
    # Insert table after the last policy paragraph
    last = None
    for p in doc.paragraphs:
        if p.text.strip().startswith("Quinta, las salidas se verifican"):
            last = p
    if last is None:
        last = find_para(doc, lambda p: p.text.strip().startswith("La política se concreta en ocho reglas"))
    if last is None:
        raise RuntimeError("No se localizó el párrafo final de 4.1 para insertar la Tabla 6.")
    insert_table_after(last, TABLA6_HEADERS, TABLA6_ROWS, doc, [1.1, 4.0, 5.2, 4.2])
    # Caption after the moved table: find the table element next sibling
    tbl = last._element.getnext()
    insert_caption_after(
        tbl,
        "Tabla 6. Aplicación de la política mínima de uso de IA en el caso Sigemad MPA.",
        doc,
    )


def update_repo(doc):
    fill_paragraphs_after_heading(
        doc, "4.2 Repositorio de prompts", REPO,
        replace_startswith="Los prompts se organizaron",
    )
    if has_text(doc, GITHUB_PROMPTS):
        return
    body = None
    seen = False
    for p in doc.paragraphs:
        if p.text.strip() == "4.2 Repositorio de prompts":
            seen = True
            continue
        if seen and p.text.strip().startswith("Los prompts se organizaron"):
            body = p
            break
    if body is None:
        return
    if has_text(doc, "La evidencia pública de esa carpeta"):
        return
    p = insert_body_after(body._element, "", doc)
    # rebuild with hyperlink
    for r in list(p.runs):
        r.text = ""
    run = p.add_run(
        "La evidencia pública de esa carpeta está en el repositorio GitHub del caso, ruta prompts/: "
    )
    _font(run, 12)
    add_hyperlink(p, GITHUB_PROMPTS, GITHUB_PROMPTS, size=12)
    run2 = p.add_run(
        ". Allí se publican los registros R, D, I, T y M, y la gobernanza (plantilla, catálogo, política "
        "y métricas). Esa URL permite auditar que los prompts no viven solo en un chat local."
    )
    _font(run2, 12)
    style_body(p)


def update_fases(doc, img_ciclo, img_inc):
    fill_paragraphs_after_heading(
        doc, "5. Aplicación por fases del SDLC", FASE5_INTRO,
        replace_startswith="Cada fase se documentó",
    )
    ok10 = replace_picture_before_caption(doc, "Figura 10.", img_ciclo, 16.0)
    ok11 = replace_picture_before_caption(doc, "Figura 11.", img_inc, 16.0)
    print("Figuras reemplazadas:", ok10, ok11)

    cap10 = find_para(doc, lambda p: p.text.strip().startswith("Figura 10."))
    if cap10 is not None:
        set_runs_text(
            cap10,
            "Figura 10. Ciclo de vida R–D–I–T–M: Requisitos, Diseño, Implementación, Pruebas y "
            "Mantenimiento, con la familia de prompts vigentes.",
            size=11, italic=True, center=True, first_indent=0, after=8,
        )
    cap11 = find_para(doc, lambda p: p.text.strip().startswith("Figura 11."))
    if cap11 is not None:
        set_runs_text(
            cap11,
            "Figura 11. Línea de incrementos de producto (versiones 0.1.0 a 0.9.1) y prompt de "
            "implementación asociado. No son sprints Scrum.",
            size=11, italic=True, center=True, first_indent=0, after=8,
        )

    insert_block_after_caption(
        doc, "Figura 10. Ciclo de vida R–D–I–T–M",
        FASE5_DESPUES_FIG10[:1],
        "La Figura 10 se lee de izquierda a derecha",
    )
    # Second fig10 paragraph was merged into intro; insert fig11 explanations after fig11 caption
    insert_block_after_caption(
        doc, "Figura 11. Línea de incrementos",
        FASE5_DESPUES_FIG10[1:] + FASE5_DESPUES_FIG11,
        "La Figura 11 no sustituye a la Figura 10",
    )

    fill_paragraphs_after_heading(doc, "5.1 Fase de requisitos", FASE51, "En requisitos se cerraron")
    fill_paragraphs_after_heading(doc, "5.2 Fase de diseño", FASE52, "En diseño se fijaron")
    fill_paragraphs_after_heading(doc, "5.3 Fase de implementación", FASE53, "En implementación se entregó")
    fill_paragraphs_after_heading(doc, "5.4 Fase de testing", FASE54, "En pruebas se ejecutaron")
    fill_paragraphs_after_heading(doc, "5.5 Fase de mantenimiento y despliegue", FASE55, "La puesta en producción se documentó")


DROP_STARTS = (
    "ISO 9001 se emplea para argumentar que el desarrollo asistido por IA debe dejar registros controlados",
    "ISO/IEC 25010 orienta las características de calidad del producto",
    "La fase de pruebas se alinea con los procesos de ISO/IEC/IEEE 29119-2 (plan, diseño e implementación de pruebas). ISO/IEC 29110 se menciona solo como contexto de un equipo muy pequeño (VSE)",
    "Se aplicó una política mínima de uso de IA: revisión humana antes de integrar; prohibición",
    "Los prompts se organizaron por fase en un repositorio versionado, según la Figura 9. La convención de confirmación en el control de versiones cita el código del prompt del incremento.",
    "En requisitos se cerraron el alcance, las personas, las historias, las ambigüedades y los requisitos no funcionales. Las técnicas predominantes fueron el encadenamiento",
    "En diseño se fijaron el modelo de datos, el stack, el contrato de la API, el mapa del frontend y el recorte del componente predictivo. Las decisiones de arquitectura quedaron en los ADR-001 y ADR-002.",
    "En implementación se entregó el software por incrementos, con un prompt I-* por versión. Tres registros ilustran el patrón: I-002 (inventario y código patrimonial)",
    "En pruebas se ejecutaron el plan funcional y los runners asociados a T-001 a T-005.",
    "La puesta en producción se documentó con el registro M-001: secuencia de despliegue, pruebas de humo, responsable y plan de retorno. El rollback y la exclusión de secretos constan en M-004.",
)


def delete_paragraph(p):
    el = p._element
    parent = el.getparent()
    if parent is not None:
        parent.remove(el)


def cleanup_leftovers(doc):
    for p in list(doc.paragraphs):
        t = p.text.strip()
        if any(t.startswith(s) for s in DROP_STARTS):
            delete_paragraph(p)

    intro = find_para(doc, lambda p: p.text.strip().startswith("Cada fase se documentó con el mismo esquema"))
    if intro is not None and "Las cinco fases no son sprints" not in intro.text:
        set_runs_text(intro, FASE5_INTRO[0])
        if not has_text(doc, "La Figura 10 resume ese ciclo. La letra identific"):
            p = insert_body_after(intro._element, FASE5_INTRO[1], doc)
            return p
    return None


def cleanup_document(doc):
    # Quitar interpolaciones en el índice (entre 5. y 6. del contenido).
    paras = list(doc.paragraphs)
    toc_mode = False
    for p in paras:
        t = p.text.strip()
        if t == "Contenido del anexo":
            toc_mode = True
            continue
        if toc_mode and t == "1. Introducción a la intervención metodológica" and p is not paras[11]:
            # the second occurrence starts the body; stop toc cleanup at first body heading later
            pass
        if toc_mode and t == "5. Aplicación por fases del SDLC":
            # delete following paras until 6.
            nxt = p._element.getnext()
            while nxt is not None:
                texts = "".join(nxt.itertext()).strip() if nxt.tag.endswith("}p") else ""
                if texts.startswith("6. Evaluación"):
                    break
                if nxt.tag.endswith("}p") and texts and not texts.startswith("6."):
                    nxt_next = nxt.getnext()
                    parent = nxt.getparent()
                    parent.remove(nxt)
                    nxt = nxt_next
                    continue
                nxt = nxt.getnext()
            toc_mode = False

    # Deduplicar copias recientes (consecutivas o con un párrafo de por medio).
    recent = []
    for p in list(doc.paragraphs):
        t = p.text.strip()
        if t and len(t) > 60 and t in recent:
            delete_paragraph(p)
            continue
        if t:
            recent.append(t)
            recent = recent[-6:]

    # Deduplicar copias no consecutivas: conservar la que está en el cuerpo (la última).
    # Mejor: si dos consecutivos after cleanup still... already handled.

    intro = None
    seen_body_5 = False
    for p in doc.paragraphs:
        t = p.text.strip()
        if t == "5. Aplicación por fases del SDLC":
            seen_body_5 = True
            continue
        if seen_body_5 and t.startswith("Cada fase se documentó"):
            intro = p
            break
    if intro is not None:
        set_runs_text(intro, FASE5_INTRO[0])
        nxt_txt = ""
        el = intro._element.getnext()
        while el is not None and not (el.tag.endswith("}p") and "".join(el.itertext()).strip()):
            el = el.getnext()
        if el is not None and el.tag.endswith("}p"):
            nxt_txt = "".join(el.itertext()).strip()
        if not nxt_txt.startswith("La Figura 10 resume ese ciclo"):
            insert_body_after(intro._element, FASE5_INTRO[1], doc)


def main_cleanup_only():
    img_inc = draw_incrementos()
    img_ciclo = draw_ciclo_rditm()
    doc = Document(str(DOC))
    cleanup_leftovers(doc)
    cleanup_document(doc)
    replace_picture_before_caption(doc, "Figura 11.", img_inc, 16.0)
    replace_picture_before_caption(doc, "Figura 10.", img_ciclo, 16.0)
    doc.save(str(DOC))
    print("CLEAN", DOC)


def main():
    img_ciclo = draw_ciclo_rditm()
    img_inc = draw_incrementos()
    print("PNG", img_ciclo)
    print("PNG", img_inc)

    doc = Document(str(DOC))
    update_iso_and_tables(doc)
    update_politica(doc)
    update_repo(doc)
    update_fases(doc, img_ciclo, img_inc)
    cleanup_leftovers(doc)
    cleanup_document(doc)
    replace_picture_before_caption(doc, "Figura 11.", img_inc, 16.0)
    doc.save(str(DOC))
    print("OK", DOC)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "cleanup":
        main_cleanup_only()
    else:
        main()
