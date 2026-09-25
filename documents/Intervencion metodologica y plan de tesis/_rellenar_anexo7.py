# -*- coding: utf-8 -*-
"""Rellena las cajas vacías del Anexo 7 existente. No regenera el archivo ni toca 3.4/3.5."""
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor

DOC = Path(__file__).resolve().parent / "Anexo7_Intervencion_Metodologica_Prompt_Centered_SDLC.docx"

NAVY = RGBColor(0x1F, 0x3A, 0x5F)
GRAY = RGBColor(0x4A, 0x55, 0x68)
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
FONT = "Times New Roman"


def _font(run, size=10, bold=False, italic=True, color=GRAY):
    run.font.name = FONT
    run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color


def set_cell(cell, text, size=10, italic=False, color=BLACK):
    p = cell.paragraphs[0]
    for extra in list(cell.paragraphs)[1:]:
        extra._element.getparent().remove(extra._element)
    if p.runs:
        p.runs[0].text = text
        _font(p.runs[0], size=size, italic=italic, color=color)
        for run in p.runs[1:]:
            run.text = ""
    else:
        run = p.add_run(text)
        _font(run, size=size, italic=italic, color=color)


def replace_all_section_symbol(doc):
    for p in doc.paragraphs:
        for run in p.runs:
            if run.text and "§" in run.text:
                run.text = run.text.replace("§", "apartado ")
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for run in p.runs:
                        if run.text and "§" in run.text:
                            run.text = run.text.replace("§", "apartado ")


def replace_paragraph_if_contains(doc, needle, new_text):
    for p in doc.paragraphs:
        if needle in p.text:
            if p.runs:
                p.runs[0].text = new_text
                _font(p.runs[0], size=12, italic=False, color=BLACK)
                for run in p.runs[1:]:
                    run.text = ""
            else:
                run = p.add_run(new_text)
                _font(run, size=12, italic=False, color=BLACK)
            return True
    return False


