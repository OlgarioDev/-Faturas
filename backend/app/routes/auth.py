from flask import Blueprint, jsonify, request
from app.middleware import require_auth
from app.models.core import User, Company, SubscriptionStatus
from app.extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/sync', methods=['POST'])
@require_auth
def sync_profile():
    # request.current_user is populated by require_auth using Supabase
    supabase_user = request.current_user
    
    if not supabase_user or 'id' not in supabase_user:
        return jsonify({"error": "Utilizador não encontrado"}), 401
        
    supabase_id = supabase_user.get('id')
    email = supabase_user.get('email')
    metadata = supabase_user.get('user_metadata', {})
    
    company_name = metadata.get('company_name', 'Empresa Não Definida')
    nif = metadata.get('nif', '000000000')
    
    # Check if user already exists
    user = User.query.filter_by(supabase_auth_id=supabase_id).first()
    
    if not user:
        # If user doesn't exist, we must create Company and User
        # First, check if company with same NIF exists
        company = Company.query.filter_by(nif=nif).first()
        if not company:
            company = Company(name=company_name, nif=nif)
            db.session.add(company)
            db.session.commit() # commit to get company.id
            
        user = User(
            supabase_auth_id=supabase_id,
            email=email,
            company_id=company.id,
            role="user" # Default role
        )
        db.session.add(user)
        db.session.commit()
        
    # Check if suspended
    if user.status == SubscriptionStatus.SUSPENDED_BY_ADMIN:
        return jsonify({"error": "Conta suspensa", "status": "suspended_by_admin"}), 403
        
    return jsonify({
        "message": "Sincronizado com sucesso",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "status": user.status.value if hasattr(user.status, 'value') else user.status,
            "company_id": user.company_id
        }
    }), 200
