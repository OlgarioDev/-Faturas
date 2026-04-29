from app.extensions import ma
from app.models.billing import Invoice, InvoiceLine, Tax
from marshmallow import fields

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
