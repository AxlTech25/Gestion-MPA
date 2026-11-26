FROM python:3.11-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir \
      pandas pymysql "scikit-learn>=1.3.0" joblib numpy \
      "fastapi>=0.110.0" "uvicorn[standard]>=0.27.0" "pydantic>=2.0.0" \
      "httpx>=0.28.0" "openpyxl>=3.1.0"

COPY app ./app
COPY scripts ./scripts
COPY data ./data
COPY models ./models

# Modelo embebido desde dataset sintético (*.joblib está en .gitignore)
RUN python scripts/train_model.py --dataset data/synthetic/equipos_riesgo_v200.csv --version v2 \
    && test -f models/riesgo_equipo_v2.joblib

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
