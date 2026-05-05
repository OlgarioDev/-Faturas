# backend/Dockerfile
FROM python:3.12-slim

# Instalar dependências do sistema para o Psycopg2 (PostgreSQL)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requirements primeiro para aproveitar a cache do Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o resto do código
COPY . .

# Expor a porta que o Flask usa
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["python", "run.py"]