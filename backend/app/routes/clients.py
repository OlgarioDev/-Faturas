from flask import Blueprint, request, jsonify
from app.models.client import Client
from app.models.core import User # Necessário para buscar a empresa do utilizador
from app.extensions import db
from app.middleware import require_auth

clients_bp = Blueprint('clients', __name__)

def get_local_user():
    """Auxiliar para buscar o utilizador da DB local usando o ID do Supabase"""
    supabase_user = getattr(request, 'current_user', None)
    if not supabase_user:
        return None
    return User.query.filter_by(supabase_auth_id=supabase_user.get('id')).first()

@clients_bp.route('/', methods=['GET'])
@require_auth
def get_clients(): # REMOVIDO o argumento current_user
    user = get_local_user()
    if not user:
        return jsonify({"error": "Utilizador não sincronizado"}), 401

    # Busca apenas os clientes da empresa do utilizador
    clients = Client.query.filter_by(company_id=user.company_id).all()
    
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

@clients_bp.route('/', methods=['POST'])
@require_auth
def create_client(): # REMOVIDO o argumento current_user
    user = get_local_user()
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
        return jsonify({"message": "Cliente criado com sucesso", "id": new_client.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao criar cliente: {str(e)}"}), 500

@clients_bp.route('/<client_id>', methods=['PUT'])
@require_auth
def update_client(client_id): # REMOVIDO o argumento current_user
    user = get_local_user()
    client = Client.query.filter_by(id=client_id, company_id=user.company_id).first()
    
    if not client:
        return jsonify({"error": "Cliente não encontrado ou sem permissão."}), 404
        
    data = request.get_json()
    
    client.name = data.get('name', client.name)
    client.nif = data.get('nif', client.nif)
    client.address = data.get('address', client.address)
    client.city = data.get('city', client.city)
    client.email = data.get('email', client.email)
    client.phone = data.get('phone', client.phone)
        
    db.session.commit()
    return jsonify({"message": "Cliente atualizado com sucesso"}), 200

@clients_bp.route('/<client_id>', methods=['DELETE'])
@require_auth
def delete_client(client_id): # REMOVIDO o argumento current_user
    user = get_local_user()
    client = Client.query.filter_by(id=client_id, company_id=user.company_id).first()
    
    if not client:
        return jsonify({"error": "Cliente não encontrado."}), 404
    
    try:
        db.session.delete(client)
        db.session.commit()
        return jsonify({"message": "Cliente eliminado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao eliminar: O cliente pode ter faturas associadas."}), 400