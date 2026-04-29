from datetime import datetime
from enum import Enum as PyEnum
from app.extensions import db

class SubscriptionStatus(str, PyEnum):
    ACTIVE = "active"
    SUSPENDED_BY_ADMIN = "suspended_by_admin"
    CANCELLED = "cancelled"

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    nif = db.Column(db.String(20), unique=True, nullable=False)
    tax_regime = db.Column(db.String(50))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    users = db.relationship('User', backref='company', lazy=True)
    invoices = db.relationship('Invoice', backref='company', lazy=True)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    supabase_auth_id = db.Column(db.String(255), unique=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), default="user") # 'admin', 'super_admin', 'user'
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    status = db.Column(db.Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
