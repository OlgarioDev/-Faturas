import os
import requests
from functools import wraps
from flask import request, jsonify
from app.models.core import User

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token em falta"}), 401

        token = auth_header.split(' ')[1]

        # Valida o token com o Supabase
        res = requests.get(
            f"{os.getenv('SUPABASE_URL')}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', os.getenv('SUPABASE_ANON_KEY'))
            }
        )

        if res.status_code != 200:
            print("Supabase Error:", res.status_code, res.text)
            return jsonify({"error": f"Token inválido ou expirado: {res.text}"}), 401

        request.current_user = res.json()

        # Verifica se o utilizador está suspenso na base de dados
        supabase_id = request.current_user.get('id')
        if supabase_id:
            user = User.query.filter_by(supabase_auth_id=supabase_id).first()
            if user and hasattr(user, 'status'):
                status_str = getattr(user.status, 'value', str(user.status)).lower()
                if 'suspended' in status_str:
                    return jsonify({"error": "Conta Suspensa. Contacte o suporte."}), 403

        return f(*args, **kwargs)

    return decorated

def require_super_admin(f):
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        # request.current_user is set by require_auth
        supabase_id = request.current_user.get('id')
        if not supabase_id:
            return jsonify({"error": "Utilizador não encontrado no token"}), 401
            
        user = User.query.filter_by(supabase_auth_id=supabase_id).first()
        if not user or user.role != 'super_admin':
            return jsonify({"error": "Acesso não autorizado. Apenas super administradores."}), 403
            
        return f(*args, **kwargs)

    return decorated