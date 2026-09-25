# SonarQube — Sigemad MPA

Evidencia de **código limpio** para la matriz V4. El analizador se corre contra el código de producto; esta carpeta guarda la **configuración** y los **registros**, no sustituye a Git.

## Cómo analizar

Desde la **raíz del repositorio** (las rutas `src`, `backend/`, `ml/` son relativas a esa raíz):

```text
sonar-scanner -Dproject.settings=documents/06_calidad/sonarqube/sonar-project.properties
```

Servidor local (SonarQube) o SonarCloud: descomentar `sonar.host.url` / `sonar.organization` en el properties. El token no se commitea (`.env` o variable `SONAR_TOKEN`).

## Después de cada corrida

1. Copiar [plantilla_registro_analisis.md](./plantilla_registro_analisis.md) a `evidencias/YYYY-MM-DD/registro.md`.
2. Exportar o capturar el resumen (calidad, bugs, vulnerabilidades, code smells, cobertura si hay).
3. Por función tocada, anotar Sí / Parcial / No en la V4 y pegar el enlace GitHub a esa evidencia.
4. Si hay blocker/critical: abrir NC en [`../no_conformidades/`](../no_conformidades/).

No subir dumps con secretos, JWT ni URLs internas con credenciales.
