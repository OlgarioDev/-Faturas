from datetime import datetime
from app.extensions import db

class Tax(db.Model):
    __tablename__ = 'taxes'
    
    id = db.Column(db.Integer, primary_key=True)
    tax_type = db.Column(db.String(20), nullable=False) # IVA, IS
    tax_percentage = db.Column(db.Float, nullable=False)
    exemption_reason = db.Column(db.String(255), nullable=True) # Artigo para isenção
    
class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_no = db.Column(db.String(50), unique=True, nullable=False) # Ex: FT 2024/1
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Valores
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=0.0)
    
    # AGT Compliance Fields
    hash_control = db.Column(db.String(255), nullable=False)
    previous_hash = db.Column(db.String(255), nullable=True)
    system_entry_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    invoice_date = db.Column(db.Date, nullable=False)
    
    lines = db.relationship('InvoiceLine', backref='invoice', lazy=True)

class InvoiceLine(db.Model):
    __tablename__ = 'invoice_lines'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    tax_id = db.Column(db.Integer, db.ForeignKey('taxes.id'), nullable=True)
