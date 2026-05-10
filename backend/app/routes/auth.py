# backend/app/routes/auth.py
from flask import Blueprint, jsonify, request
from app.middleware import require_auth
from app.models.core import User, Company, SubscriptionStatus
from app.extensions import db
import traceback

# REMOVIDO o url_prefix daqui! O prefixo /api/auth é definido no __init__.py
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/sync', methods=['POST'])
@require_auth
def sync_profile(current_user): # Recebe o utilizador injetado pelo middleware
    """
    Sincroniza o utilizador do Supabase com a base de dados local.
    Cria a Empresa e o Utilizador se for o primeiro login.
    """
    try:
        # O current_user aqui é o dicionário/objeto vindo do Supabase via Middleware
        supabase_id = current_user.get('id')
        email = current_user.get('email')
        metadata = current_user.get('user_metadata', {})
        
        # Extração de metadados (preenchidos no momento do registo no Frontend)
        company_name = metadata.get('company_name', 'Empresa Individual')
        nif = metadata.get('nif', '999999999')
        
        if not supabase_id:
            return jsonify({"error": "ID do Supabase ausente"}), 400

        # 1. Verificar se o utilizador já existe na nossa DB
        user = User.query.filter_by(supabase_auth_id=supabase_id).first()
        
        if not user:
            # 2. Se não existe, verificar se a Empresa já existe pelo NIF
            company = Company.query.filter_by(nif=nif).first()
            
            if not company:
                # Criar nova empresa se o NIF for novo
                company = Company(
                    name=company_name, 
                    nif=nif,
                    tax_regime='Geral' # Padrão para Angola
                )
                db.session.add(company)
                db.session.commit() # Commit para gerar o ID da empresa
            
            # 3. Criar o utilizador local vinculado à empresa
            user = User(
                supabase_auth_id=supabase_id,
                email=email,
                company_id=company.id,
                role="admin" # O primeiro utilizador da empresa é admin
            )
            db.session.add(user)
            db.session.commit()
            
        # 4. Verificação de Segurança (Conta Suspensa)
        if hasattr(user, 'status') and user.status == SubscriptionStatus.SUSPENDED_BY_ADMIN:
            return jsonify({
                "error": "Conta suspensa. Contacte o suporte.", 
                "status": "suspended"
            }), 403
            
        # 5. Retornar os dados sincronizados
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
        print("--- ERRO NA SINCRONIZAÇÃO DE PERFIL ---")
        traceback.print_exc()
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500