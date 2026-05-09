import psycopg2
import os

def migrate():
    database_url = os.getenv("DATABASE_URL")
    
    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("🏗️ A iniciar migração v7: Adicionando referência de documentos...")
        
        # Adiciona a coluna para documentos relacionados
        cursor.execute("""
            ALTER TABLE invoices 
            ADD COLUMN IF NOT EXISTS related_document_id VARCHAR(36) REFERENCES invoices(id);
        """)
        
        print("✅ Coluna 'related_document_id' adicionada com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    migrate()