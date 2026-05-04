# backend/app/models/product.py
from datetime import datetime
import uuid
from app.extensions import db

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    
    # Dados Fiscais Críticos para a AGT
    tax_type = db.Column(db.String(10), nullable=False, default='IVA') 
    tax_percentage = db.Column(db.Float, nullable=False, default=14.0) 
    tax_exemption_reason = db.Column(db.String(255), nullable=True) 
    tax_exemption_code = db.Column(db.String(10), nullable=True) 
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)