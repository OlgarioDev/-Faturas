from flask import Blueprint, request, jsonify
from app.ai.graph import CashFlowGraph
from app.integrations.churn_client import ChurnClient
from app.middleware import require_auth  # Importar o sistema de proteção

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/ask', methods=['POST'])
@require_auth  # ROTA PROTEGIDA
def ask_ai(current_user): # O middleware passa o utilizador logado
    data = request.json
    query = data.get('query', "Resumo das faturas deste mês.")
    
    # O ideal aqui no futuro é a IA analisar apenas os dados do current_user.id
    graph = CashFlowGraph()
    insight = graph.analyze(query)
    
    return jsonify({"insight": insight}), 200

@insights_bp.route('/churn-risk/<int:company_id>', methods=['GET'])
@require_auth  # ROTA PROTEGIDA
def get_churn_risk(current_user, company_id): # O middleware passa o utilizador logado
    
    # OPCIONAL MAS RECOMENDADO: Verificar se o utilizador logado pertence à empresa pedida
    # if current_user.company_id != company_id and current_user.role != 'admin':
    #     return jsonify({"error": "Acesso não autorizado aos dados desta empresa"}), 403

    risk_data = ChurnClient.get_churn_risk(company_id)
    return jsonify(risk_data), 200