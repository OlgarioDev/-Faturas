# backend/app/routes/clients.py
from flask import Blueprint, request, jsonify
from app.models.client import Client
from app.models.core import User
from app.extensions import db
from app.middleware import require_auth
import traceback

clients_bp = Blueprint('clients', __name__)

def get_local_user():
    """Busca o utilizador local usando o ID injetado pelo middleware"""
    supabase_user = getattr(request, 'current_user', None)
    if not supabase_user:
        print("DEBUG: Nenhum utilizador encontrado no request (Middleware falhou?)")
        return None
    
    supabase_id = supabase_user.get('id')
    user = User.query.filter_by(supabase_auth_id=supabase_id).first()
    
    if not user:
        print(f"DEBUG: Utilizador Supabase {supabase_id} não encontrado na DB local.")
    return user

@clients_bp.route('/', methods=['GET'])
@require_auth
def get_clients():
    print("🚀 API: Chamada GET /api/clients/ recebida")
    user = get_local_user()
    
    if not user:
        return jsonify({"error": "Utilizador não sincronizado. Faça login novamente."}), 401

    try:
        clients = Client.query.filter_by(company_id=user.company_id).all()
        print(f"DEBUG: Encontrados {len(clients)} clientes para a empresa {user.company_id}")
        
        result = [{
            "id": c.id,
            "name": c.name,
            "nif": c.nif,
            "address": c.address,
            "city": c.city,
            "email": c.email,
            "phone": c.phone
        } for c in clients]
        
        return jsonify(result), 200
    except Exception as e:
        print(f"ERRO GET CLIENTS: {str(e)}")
        return jsonify({"error": "Erro ao carregar lista"}), 500

@clients_bp.route('/', methods=['POST'])
@require_auth
def create_client():
    user = get_local_user()
    if not user:
        return jsonify({"error": "Não autorizado"}), 401

    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"error": "O nome do cliente é obrigatório."}), 400
        
    new_client = Client(
        company_id=user.company_id,
        name=data.get('name'),
        nif=data.get('nif'),
        address=data.get('address'),
        city=data.get('city'),
        email=data.get('email'),
        phone=data.get('phone')
    )
    
    try:
        db.session.add(new_client)
        db.session.commit()
        print(f"DEBUG: Cliente {new_client.name} criado com sucesso.")
        return jsonify({"message": "Cliente criado", "id": new_client.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro: {str(e)}"}), 500

@clients_bp.route('/<client_id>', methods=['PUT'])
@require_auth
def update_client(client_id):
    user = get_local_user()
    client = Client.query.filter_by(id=client_id, company_id=user.company_id).first()
    
    if not client:
        return jsonify({"error": "Cliente não encontrado"}), 404
        
    data = request.get_json()
    client.name = data.get('name', client.name)
    client.nif = data.get('nif', client.nif)
    client.address = data.get('address', client.address)
    client.city = data.get('city', client.city)
    client.email = data.get('email', client.email)
    client.phone = data.get('phone', client.phone)
        
    db.session.commit()
    return jsonify({"message": "Atualizado"}), 200

@clients_bp.route('/<client_id>', methods=['DELETE'])
@require_auth
def delete_client(client_id):
    user = get_local_user()
    client = Client.query.filter_by(id=client_id, company_id=user.company_id).first()
    
    if not client:
        return jsonify({"error": "Não encontrado"}), 404
    
    try:
        db.session.delete(client)
        db.session.commit()
        return jsonify({"message": "Eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao eliminar: {str(e)}"}), 400