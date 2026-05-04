# migrate_v4.py
from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    print("A adicionar coluna product_type na tabela products...")
    try:
        db.session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'Serviço';"))
        db.session.commit()
        print("Sucesso! Coluna adicionada.")
    except Exception as e:
        print(f"Erro: {e}")