CALLOUTS = {
    0: (
        "Este anexo documenta la aplicación operativa del Prompt-Centered SDLC versión 1.2 "
        "(Rojas Camayo) al desarrollo de Sigemad MPA V2. La evidencia de proceso alimenta el "
        "apartado 4.1 del Capítulo IV. No se contrastan hipótesis ni se formulan las conclusiones "
        "generales de la tesis."
    ),
    1: (
        "El Anexo 07 registra la intervención metodológica: cómo se construyó y gobernó Sigemad MPA "
        "en la Municipalidad Provincial de Acobamba mediante prompts versionados, evaluación D2, "
        "matriz de doble entrada y revisión humana. Es evidencia de proceso, no el diseño de software "
        "ni los resultados estadísticos."
    ),
    2: (
        "Se documenta la aplicación completa del Prompt-Centered SDLC v1.2 sobre Sigemad MPA V2. "
        "Se busca evidenciar (i) que cada fase R/D/I/T/M dejó registro D1/D2, (ii) que la traza "
        "prompt–artefacto–commit es auditable y (iii) que esa evidencia soporta el apartado 4.1."
    ),
    3: (
        "Fuente primaria: Rojas Camayo, Prompt-Centered SDLC versión 1.2. El marco se aplica, "
        "no se presenta como estándar cerrado: en este caso está en validación."
    ),
    4: (
        "Objetivo general de la intervención: aplicar el Prompt-Centered SDLC v1.2, desde la "
        "elicitación de requisitos hasta el despliegue, en el desarrollo de Sigemad MPA V2, "
        "dejando evidencia versionada de prompts, revisión humana y trazabilidad. Este objetivo "
        "no sustituye al objetivo general de la tesis (efecto del sistema / ML sobre el mantenimiento)."
    ),
    5: (
        "Los objetivos específicos de la intervención se resumen en la Tabla 1: anatomía D1 por fase, "
        "ciclo D2, un prompt I-* por incremento, matriz función–prompt–commit, guardrails de IA y "
        "trazabilidad HU–código–test."
    ),
    7: (
        "Queda incluido: las cinco fases del SDLC, el uso de Cursor Agent con revisión humana, "
        "el repositorio de 29 prompts vigentes, la matriz V3 y el despliegue en producción con ML "
        "opcional. Queda fuera: entrenar un modelo fundacional propio, automatización N4–N5, "
        "portal ciudadano, inventario no informático, sustitución de SIGA/SIAF y exigir FastAPI "
        "en producción. Los macroprocesos y diagramas Bizagi se incorporan en una pasada "
        "posterior (apartados 3.4 y 3.5)."
    ),
    8: (
        "El Prompt-Centered SDLC se opera en cinco dimensiones. D1 (anatomía del prompt) produjo "
        "la plantilla maestra y los registros R/D/I/T/M. D2 (evaluación) produjo el registro de "
        "métricas y las decisiones Aprobado/Superado. D3 (mapa por fase) es el catálogo de 29 "
        "prompts vigentes. D4 (gobernanza) es la política de uso de IA. D5 (trazabilidad) es la "
        "matriz de doble entrada V3. Fuente: Rojas Camayo, v1.2."
    ),
    11: (
        "El ciclo de vida ya está cubierto por las fases R/D/I/T/M del Prompt-Centered SDLC; "
        "por eso este apartado no se apoya en ISO/IEC/IEEE 12207 como norma rectora. La 12207 "
        "se reconoce como marco genérico de procesos, pero el anclaje normativo de la intervención "
        "pasa a la calidad del proceso (ISO 9001) y a la calidad del producto (ISO/IEC 25010)."
    ),
    12: (
        "El caso es un equipo muy pequeño (un tesista-desarrollador). ISO/IEC 29110 describe perfiles "
        "para VSE y se mantiene como referencia de contexto. En una pasada posterior, la fase de "
        "pruebas se alineará de forma explícita con ISO/IEC/IEEE 29119-2 (procesos de prueba), "
        "que encaja mejor con T-001…T-005 que el perfil 29110."
    ),
    13: (
        "ISO 9001 se usa para argumentar que el desarrollo asistido por IA debe dejar registros "
        "controlados (prompt versionado, revisión, no conformidad y acción correctiva = ciclo D2). "
        "ISO/IEC 25010 se usa para las características de calidad del software —en especial "
        "mantenibilidad, eficiencia en el desempeño y seguridad— ya recogidas en los RNF (R-005) "
        "y en el DoD. SWEBOK se cita solo si el asesor lo exige como cuerpo de conocimiento."
    ),
    15: (
        "Yas et al. (2023) recuerdan las fases estables del SDLC. Shrivastava et al. (2025) sitúan "
        "la GenAI en todo el ciclo y exigen ingeniería de prompts con supervisión humana. Hymel "
        "describe un SDLC nativo de IA (V-Bounce) en el que el sprint deja de calibrar el trabajo. "
        "Paladino y Pons (2025) documentan barreras de gobernanza. Ninguna de esas fuentes convierte "
        "el prompt en artefacto central con D2 y matriz; esa es la brecha que cierra esta intervención."
    ),
    17: (
        "El aporte diferencial, siguiendo a Rojas Camayo, es tratar el prompt como artefacto de "
        "ingeniería: se versiona, se evalúa (D2), se traza al commit, se gobierna con guardrails "
        "desde D1 y se mantiene con la matriz de doble entrada. La unidad de planificación es el "
        "incremento acotado, no el sprint."
    ),
    18: (
        "Esta intervención no demuestra la hipótesis de la tesis; aporta la evidencia de proceso "
        "que el apartado 4.1 debe resumir: se construyó un sistema real sin ceremonias Scrum, "
        "con incrementos densos y con registro honesto de lo reconstruido a posteriori."
    ),
    19: (
        "La identidad del caso se presenta en la Tabla 5. Sigemad MPA V2 es el software institucional "
        "y, a la vez, el artefacto con el que se valida la metodología."
    ),
    21: (
        "Restricciones: un solo desarrollador; servidor de producción PHP + MySQL; FastAPI opcional; "
        "datos patrimoniales y credenciales que no pueden entrar al prompt; stack "
        "fijado por ADR-001 (React, PHP REST, MySQL, ML opcional detrás de PHP); tiempo de tesis. "
        "El ML se degrada (ADR-002) si el microservicio no responde."
    ),
    22: (
        "Acobamba exige inventario patrimonial de 12 dígitos, fichas, historial de mantenimiento y "
        "despliegue real. Eso obliga a trazabilidad y a una política de secretos; por eso el caso "
        "sirve para validar un SDLC centrado en prompts hasta operación, no solo hasta un prototipo."
    ),
    23: (
        "Pendiente. Los apartados 3.4 y 3.5 (macroprocesos y Bizagi) se rellenan en una pasada "
        "posterior. No se modifican las figuras as-is ya pegadas."
    ),
    24: (
        "Se aplicó la política v1.3: (1) revisión humana antes de integrar; (2) no pegar credenciales, "
        ".env, local.php ni datos personales reales; (3) versionar el prompt, no el chat; (4) ADR "
        "ante cambios de arquitectura y ficha M-002 antes de tocar BD o contrato; (5) verificar con "
        "Vitest, PHPUnit, pytest y el plan funcional; (6) el equipo debe poder mantener el código "
        "sin el LLM; (7) marcar Reconstruido a posteriori cuando el artefacto ya existía; (8) un "
        "I-* por incremento."
    ),
    25: (
        "Los prompts viven en prompts/, espejo de las fases: 01_requisitos (R-001…R-005), 02_diseno "
        "(D-001…D-006), 03_implementacion (I-001…I-009), 04_testing (T-001…T-005), 05_mantenimiento "
        "(M-001…M-004) y gobernanza/ (plantilla, catálogo, política, métricas). Convención de commit: "
        "feat(modulo): descripción [I-00N]. No se versiona el historial de chat."
    ),
    26: (
        "Un incremento asistido por IA no se cierra porque el modelo haya generado código. El DoD "
        "ampliado (Tabla 7) exige criterios de aceptación, prompt versionado, revisión humana, "
        "pruebas en verde, ausencia de secretos, documentación de fase, ADR si cambió la arquitectura "
        "y traza HU–incremento–versión–módulo."
    ),
    29: (
        "Cada fase se documenta con la misma plantilla: objetivo, entradas, técnica de prompting, "
        "prompts ejecutados, evaluación D2, decisión y entregables. El texto largo del prompt va "
        "en el Apéndice B; aquí solo el código, la técnica y el output."
    ),
    30: (
        "Objetivo: cerrar alcance, personas, historias, ambigüedades y RNF. Entradas: ficha institucional "
        "y el conocimiento del área de informática (el mapa de procesos 3.4–3.5 se incorporará después). "
        "Técnicas: CoT guiado en elicitación y ambigüedades; few-shot en HU, personas y RNF. "
        "Entregables: ficha-proyecto.md, 56 HU, personas.md, ambiguedades.md, RNF."
    ),
    32: (
        "Objetivo: fijar datos, stack, contrato API, mapa frontend y el recorte del ML. Entradas: "
        "HU y RNF. Técnicas: few-shot sobre el DDL, ToT en ADR-001 y ADR-002, RAG sobre routes y "
        "src/features, CoT en el análisis ML. Entregables: SQL v2, er_v2.md, ADR-001, ADR-002, "
        "contrato_api_v2.md, frontend_features.md y el análisis predictivo."
    ),
    34: (
        "Objetivo: entregar software por incrementos, un I-* por versión. Entradas: diseño y HU del "
        "incremento. Técnicas: few-shot sobre el esqueleto I-001/I-002 y CoT en auth, ML, telemetría "
        "y RBAC. Tres prompts representativos: I-002 (CRUD equipos y código de 12 dígitos), I-007 "
        "(microservicio ML) e I-009 (requireRole tras un hallazgo de seguridad)."
    ),
    38: (
        "El despliegue de producción se documentó con M-001 (build Vite, backend PHP, "
        "SSL, cambio de admin). El rollback y la exclusión de secretos están en M-004. M-002 y M-003 "
        "quedan como plantillas para el próximo cambio de BD o de contrato. Responsable: el tesista "
        "como desarrollador y revisor."
    ),
    40: (
        "El ciclo D2, según Rojas Camayo, es medición → diagnóstico → refinamiento o versionado → "
        "decisión (Aprobado, Refinado, Rechazado, Dividir o Superado). En Sigemad las iteraciones "
        "de origen de varios I-* no se midieron en caliente; eso se declara en la Tabla 15."
    ),
    42: (
        "El caso de refinamiento es el macro I-001 (API + auth + inventario) y el alias I-002-ML. "
        "La oleada 2 los declaró Superados y los partió en I-001…I-009. Un identificador = un "
        "incremento; los macros no se borran."
    ),
    44: (
        "La matriz de doble entrada V3 conecta cada función F-001…F-008 con su fase, su prompt, "
        "el commit GitHub, el archivo en ese SHA y, cuando existe, el test. Sirve para mantener "
        "el sistema y para auditar la intervención."
    ),
    45: (
        "Se apoya en Amaro et al. (capacidades DevOps y procesos del ciclo de vida) y en Jiang et al. "
        "(versionado y calidad de prompts). La unión de ambos más el enlace navegable al repositorio "
        "es la operacionalización propia de este caso."
    ),
    46: (
        "Columnas: identificación de la función; impacto LCP; cinco capacidades DevOps (control de "
        "versiones, CI, CD, test automation, continuous monitoring) con estado Sí/Parcial/No; "
        "datos del prompt; ruta y SHA; test; observaciones. El detalle está en el Excel del Apéndice A."
    ),
    47: (
        "Se aplicó a F-001…F-008 más I-008 e I-009. El control de versiones es Sí (GitHub). CI/CD "
        "y monitoreo continuo son Parcial o No: no hay pipeline de integración en producción. Los "
        "tests unitarios existen por runner (T-002/003/004). El Excel completo es el Apéndice A."
    ),
    49: (
        "Ante un cambio futuro: (1) ubicar la función en la matriz; (2) leer el prompt de origen y "
        "sus iteraciones; (3) abrir el archivo en el SHA; (4) ejecutar el test asociado; (5) si el "
        "cambio usa IA, versionar un prompt nuevo o una vN+1; (6) actualizar commit, iteraciones y "
        "columnas DevOps."
    ),
    50: (
        "La evidencia primaria es documents/matriz_doble_entrada/MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx "
        "y prompts_detallados.md (Apéndice A)."
    ),
    51: (
        "Se alcanzó el nivel N2: agente acotado (Cursor Agent) que genera artefactos; el humano "
        "define el prompt, revisa, prueba e integra. No hay encadenamiento autónomo de agentes "
        "en producción."
    ),
    52: (
        "No se avanzó a N3–N5 porque el caso es una entidad pública, hay secretos y datos patrimoniales, "
        "y la tesis exige poder explicar cada decisión. Un agente sin revisión por paso no es "
        "aceptable en este contexto."
    ),
    54: (
        "Los guardrails se escriben en el bloque No hacer y en las restricciones D1. La Tabla 18 "
        "los cruza con el control posterior (revisión, tests, I-009, M-004)."
    ),
    56: (
        "Se monitorea: disponibilidad del API PHP, degradación del ML (ADR-002: el sistema sigue "
        "si FastAPI no responde), errores de autenticación y el cumplimiento de la política de IA "
        "en cada cambio. No hay APM de producción; el monitoreo es operativo y por "
        "revisión de logs/despliegue. Frecuencia: en cada incremento y en cada publicación."
    ),
    57: (
        "La política v1.3 se cumplió en lo esencial (revisión, no secretos en repo, versionado, ADR). "
        "La auditoría periódica formal aún está pendiente, como se declara en las limitaciones."
    ),
    58: (
        "La Tabla 19 resume cuatro hilos representativos. El detalle por función está en el apartado 7 "
        "y en la matriz de historias."
    ),
    60: (
        "Solo se reportan métricas de proceso (Tabla 20 y Figura 14). Accuracy/F1 del modelo I-007 "
        "es una medición D2 de ese prompt, no la contrastación de la hipótesis de la tesis."
    ),
    62: (
        "Las lecciones (Tabla 21) son técnicas y metodológicas: reconstruir no es lo mismo que "
        "ejecutar; un macro-prompt no se puede citar en el commit; un solo municipio no generaliza; "
        "el ML opcional queda fuera de un SDLC de ML en producción."
    ),
    64: (
        "Se aplicó el Prompt-Centered SDLC v1.2 de forma documentada, con 29 prompts vigentes, "
        "siete incrementos más el parche 0.9.1, matriz V3 y política de IA. Esta evidencia soporta "
        "el apartado 4.1. Las conclusiones y recomendaciones de la tesis no se enuncian aquí."
    ),
    65: (
        "Las referencias de este anexo se listan abajo. Deben coincidir con las fuentes citadas "
        "en el cuerpo (Rojas Camayo; corpus de IA en el SDLC; Amaro; Jiang; ISO 9001; ISO/IEC 25010)."
    ),
}


