from langchain.tools import tool
from app.models.invoice import Invoice
from sqlalchemy import func
from app.extensions import db

@tool
def get_total_revenue(company_id: int) -> str:
    """Retorna o valor total faturado pela empresa."""
    total = db.session.query(func.sum(Invoice.total_amount)).filter_by(company_id=company_id).scalar()
    if not total:
        return "Nenhuma faturação encontrada."
    return f"O total faturado é de {total:.2f} KZ."

@tool
def count_invoices(company_id: int) -> str:
    """Retorna o número total de faturas emitidas pela empresa."""
    count = Invoice.query.filter_by(company_id=company_id).count()
    return f"A empresa emitiu um total de {count} faturas."

def get_all_tools():
    return [get_total_revenue, count_invoices]
