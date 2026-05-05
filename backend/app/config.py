# backend/app/config.py
import os
from dotenv import load_dotenv

# Carrega as variáveis do ficheiro .env
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-dev")
    
    # --- SQLALCHEMY CONFIGURATION ---
    # Primeiro, tentamos ler "DATABASE_URL" do .env
    _db_url = os.getenv("DATABASE_URL")
    
    # Se não houver DATABASE_URL no .env, usamos o valor padrão local
    if not _db_url:
        _db_url = "postgresql+psycopg://postgres:postgres@localhost:5432/postgres"
    
    # CORREÇÃO CRUCIAL PARA DRIVERS MODERNOS:
    # Se a URL começar com postgres:// ou postgresql://, 
    # alteramos para postgresql+psycopg:// para usar o driver que instalámos.
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif _db_url.startswith("postgresql://") and "+psycopg" not in _db_url:
        _db_url = _db_url.replace("postgresql://", "postgresql+psycopg://", 1)

    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # --- JWT CONFIGURATION ---
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-super-secret-key")
    
    # --- AI CONFIGURATION ---
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # --- MICROSERVICE INTEGRATION ---
    CHURN_API_URL = os.getenv("CHURN_API_URL", "http://churn-api:8000")
    
    # --- RSA KEYS ---
    RSA_PRIVATE_KEY_PATH = os.getenv("RSA_PRIVATE_KEY_PATH", "private_key.pem")

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

class ProductionConfig(Config):
    DEBUG = False

# CORREÇÃO: Dicionário mapeando os nomes curtos e longos (Docker usa nomes longos por padrão)
config_by_name = {
    "dev": DevelopmentConfig,
    "development": DevelopmentConfig, # Chave adicionada para resolver o KeyError
    "test": TestingConfig,
    "testing": TestingConfig,
    "prod": ProductionConfig,
    "production": ProductionConfig    # Chave adicionada por segurança
}