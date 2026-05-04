import hashlib
from datetime import datetime
from app.extensions import db
from app.models.billing import Invoice
from flask import current_app

class AGTComplianceService:
    @staticmethod
    def generate_hash(invoice_date, system_date, invoice_no, total_amount, previous_hash=""):
        # Format dates according to AGT standards (e.g., YYYY-MM-DD and YYYY-MM-DDTHH:MM:SS)
        formatted_date = invoice_date.strftime("%Y-%m-%d")
        formatted_system_date = system_date.strftime("%Y-%m-%dT%H:%M:%S")
        
        # String to hash: DataFatura;DataSistema;NºFatura;TotalFatura;HashFaturaAnterior
        data_to_hash = f"{formatted_date};{formatted_system_date};{invoice_no};{total_amount:.2f};{previous_hash}"
        
        # In a real scenario, this would use an RSA Private Key. 
        # For demonstration, we use SHA-256 to simulate the hashing mechanism.
        # rsa_key = current_app.config.get('RSA_PRIVATE_KEY_PATH')
        # ... logic to sign with RSA ...
        
        return hashlib.sha256(data_to_hash.encode('utf-8')).hexdigest()

    @staticmethod
    def get_next_invoice_number(company_id):
        # Strict sequencing - Requires a lock on the table or a transaction to avoid race conditions.
        # This is a basic implementation. In production, consider database locks (e.g., with_for_update()).
        last_invoice = Invoice.query.filter_by(company_id=company_id).order_by(Invoice.id.desc()).first()
        
        if last_invoice:
            # Assuming format 'FT 2024/X'
            parts = last_invoice.invoice_no.split('/')
            if len(parts) == 2:
                next_num = int(parts[1]) + 1
                return f"{parts[0]}/{next_num}"
        
        return f"FT {datetime.utcnow().year}/1"

    @staticmethod
    def secure_create_invoice(invoice_data, company_id):
        from app.models.billing import InvoiceLine
        # 1. Start Transaction
        # 2. Get Next Number
        invoice_no = AGTComplianceService.get_next_invoice_number(company_id)
        
        # 3. Get Previous Hash
        last_invoice = Invoice.query.filter_by(company_id=company_id).order_by(Invoice.id.desc()).first()
        previous_hash = last_invoice.hash_control if last_invoice else ""
        
        # 4. Generate Hash
        sys_date = datetime.utcnow()
        # Fallback to sys_date if invoice_date is not provided
        inv_date_str = invoice_data.get('invoice_date', '')
        if inv_date_str:
            inv_date = datetime.strptime(inv_date_str, '%Y-%m-%d').date()
        else:
            inv_date = sys_date.date()
            
        due_date_str = invoice_data.get('vencimento', '')
        due_date = None
        if due_date_str:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
            
        total = float(invoice_data.get('total_amount', 0.0))
        
        new_hash = AGTComplianceService.generate_hash(
            invoice_date=inv_date,
            system_date=sys_date,
            invoice_no=invoice_no,
            total_amount=total,
            previous_hash=previous_hash
        )
        
        # Create the Invoice Object
        new_invoice = Invoice(
            invoice_no=invoice_no,
            company_id=company_id,
            client_name=invoice_data.get('client_name', 'Desconhecido'),
            client_nif=invoice_data.get('client_nif', '999999999'),
            client_address=invoice_data.get('client_address', ''),
            status=invoice_data.get('status', 'Emitida'),
            invoice_type=invoice_data.get('type', 'FT'),
            due_date=due_date,
            observations=invoice_data.get('observations', ''),
            total_amount=total,
            tax_amount=float(invoice_data.get('tax_amount', 0.0)),
            hash_control=new_hash,
            previous_hash=previous_hash,
            system_entry_date=sys_date,
            invoice_date=inv_date
        )
        
        db.session.add(new_invoice)
        db.session.flush() # To get the new_invoice.id for the lines
        
        # Add Invoice Lines
        lines_data = invoice_data.get('lines', [])
        for line in lines_data:
            new_line = InvoiceLine(
                invoice_id=new_invoice.id,
                description=line.get('name', 'Artigo sem nome'),
                quantity=float(line.get('qty', 1)),
                unit_price=float(line.get('price', 0.0))
            )
            db.session.add(new_line)
            
        db.session.commit()
        return new_invoice
