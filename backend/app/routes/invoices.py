from flask import Blueprint, request, jsonify
from app.services.agt_compliance import AGTComplianceService
from app.schemas.billing_schemas import invoice_schema
from app.middleware import require_auth
from app.models.core import User

invoices_bp = Blueprint('invoices', __name__)

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices():
    supabase_id = request.current_user.get('id')
    user = User.query.filter_by(supabase_auth_id=supabase_id).first()
    if not user:
        return jsonify({"error": "User not linked to a company"}), 403
        
    company_id = user.company_id
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
    
    supabase_id = request.current_user.get('id')
    user = User.query.filter_by(supabase_auth_id=supabase_id).first()
    if not user:
        return jsonify({"error": "User not linked to a company"}), 403
        
    company_id = user.company_id

    try:
        invoice = AGTComplianceService.secure_create_invoice(data, company_id)
        return jsonify(invoice_schema.dump(invoice)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500