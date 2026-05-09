# backend/app/routes/settings.py
from flask import Blueprint, request, jsonify
from app.models.core import Company, User
from app.extensions import db
from app.middleware import require_auth 
import logging

# REMOVIDO o url_prefix daqui para evitar duplicação com o __init__.py
settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/company/', methods=['GET'])
@require_auth
def get_company_settings(current_user): 
    company = current_user.company
    if not company:
        return jsonify({"error": "Empresa não encontrada"}), 404
    
    return jsonify({
        "nomeEmpresa": company.name,
        "nif": company.nif,
        "tax_regime": company.tax_regime,
        "endereco": company.address,
        "email": company.email,
        "phone": company.phone,
        "website": company.website,
        "logo_url": company.logo_url,
        "bancos": company.bank_info or []
    })

@settings_bp.route('/company/', methods=['PUT'])
@require_auth
def update_company_settings(current_user): 
    company = current_user.company
    if not company:
        return jsonify({"error": "Empresa não encontrada"}), 404
    
    data = request.json
    
    # Atualização dos campos
    company.name = data.get('nomeEmpresa', company.name)
    company.nif = data.get('nif', company.nif)
    company.tax_regime = data.get('regimeIva', company.tax_regime)
    company.address = data.get('endereco', company.address)
    company.email = data.get('email', company.email)
    company.phone = data.get('telefone', company.phone)
    company.website = data.get('website', company.website)
    company.logo_url = data.get('logo', company.logo_url)
    company.bank_info = data.get('bancos', company.bank_info)
    
    try:
        db.session.commit()
        return jsonify({"message": "Configurações atualizadas com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao guardar: {str(e)}"}), 500