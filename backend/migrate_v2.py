import os
from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    print("Iniciando migracao de colunas v2...")
    
    # 1. Adicionar colunas a tabela 'companies'
    try:
        db.session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(120);"))
        db.session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);"))
        db.session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS website VARCHAR(255);"))
        db.session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;"))
        db.session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_info JSONB;"))
        print("Tabela 'companies' atualizada.")
    except Exception as e:
        print(f"Erro ao atualizar 'companies': {e}")

    # 2. Adicionar coluna a tabela 'invoices'
    try:
        db.session.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_address TEXT;"))
        print("Tabela 'invoices' atualizada.")
    except Exception as e:
        print(f"Erro ao atualizar 'invoices': {e}")

    db.session.commit()
    print("Migracao concluida com sucesso!")
