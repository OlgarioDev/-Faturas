# migrate_v5.py
from app import create_app
from app.extensions import db

app = create_app()
with app.app_context():
    print("A criar tabelas de faturas e linhas de faturas...")
    try:
        db.create_all()
        print("Sucesso! Tabelas 'invoices' e 'invoice_lines' prontas.")
    except Exception as e:
        print(f"Erro: {e}")