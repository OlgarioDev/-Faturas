# backend/app/routes/products.py
from flask import Blueprint, request, jsonify
from app.models.product import Product
from app.extensions import db
from app.middleware import require_auth

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
@require_auth
def get_products(current_user):
    products = Product.query.all()
    result = [{
        "id": p.id,
        "code": p.code,
        "name": p.name,
        "unit_price": p.unit_price,
        "tax_type": p.tax_type,
        "tax_percentage": p.tax_percentage,
        "tax_exemption_reason": p.tax_exemption_reason,
        "tax_exemption_code": p.tax_exemption_code
    } for p in products]
    return jsonify(result), 200

@products_bp.route('/', methods=['POST'])
@require_auth
def create_product(current_user):
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('code'):
        return jsonify({"error": "Nome e Código do produto são obrigatórios."}), 400
        
    new_product = Product(
        code=data.get('code'),
        name=data.get('name'),
        unit_price=data.get('unit_price', 0.0),
        tax_type=data.get('tax_type', 'IVA'),
        tax_percentage=data.get('tax_percentage', 14.0),
        tax_exemption_reason=data.get('tax_exemption_reason'),
        tax_exemption_code=data.get('tax_exemption_code')
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify({"message": "Produto criado com sucesso", "id": new_product.id}), 201