def fill_table_cells(table, mapping):
    """mapping: (row, col) -> text"""
    for (r, c), text in mapping.items():
        set_cell(table.cell(r, c), text, size=8, italic=False, color=BLACK)


def add_tool_rows(table):
    extras = [
        ["Cursor (IDE + Agent)", "Entorno de desarrollo y generación asistida", "R, D, I, T, M"],
        ["PHP 8.1+ / Composer", "API REST, PDO, JWT, dependencias backend", "I, T, M"],
        ["React 19 / Vite / Axios / Tailwind", "SPA, cliente HTTP y estilos", "I, T"],
        ["Python 3.10+ / FastAPI / Uvicorn", "Microservicio ML (opcional)", "D, I, T"],
        ["Scikit-learn / pandas / joblib", "Entrenamiento y persistencia del modelo de riesgo", "D, I, T"],
        ["XAMPP (Apache + MySQL + PHP)", "Entorno local de desarrollo", "I, T, M"],
        ["Servidor de producción (Apache + PHP)", "Despliegue de producción (FastAPI opcional)", "M"],
        ["Dompdf / jsPDF", "Fichas y reportes PDF", "I"],
        ["Openspout", "Plantilla y carga masiva Excel", "I"],
        ["Git", "Historial local antes del push a GitHub", "I, T, M"],
    ]
    for vals in extras:
        row = table.add_row()
        for i, val in enumerate(vals):
            set_cell(row.cells[i], val, size=8, italic=False, color=BLACK)


