from flask import Blueprint, request, jsonify
from app.ai.graph import CashFlowGraph
from app.integrations.churn_client import ChurnClient

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/ask', methods=['POST'])
def ask_ai():
    data = request.json
    query = data.get('query', "Resumo das faturas deste mês.")
    
    graph = CashFlowGraph()
    insight = graph.analyze(query)
    
    return jsonify({"insight": insight}), 200

@insights_bp.route('/churn-risk/<int:company_id>', methods=['GET'])
def get_churn_risk(company_id):
    risk_data = ChurnClient.get_churn_risk(company_id)
    return jsonify(risk_data), 200
