import xml.etree.ElementTree as ET
from app.models.billing import Invoice
from app.models.core import Company

class SAFTExporter:
    @staticmethod
    def generate_saft(company_id, start_date, end_date):
        # Basic skeleton for SAFT-AO (Angola)
        company = Company.query.get(company_id)
        if not company:
            return None
            
        invoices = Invoice.query.filter_by(company_id=company_id).filter(
            Invoice.invoice_date >= start_date,
            Invoice.invoice_date <= end_date
        ).all()

        root = ET.Element("AuditFile", xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01")
        
        header = ET.SubElement(root, "Header")
        ET.SubElement(header, "CompanyID").text = company.nif
        ET.SubElement(header, "TaxRegistrationNumber").text = company.nif
        ET.SubElement(header, "CompanyName").text = company.name
        
        source_documents = ET.SubElement(root, "SourceDocuments")
        sales_invoices = ET.SubElement(source_documents, "SalesInvoices")
        ET.SubElement(sales_invoices, "NumberOfEntries").text = str(len(invoices))
        ET.SubElement(sales_invoices, "TotalDebit").text = "0.00"
        
        total_credit = sum(float(inv.total_amount) for inv in invoices)
        ET.SubElement(sales_invoices, "TotalCredit").text = f"{total_credit:.2f}"
        
        for inv in invoices:
            inv_elem = ET.SubElement(sales_invoices, "Invoice")
            ET.SubElement(inv_elem, "InvoiceNo").text = inv.invoice_no
            ET.SubElement(inv_elem, "InvoiceDate").text = inv.invoice_date.strftime("%Y-%m-%d")
            ET.SubElement(inv_elem, "Hash").text = inv.hash_control
            # In a real SAFT, we would iterate over InvoiceLine here.
            
        return ET.tostring(root, encoding='utf-8', xml_declaration=True)