def main():
    doc = Document(str(DOC))
    replace_all_section_symbol(doc)

    replace_paragraph_if_contains(
        doc,
        "Este archivo es una plantilla para guiar",
        "Borrador de trabajo del Anexo 07. Las cajas ya contienen prosa para revisar. "
        "Los apartados 3.4 y 3.5 (macroprocesos y Bizagi) se dejan para una pasada posterior. "
        "Elimine las cajas residuales cuando pase el texto al estilo Continental.",
    )
    replace_paragraph_if_contains(doc, "Corregir este simbolo", "")
    replace_paragraph_if_contains(
        doc,
        "Aqui vamos a trabajar con iso 9001",
        "En este caso la calidad del proceso se ancla en ISO 9001 (registros, revisión y mejora = D1/D2). "
        "ISO/IEC 29110 queda como contexto VSE; la fase de pruebas se alineará después con ISO/IEC/IEEE 29119-2.",
    )
    replace_paragraph_if_contains(
        doc,
        "Luego vamos a remplazar el iso 29110",
        "ISO/IEC 25010 cubre las características de producto (mantenibilidad, eficiencia, seguridad) "
        "que la metodología ya opera como RNF y DoD; por eso no se usa ISO/IEC/IEEE 12207 como norma rectora.",
    )
    replace_paragraph_if_contains(
        doc,
        "Luego ISO 25010",
        "",
    )
    replace_paragraph_if_contains(
        doc,
        "Ayudame a completer las herramientas",
        "La Tabla 8 lista el stack real del caso (ADR-001) y las herramientas de IA, calidad y operación.",
    )

    for idx, text in CALLOUTS.items():
        if idx >= len(doc.tables):
            continue
        table = doc.tables[idx]
        if len(table.rows) == 1 and len(table.columns) == 1:
            set_cell(table.cell(0, 0), text, size=10, italic=False, color=BLACK)

    # Tabla 3: de 12207 a 25010
    t14 = doc.tables[14]
    fill_table_cells(t14, {
        (0, 2): "Característica ISO/IEC 25010 (producto)",
        (1, 2): "Adecuación funcional",
        (2, 2): "Mantenibilidad (modularidad, analizabilidad)",
        (3, 2): "Seguridad / fiabilidad",
        (4, 2): "Corrección funcional (pruebas)",
        (5, 2): "Mantenibilidad / portabilidad (despliegue)",
    })

    # Tabla 4 literatura
    t16 = doc.tables[16]
    fill_table_cells(t16, {
        (2, 0): "Shrivastava et al. (2025)",
        (2, 1): "GenAI transversal al SDLC; ingeniería de prompts; supervisión humana",
        (2, 2): "Prompt como registro versionado con D2 y matriz",
        (2, 3): "Se opera el prompt como artefacto D1/D2, no como chat",
        (3, 0): "Hymel (AI-Native SDLC / V-Bounce); Paladino y Pons (2025)",
        (3, 1): "El sprint deja de calibrar; hay barreras de gobernanza",
        (3, 2): "Instrumento de trazabilidad función–prompt–commit",
        (3, 3): "Incrementos + matriz V3 + política de IA",
    })

    # Ficha: corregir fuera de alcance si quedó mal
    t20 = doc.tables[20]
    set_cell(
        t20.cell(8, 1),
        "Portal ciudadano, bienes no TI, SIGA/SIAF y ML obligatorio en producción (el módulo se apaga si no hay FastAPI)",
        size=9, italic=False, color=BLACK,
    )

    # Técnicas requisitos / diseño
    t31 = doc.tables[31]
    fill_table_cells(t31, {
        (1, 1): "CoT guiado",
        (2, 1): "Few-shot (Como/quiero/para)",
        (3, 1): "Few-shot (ficha de persona)",
        (4, 1): "CoT guiado (R-01)",
        (5, 1): "Few-shot (ID / requisito / evidencia)",
    })
    t33 = doc.tables[33]
    fill_table_cells(t33, {
        (1, 1): "Few-shot (DDL) + CoT",
        (2, 1): "Few-shot sobre el SQL as-built",
        (3, 1): "Tree-of-Thought (alternativas)",
        (4, 1): "RAG sobre routes + few-shot JSON",
        (5, 1): "RAG sobre src/features",
        (6, 1): "CoT (viable / por fases)",
        (7, 1): "Tree-of-Thought (opciones A–D)",
    })

    # MySQL fase + más herramientas
    t28 = doc.tables[28]
    set_cell(t28.cell(2, 0), "MySQL", size=8, italic=False, color=BLACK)
    set_cell(t28.cell(2, 2), "I, T, M", size=8, italic=False, color=BLACK)
    add_tool_rows(t28)

    # D2 iteraciones
    t41 = doc.tables[41]
    fill_table_cells(t41, {
        (1, 2): "Ejecutado (oleada 3)",
        (5, 0): "I-009",
        (5, 1): "Implementación",
        (5, 2): "1 (parche)",
        (5, 3): "AUTH-005, CFG-006, INV-004",
        (5, 4): "Aprobado",
        (5, 5): "Hallazgo de seguridad = prompt nuevo",
    })

    # DevOps extract
    t48 = doc.tables[48]
    fill_table_cells(t48, {
        (1, 4): "No (sin pipeline de CI/CD)",
        (1, 5): "Parcial (plan T-001 + PHPUnit)",
        (1, 6): "No en producción",
        (2, 4): "No",
        (2, 5): "Sí (pytest T-004)",
        (2, 6): "Parcial (degradación ADR-002)",
        (3, 0): "F-001…F-008",
        (3, 1): "ver Tabla 14",
        (3, 2): "varios SHA",
        (3, 3): "Sí",
        (3, 4): "No",
        (3, 5): "Parcial",
        (3, 6): "No / Parcial ML",
    })

    # HU síntesis
    t59 = doc.tables[59]
    fill_table_cells(t59, {
        (1, 4): "Plan T-001 / PHPUnit equipos",
        (2, 0): "HU-MANT (ficha y timeline)",
        (2, 4): "Plan T-001 mantenimiento",
        (3, 0): "HU-ML (riesgo / lote)",
    })

    # Referencias 14.1
    replace_paragraph_if_contains(
        doc,
        "ISO/IEC/IEEE 12207; ISO/IEC 29110; SWEBOK",
        "ISO 9001 (sistemas de gestión de la calidad). ISO/IEC 25010 (calidad del producto de software). "
        "ISO/IEC 29110 (contexto VSE). ISO/IEC/IEEE 29119-2 (procesos de prueba; alineación prevista). "
        "SWEBOK solo si se cita en el cuerpo.",
    )
    replace_paragraph_if_contains(
        doc,
        "Yas et al. (2023); [completar",
        "Yas, Alazzawi y Rahmatullah (2023); Shrivastava et al. (2025); Hymel (AI-Native SDLC); "
        "Paladino y Pons (2025).",
    )
    replace_paragraph_if_contains(
        doc,
        "Rojas Camayo. Prompt-Centered SDLC versión 1.2. [completar ficha bibliográfica].",
        "Rojas Camayo. Prompt-Centered SDLC versión 1.2. [completar ciudad, editorial o URL institucional].",
    )

    # Apéndice G pendiente
    t66 = doc.tables[66]
    set_cell(t66.cell(7, 2), "Pendiente (pasada 3.4 / 3.5)", size=8, italic=False, color=BLACK)
    set_cell(t66.cell(3, 2), "Seleccionar 1 HU, ADR-001, 1 controlador y 1 test", size=8, italic=False, color=BLACK)
    set_cell(t66.cell(4, 2), "I-002, D-006 y M-004 (recomendado)", size=8, italic=False, color=BLACK)
    set_cell(t66.cell(5, 2), "Salida de composer test / npm test / pytest", size=8, italic=False, color=BLACK)
    set_cell(t66.cell(6, 2), "Checklist de producción + captura de publicación", size=8, italic=False, color=BLACK)

    # Tabla 14 caption leftover "§ 7"
    replace_paragraph_if_contains(
        doc,
        "No duplique esta tabla en el",
        "I-008 e I-009 son evoluciones del mismo módulo. No borre el SHA de origen. No duplique esta tabla en el apartado 7.",
    )
    replace_paragraph_if_contains(
        doc,
        "Cómo usarla. Ajuste los OE",
        "Los OE de la Tabla 1 son de la intervención, no los del Capítulo I.",
    )
    replace_paragraph_if_contains(
        doc,
        "Cómo usarla. Ajuste los nombres de proceso",
        "La columna normativa de la Tabla 3 usa ISO/IEC 25010 (calidad de producto), no 12207.",
    )
    replace_paragraph_if_contains(
        doc,
        "Cómo usarla. Elabore el párrafo citando esta figura",
        "La Figura 1 es la unidad de trabajo: si el prompt se refina, el ciclo vuelve al primer recuadro.",
    )

    doc.save(str(DOC))
    print("OK", DOC)


if __name__ == "__main__":
    main()
