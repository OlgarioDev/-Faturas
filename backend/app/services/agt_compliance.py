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
        # 1. Start Transaction
        # 2. Get Next Number
        invoice_no = AGTComplianceService.get_next_invoice_number(company_id)
        
        # 3. Get Previous Hash
        last_invoice = Invoice.query.filter_by(company_id=company_id).order_by(Invoice.id.desc()).first()
        previous_hash = last_invoice.hash_control if last_invoice else ""
        
        # 4. Generate Hash
        sys_date = datetime.utcnow()
        inv_date = invoice_data.get('invoice_date', sys_date.date())
        total = invoice_data.get('total_amount', 0.0)
        
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
            total_amount=total,
            hash_control=new_hash,
            previous_hash=previous_hash,
            system_entry_date=sys_date,
            invoice_date=inv_date
        )
        
        db.session.add(new_invoice)
        db.session.commit()
        return new_invoice
