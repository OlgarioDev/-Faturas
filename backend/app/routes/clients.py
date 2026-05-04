# backend/app/routes/clients.py
from flask import Blueprint, request, jsonify
from app.models.client import Client
from app.extensions import db
from app.middleware import require_auth  # Import do teu middleware

clients_bp = Blueprint('clients', __name__)

@clients_bp.route('/', methods=['GET'])
@require_auth
def get_clients(current_user): # current_user injetado pelo teu middleware
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
def create_client(current_user):
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