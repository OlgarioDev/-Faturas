import psycopg2 # ou sqlite3 se estiveres a usar sqlite localmente
import os

def migrate():
    # Pega a URL da base de dados do ambiente
    database_url = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/facturas_db")
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("🚀 A iniciar migração v6: Adicionando campo 'discount'...")
        
        # O comando SQL mágico
        cursor.execute("ALTER TABLE invoice_lines ADD COLUMN IF NOT EXISTS discount FLOAT DEFAULT 0.0;")
        
        conn.commit()
        print("✅ Coluna 'discount' adicionada com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    migrate()