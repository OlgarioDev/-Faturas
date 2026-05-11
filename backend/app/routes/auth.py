# backend/app/routes/auth.py
from flask import Blueprint, jsonify, request
from app.middleware import require_auth
from app.models.core import User, Company, SubscriptionStatus
from app.extensions import db
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/sync', methods=['POST'])
@require_auth
def sync_profile(): # REMOVIDO current_user daqui
    try:
        # O middleware coloca o utilizador aqui:
        supabase_user = getattr(request, 'current_user', None)
        
        if not supabase_user:
            return jsonify({"error": "Token inválido ou utilizador não encontrado no request"}), 401
            
        supabase_id = supabase_user.get('id')
        email = supabase_user.get('email')
        metadata = supabase_user.get('user_metadata', {})
        
        company_name = metadata.get('company_name', 'Empresa Individual')
        nif = metadata.get('nif', '999999999')

        # 1. Verificar se o utilizador já existe
        user = User.query.filter_by(supabase_auth_id=supabase_id).first()
        
        if not user:
            # 2. Verificar Empresa
            company = Company.query.filter_by(nif=nif).first()
            if not company:
                company = Company(name=company_name, nif=nif, tax_regime='Geral')
                db.session.add(company)
                db.session.commit()
            
            # 3. Criar Utilizador
            user = User(
                supabase_auth_id=supabase_id,
                email=email,
                company_id=company.id,
                role="admin"
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
        print(f"ERRO SYNC: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Erro interno no servidor"}), 500