# backend/app/routes/clients.py
from flask import Blueprint, request, jsonify
from app.models.client import Client
from app.extensions import db
from app.middleware import require_auth  # Import do teu middleware

clients_bp = Blueprint('clients', __name__)

@clients_bp.route('/', methods=['GET'])
@require_auth
def get_clients(): # current_user injetado pelo teu middleware
    clients = Client.query.all()
    # Serialização manual simples (podes adaptar para os teus schemas Marshmallow se preferires)
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
def create_client():
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({"error": "O nome do cliente é obrigatório."}), 400
        
    new_client = Client(
        name=data.get('name'),
        nif=data.get('nif'),
        address=data.get('address'),
        city=data.get('city'),
        email=data.get('email'),
        phone=data.get('phone')
    )
    
    db.session.add(new_client)
    db.session.commit()

    
    
    return jsonify({"message": "Cliente criado com sucesso", "id": new_client.id}), 201

# ... (código anterior do GET e POST) ...

@clients_bp.route('/<client_id>', methods=['PUT'])
@require_auth
def update_client(client_id):
    client = Client.query.get(client_id)
    
    if not client:
        return jsonify({"error": "Cliente não encontrado."}), 404
        
    data = request.get_json()
    
    # Atualiza apenas os campos que foram enviados no payload
    if 'name' in data:
        client.name = data['name']
    if 'nif' in data:
        client.nif = data['nif']
    if 'address' in data:
        client.address = data['address']
    if 'city' in data:
        client.city = data['city']
    if 'email' in data:
        client.email = data['email']
    if 'phone' in data:
        client.phone = data['phone']
        
    db.session.commit()
    
    return jsonify({"message": "Cliente atualizado com sucesso"}), 200

@clients_bp.route('/<client_id>', methods=['DELETE'])
@require_auth
def delete_client(client_id):
    client = Client.query.get(client_id)
    
    if not client:
        return jsonify({"error": "Cliente não encontrado."}), 404
        
    # NOTA AGT: Numa fase posterior, se este cliente já tiver faturas emitidas, 
    # não o poderemos apagar da base de dados (hard delete). Teremos de fazer 
    # um "soft delete" (ex: client.is_active = False) para manter o histórico fiscal.
    # Por agora, para desenvolvimento, vamos permitir apagar.
    
    db.session.delete(client)
    db.session.commit()
    
    return jsonify({"message": "Cliente eliminado com sucesso"}), 200