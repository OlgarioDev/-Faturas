from flask import Blueprint, request, jsonify
from app.services.agt_compliance import AGTComplianceService
from app.schemas.billing_schemas import invoice_schema
from app.middleware import require_auth

invoices_bp = Blueprint('invoices', __name__)

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices():
    company_id = request.args.get('company_id')
    if not company_id:
        return jsonify({"error": "company_id required"}), 400
    try:
        from app.models.billing import Invoice
        invoices = Invoice.query.filter_by(company_id=company_id).all()
        return jsonify(invoice_schema.dump(invoices, many=True)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@invoices_bp.route('/', methods=['POST'])
@require_auth
def create_invoice():
    data = request.json
    company_id = data.get('company_id')

    if not company_id:
        return jsonify({"error": "company_id required"}), 400

    try:
        invoice = AGTComplianceService.secure_create_invoice(data, company_id)
        return jsonify(invoice_schema.dump(invoice)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500