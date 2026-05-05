# reset_db.py
from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    print("A eliminar tabelas de faturas antigas para atualização de colunas...")
    try:
        # Forçamos a eliminação das tabelas que estão incompletas
        # Usamos CASCADE para garantir que apaga mesmo com chaves estrangeiras
        db.session.execute(text("DROP TABLE IF EXISTS invoice_lines CASCADE;"))
        db.session.execute(text("DROP TABLE IF EXISTS invoices CASCADE;"))
        db.session.commit()
        
        print("Tabelas antigas removidas. A criar novas tabelas com client_id...")
        db.create_all()
        print("Sucesso! As tabelas de faturas foram recriadas corretamente.")
    except Exception as e:
        print(f"Erro ao resetar base de dados: {e}")
        db.session.rollback()