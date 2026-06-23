#!/usr/bin/env python3
"""Verificación integral Sprint 6 ML."""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

FASTAPI = "http://127.0.0.1:8000"
PHP_API = "http://localhost/gestion_mpa/backend/api/v2/index.php?request="

results: list[tuple[str, bool, str]] = []


def ok(name: str, detail: str = ""):
    results.append((name, True, detail))


def fail(name: str, detail: str = ""):
    results.append((name, False, detail))


def get_json(url: str, headers: dict | None = None, data: dict | None = None, timeout: int = 120):
    body = json.dumps(data).encode() if data is not None else None
    hdrs = {"Content-Type": "application/json", **(headers or {})}
    req = urllib.request.Request(url, data=body, headers=hdrs, method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, json.loads(resp.read().decode())


def main():
    # 1. FastAPI health
    try:
        status, data = get_json(f"{FASTAPI}/health", timeout=10)
        if status == 200 and data.get("status") == "ok" and data.get("modelo_disponible"):
            ok("FastAPI /health", f"modelo {data.get('modelo_version')}")
        else:
            fail("FastAPI /health", str(data))
    except Exception as e:
        fail("FastAPI /health", str(e))

    # 2. FastAPI predict single
    try:
        _, data = get_json(f"{FASTAPI}/predict/riesgo", data={"equipo_id": 9001}, timeout=30)
        if data.get("nivel_riesgo") and "score_riesgo" in data:
            ok("FastAPI /predict/riesgo", f"{data['nivel_riesgo']} ({data['score_riesgo']})")
        else:
            fail("FastAPI /predict/riesgo", str(data))
    except Exception as e:
        fail("FastAPI /predict/riesgo", str(e))

    # 3. FastAPI batch
    try:
        _, data = get_json(f"{FASTAPI}/predict/riesgo/batch", data={}, timeout=120)
        if isinstance(data, list) and len(data) >= 200:
            top = max(data, key=lambda x: x.get("score_riesgo", 0))
            ok("FastAPI /predict/riesgo/batch", f"{len(data)} equipos, max score {top.get('score_riesgo')}")
        else:
            fail("FastAPI /predict/riesgo/batch", f"filas={len(data) if isinstance(data, list) else 'N/A'}")
    except Exception as e:
        fail("FastAPI /predict/riesgo/batch", str(e))

    # 4. FastAPI categoria
    try:
        _, data = get_json(f"{FASTAPI}/predict/categoria", data={"equipo_id": 9001}, timeout=30)
        if data.get("sugerencias"):
            ok("FastAPI /predict/categoria", f"{len(data['sugerencias'])} sugerencias")
        else:
            fail("FastAPI /predict/categoria", str(data))
    except Exception as e:
        fail("FastAPI /predict/categoria", str(e))

    # 5. PHP login + endpoints
    token = None
    try:
        _, login = get_json(PHP_API + "auth/login", data={"usuario": "admin", "password": "admin123"}, timeout=30)
        token = login.get("token")
        if token:
            ok("PHP auth/login", "token obtenido")
        else:
            fail("PHP auth/login", str(login))
    except Exception as e:
        fail("PHP auth/login", str(e))

    if token:
        auth = {"Authorization": f"Bearer {token}"}

        for path, name in [
            ("ml/status", "PHP /ml/status"),
            ("ml/equipos/9001/riesgo", "PHP /ml/equipos/{id}/riesgo"),
            ("ml/alertas", "PHP /ml/alertas"),
        ]:
            try:
                status, data = get_json(PHP_API + path, headers=auth, timeout=120)
                if data.get("success"):
                    count = len(data.get("data") or []) if isinstance(data.get("data"), list) else 1
                    ok(name, f"HTTP {status}, items={count}")
                else:
                    fail(name, data.get("message", str(data)))
            except Exception as e:
                fail(name, str(e))

        try:
            _, data = get_json(PHP_API + "ml/predict/categoria", headers=auth, data={"equipo_id": 9001}, timeout=30)
            if data.get("success") and data.get("data", {}).get("sugerencias"):
                ok("PHP /ml/predict/categoria", f"{len(data['data']['sugerencias'])} sugerencias")
            else:
                fail("PHP /ml/predict/categoria", str(data))
        except Exception as e:
            fail("PHP /ml/predict/categoria", str(e))

    # Report
    print("\n=== VERIFICACION SPRINT 6 ML ===\n")
    passed = sum(1 for _, p, _ in results if p)
    for name, passed_flag, detail in results:
        icon = "OK" if passed_flag else "FAIL"
        print(f"[{icon}] {name}" + (f" — {detail}" if detail else ""))

    print(f"\nTotal: {passed}/{len(results)} pruebas OK")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
