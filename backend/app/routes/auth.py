# backend/app/routes/auth.py
from flask import Blueprint, jsonify, request
from app.middleware import require_auth
from app.models.core import User, Company, SubscriptionStatus
from app.extensions import db
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/sync', methods=['POST'])
@require_auth
def sync_profile(): # <--- TEM DE ESTAR VAZIO!
    try:
        # O middleware coloca o utilizador aqui
        current_user = getattr(request, 'current_user', None)
        
        if not current_user:
            return jsonify({"error": "Sessão inválida"}), 401
            
        supabase_id = current_user.get('id')
        email = current_user.get('email')
        metadata = current_user.get('user_metadata', {})
        
        company_name = metadata.get('company_name', 'Minha Empresa')
        nif = metadata.get('nif', '999999999')

        user = User.query.filter_by(supabase_auth_id=supabase_id).first()
        
        if not user:
            company = Company.query.filter_by(nif=nif).first()
            if not company:
                company = Company(name=company_name, nif=nif, tax_regime='Geral')
                db.session.add(company)
                db.session.commit()
            
            user = User(
                supabase_auth_id=supabase_id, email=email,
                company_id=company.id, role="admin"
            )
            db.session.add(user)
            db.session.commit()
            
        return jsonify({
            "message": "Sincronizado com sucesso",
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "company_id": user.company_id,
                "status": user.status.value if hasattr(user.status, 'value') else str(user.status)
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500