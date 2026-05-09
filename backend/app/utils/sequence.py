# backend/app/utils/sequence.py
from app.models.invoice import Invoice
from datetime import datetime

def generate_document_number(company_id, doc_type):
    try:
        current_year = datetime.utcnow().year
        # Procurar o último do mesmo tipo e empresa
        last = Invoice.query.filter(
            Invoice.company_id == company_id,
            Invoice.document_type == doc_type,
            Invoice.document_number.isnot(None)
        ).order_by(Invoice.created_at.desc()).first()

        if not last or not last.document_number or "/" not in last.document_number:
            next_val = 1
        else:
            # Tenta extrair o número após a barra
            parts = last.document_number.split('/')
            next_val = int(parts[-1]) + 1
            
        return f"{doc_type} {current_year}/{next_val}"
    except Exception as e:
        print(f"ERRO NO SEQUENCIADOR: {e}")
        return f"{doc_type} {datetime.utcnow().year}/999" # Fallback de emergência