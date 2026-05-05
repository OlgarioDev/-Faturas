# backend/app/models/invoice.py
from datetime import datetime
import uuid
from app.extensions import db

class Invoice(db.Model):
    __tablename__ = 'invoices'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # RELAÇÃO COM A EMPRESA
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # RELAÇÃO COM O CLIENTE
    client_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False)
    # LINHA CORRIGIDA: Permite aceder a i.client.name na listagem
    client = db.relationship('Client', backref='invoices')
    
    # Dados do Documento
    document_type = db.Column(db.String(50), nullable=False, default='Factura')
    document_number = db.Column(db.String(50), unique=True, nullable=True) 
    status = db.Column(db.String(20), nullable=False, default='Rascunho') 
    
    # Datas e Valores
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=True)
    
    total_net = db.Column(db.Float, nullable=False, default=0.0) 
    total_tax = db.Column(db.Float, nullable=False, default=0.0) 
    total_gross = db.Column(db.Float, nullable=False, default=0.0) 
    
    # Relacionamentos
    lines = db.relationship('InvoiceLine', backref='invoice', lazy=True, cascade="all, delete-orphan")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class InvoiceLine(db.Model):
    __tablename__ = 'invoice_lines'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    invoice_id = db.Column(db.String(36), db.ForeignKey('invoices.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    
    description = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=1.0)
    unit_price = db.Column(db.Float, nullable=False)
    tax_percentage = db.Column(db.Float, nullable=False, default=14.0)
    
    line_total_net = db.Column(db.Float, nullable=False)
    line_total_tax = db.Column(db.Float, nullable=False)
    
    product = db.relationship('Product')