from datetime import datetime
from app.extensions import db

class Tax(db.Model):
    __tablename__ = 'taxes'
    
    id = db.Column(db.Integer, primary_key=True)
    tax_type = db.Column(db.String(20), nullable=False) # IVA, IS
    tax_percentage = db.Column(db.Float, nullable=False)
    exemption_reason = db.Column(db.String(255), nullable=True) # Artigo para isenção

# AVISO: As classes Invoice e InvoiceLine foram removidas daqui!
# Elas agora vivem no seu ficheiro dedicado: app/models/invoice.py
# Isto resolve o erro "Multiple classes found for path 'Invoice'".