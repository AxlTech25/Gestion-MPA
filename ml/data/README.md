# Dataset A — Riesgo por equipo (Sprint 6)

Una fila = **un equipo** con features agregadas de mantenimiento y variable objetivo `nivel_riesgo`.

## Archivos

| Ruta | Descripción | Filas |
|------|-------------|-------|
| `synthetic/equipos_riesgo_v200.csv` | Dataset sintético principal (entrenamiento/demo) | 200 |
| `synthetic/equipos_riesgo_sample_20.csv` | Muestra reducida para pruebas rápidas | 20 |
| `processed/equipos_riesgo_v1.csv` | Exportado desde MySQL (datos reales + sintéticos en BD) | ≥200 |

## Diccionario de columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `equipo_id` | int | ID del equipo |
| `codigo_patrimonial` | string | Código único (12 dígitos en producción) |
| `tipo_equipo` | cat | Laptop, CPU, Monitor, Impresora, Otro |
| `marca`, `modelo` | string | Identificación del fabricante |
| `ram_gb` | int/null | Memoria RAM |
| `almacenamiento_gb` | int/null | Capacidad de disco |
| `tipo_disco` | cat | HDD, SSD, NVMe |
| `ultima_temp_disco` | int/null | °C última lectura disco |
| `horas_uso` | int | Horas de uso acumuladas |
| `errores_smart` | int | Errores SMART del disco |
| `salud_bateria` | float/null | % salud batería (laptops) |
| `contador_paginas` | int/null | Páginas impresas (impresoras) |
| `antiguedad_meses` | int | Meses desde `fecha_adquisicion` |
| `estado_conservacion` | cat | Nuevo, Bueno, Regular, Malo |
| `estado_operativo` | cat | Operativo, Dañado, Excedencia, Baja |
| `area_id`, `area_nombre` | int/string | Área asignada |
| `total_mantenimientos` | int | Total histórico |
| `correctivos_12m` | int | Correctivos en últimos 12 meses |
| `preventivos_12m` | int | Preventivos en últimos 12 meses |
| `dias_desde_ultimo_mantenimiento` | int/null | Días desde la última intervención |
| `severidad_max_historica` | int | 0–4 (Baja=1 … Crítica=4) |
| `fallas_altas_criticas_12m` | int | Fallas Alta/Crítica en 12 meses |
| **`nivel_riesgo`** | **target** | Bajo, Medio, Alto, Critico |
| `score_riesgo` | float | 0–100 (referencia para UI) |

## Reglas del target (`nivel_riesgo`)

1. **Critico** — `estado_operativo = Dañado` OR ≥2 fallas Alta/Crítica en 12 meses  
2. **Alto** — ≥1 falla Alta/Crítica OR ≥3 correctivos en 12 meses  
3. **Medio** — antigüedad > 48 meses OR conservación Regular/Malo  
4. **Bajo** — resto  

## Regenerar datasets

```bash
cd gestion_mpa
pip install -r ml/requirements.txt

# CSV sintético 200 equipos
python ml/scripts/generate_synthetic.py --rows 200

# Muestra rápida 20 filas
python ml/scripts/generate_synthetic.py --rows 20 --output ml/data/synthetic/equipos_riesgo_sample_20.csv

# Insertar 200 equipos sintéticos en MySQL + CSV
python ml/scripts/generate_synthetic.py --rows 200 --seed-db

# Exportar desde BD (después del seed o datos reales)
python ml/scripts/build_dataset.py
```

## Códigos patrimoniales sintéticos

Los equipos generados usan prefijo `990` (ej. `990000009001`) para distinguirlos de datos reales.
