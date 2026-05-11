from flask import Blueprint, request, jsonify
from app.ai.graph import CashFlowGraph
from app.integrations.churn_client import ChurnClient
from app.models.core import User # Necessário para o helper
from app.middleware import require_auth
from app.extensions import db

insights_bp = Blueprint('insights', __name__)

def get_local_user():
    """Auxiliar para buscar o utilizador da DB local usando o ID do Supabase"""
    supabase_user = getattr(request, 'current_user', None)
    if not supabase_user:
        return None
    return User.query.filter_by(supabase_auth_id=supabase_user.get('id')).first()

@insights_bp.route('/ask', methods=['POST'])
@require_auth
def ask_ai(): # REMOVIDO current_user
    user = get_local_user()
    if not user:
        return jsonify({"error": "Utilizador não autorizado"}), 401

    data = request.json
    query = data.get('query', "Resumo das faturas deste mês.")
    
    # Agora a IA pode ser filtrada pela empresa do utilizador
    graph = CashFlowGraph()
    # No futuro, podes passar o user.company_id para o analyze
    insight = graph.analyze(query, company_id=user.company_id)
    
    return jsonify({"insight": insight}), 200

@insights_bp.route('/churn-risk/<int:company_id>', methods=['GET'])
@require_auth
def get_churn_risk(company_id): # MANTEMOS o company_id (vem do URL), REMOVEMOS current_user
    user = get_local_user()
    
    # VALIDAÇÃO DE SEGURANÇA: 
    # Impede que o utilizador veja o churn de outra empresa mudando o ID no URL
    if not user or (user.company_id != company_id and user.role != 'super_admin'):
        return jsonify({"error": "Acesso não autorizado aos dados desta empresa"}), 403

    risk_data = ChurnClient.get_churn_risk(company_id)
    return jsonify(risk_data), 200