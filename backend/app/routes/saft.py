from flask import Blueprint, Response, make_response
from app.models.invoice import Invoice
from app.models.client import Client
from app.middleware import require_auth
import xml.etree.ElementTree as ET
from datetime import datetime

saft_bp = Blueprint('saft', __name__)

@saft_bp.route('/export/', methods=['GET'])
@require_auth
def export_saft(current_user):
    # 1. Buscar dados reais do utilizador/empresa
    invoices = Invoice.query.filter_by(company_id=current_user.company_id).all()
    
    # 2. Criar a estrutura XML (Simplificada para a norma AGT)
    root = ET.Element("AuditFile", xmlns="urn:OECD:StandardAuditFile-Tax:AO:1.01_01")
    
    header = ET.SubElement(root, "Header")
    ET.SubElement(header, "CompanyID").text = str(current_user.company_id)
    ET.SubElement(header, "TaxRegistrationNumber").text = "500000000" # Exemplo
    ET.SubElement(header, "StartDate").text = "2026-01-01"
    ET.SubElement(header, "EndDate").text = datetime.now().strftime("%Y-%m-%d")

    source_docs = ET.SubElement(root, "SourceDocuments")
    sales_invoices = ET.SubElement(source_docs, "SalesInvoices")
    
    total_debit = 0
    total_credit = 0

    for inv in invoices:
        invoice_tag = ET.SubElement(sales_invoices, "Invoice")
        ET.SubElement(invoice_tag, "InvoiceNo").text = inv.document_number or inv.id
        ET.SubElement(invoice_tag, "InvoiceDate").text = inv.issue_date.strftime("%Y-%m-%d")
        ET.SubElement(invoice_tag, "InvoiceType").text = inv.document_type
        ET.SubElement(invoice_tag, "NetTotal").text = str(inv.total_net)
        
        total_credit += inv.total_gross

    # 3. Gerar a resposta como ficheiro XML
    xml_data = ET.tostring(root, encoding='Windows-1252', method='xml')
    
    response = make_response(xml_data)
    response.headers.set('Content-Type', 'text/xml')
    response.headers.set('Content-Disposition', 'attachment', filename=f'SAFT_AO_{datetime.now().year}.xml')
    
    return response