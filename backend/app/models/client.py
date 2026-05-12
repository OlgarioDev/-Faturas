# backend/app/models/client.py
from datetime import datetime
import uuid
from app.extensions import db

class Client(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Ligação à empresa — OBRIGATÓRIO para isolar dados por tenant
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    name = db.Column(db.String(255), nullable=False)
    nif = db.Column(db.String(50), unique=False, nullable=True) # Consumidor Final pode não ter NIF
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)