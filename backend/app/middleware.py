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
                "apikey": os.getenv('SUPABASE_ANON_KEY')
            }
        )

        if res.status_code != 200:
            return jsonify({"error": "Token inválido ou expirado"}), 401

        request.current_user = res.json()
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