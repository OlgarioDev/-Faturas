# migrate_v3.py
from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    print("Iniciando a criação das tabelas de Clientes e Produtos...")
    
    try:
        # O create_all() verifica quais as tabelas definidas nos teus modelos 
        # que ainda não existem na base de dados e cria-as automaticamente.
        db.create_all()
        print("Sucesso! Tabelas criadas/sincronizadas com o Supabase.")
    except Exception as e:
        print(f"Erro ao criar as tabelas: {e}")