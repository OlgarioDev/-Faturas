# backend/app/models/client.py
from datetime import datetime
import uuid
from app.extensions import db

class Client(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    nif = db.Column(db.String(50), unique=False, nullable=True) # Consumidor Final pode não ter NIF
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento opcional (se já tiveres o modelo Invoice importado aqui)
    # invoices = db.relationship('Invoice', backref='client', lazy=True)