# backend/app/utils/sequence.py
from app.models.invoice import Invoice
from sqlalchemy import func
from datetime import datetime

def generate_document_number(company_id, doc_type):
    """
    Gera o próximo número de documento: TIPO ANO/SEQUENCIA (ex: FT 2026/1)
    """
    current_year = datetime.utcnow().year
    
    # 1. Procurar o último documento deste tipo, desta empresa, no ano atual
    # Filtramos por tipo e empresa, e extraímos o número mais alto
    last_invoice = Invoice.query.filter(
        Invoice.company_id == company_id,
        Invoice.document_type == doc_type,
        Invoice.document_number.like(f"{doc_type} {current_year}/%")
    ).order_by(Invoice.created_at.desc()).first()

    if not last_invoice or not last_invoice.document_number:
        next_val = 1
    else:
        try:
            # Extrair o número depois da barra (ex: "FT 2026/15" -> 15)
            last_num_str = last_invoice.document_number.split('/')[-1]
            next_val = int(last_num_str) + 1
        except (ValueError, IndexError):
            next_val = 1

    return f"{doc_type} {current_year}/{next_val}"