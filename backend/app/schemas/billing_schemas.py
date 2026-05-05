from app.extensions import ma
from marshmallow import fields

# Aqui está a correção: Faturas vêm do ficheiro novo, Impostos do antigo!
from app.models.invoice import Invoice, InvoiceLine
from app.models.billing import Tax

class TaxSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Tax
        load_instance = True

class InvoiceLineSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = InvoiceLine
        load_instance = True
        include_fk = True

class InvoiceSchema(ma.SQLAlchemyAutoSchema):
    lines = fields.Nested(InvoiceLineSchema, many=True)
    
    class Meta:
        model = Invoice
        load_instance = True
        include_fk = True

invoice_schema = InvoiceSchema()
invoices_schema = InvoiceSchema(many=True)