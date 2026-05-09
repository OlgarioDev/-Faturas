# backend/app/routes/clients.py
from flask import Blueprint, request, jsonify
from app.models.client import Client
from app.extensions import db
from app.middleware import require_auth

# Mantemos sem url_prefix aqui, pois já definimos no __init__.py
clients_bp = Blueprint('clients', __name__)

@clients_bp.route('/', methods=['GET'])
@require_auth
def get_clients(current_user): # O middleware injeta o utilizador aqui
    # FILTRO CRÍTICO: Buscar apenas clientes da empresa do utilizador logado
    clients = Client.query.filter_by(company_id=current_user.company_id).all()
    
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
def create_client(current_user):
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({"error": "O nome do cliente é obrigatório."}), 400
        
    new_client = Client(
        company_id=current_user.company_id, # VINCULA O CLIENTE À EMPRESA CERTA
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
def update_client(current_user, client_id):
    # Garante que o cliente existe E pertence à empresa do utilizador
    client = Client.query.filter_by(id=client_id, company_id=current_user.company_id).first()
    
    if not client:
        return jsonify({"error": "Cliente não encontrado ou sem permissão."}), 404
        
    data = request.get_json()
    
    # Atualização segura
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
def delete_client(current_user, client_id):
    # Garante que só apaga se o cliente for da própria empresa
    client = Client.query.filter_by(id=client_id, company_id=current_user.company_id).first()
    
    if not client:
        return jsonify({"error": "Cliente não encontrado."}), 404
        
    # Verificação básica de integridade (Opcional por agora)
    # if len(client.invoices) > 0:
    #     return jsonify({"error": "Não pode apagar um cliente que já tem faturas."}), 400
    
    try:
        db.session.delete(client)
        db.session.commit()
        return jsonify({"message": "Cliente eliminado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao eliminar: Verifique se o cliente tem documentos associados."}), 400