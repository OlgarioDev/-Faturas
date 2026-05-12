# backend/app/routes/admin.py
from flask import Blueprint, jsonify
from app.services.admin_service import AdminService
from app.schemas.core_schemas import users_schema
from app.models.core import User
from app.middleware import require_super_admin
import traceback

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@require_super_admin
def list_users():
    try:
        users = User.query.all()
        return jsonify(users_schema.dump(users)), 200
    except Exception as e:
        print(f"ERRO ADMIN LIST USERS: {str(e)}")
        return jsonify({"error": "Erro ao listar utilizadores"}), 500

@admin_bp.route('/users/<int:user_id>/suspend', methods=['POST'])
@require_super_admin
def suspend_user(user_id):
    response, status = AdminService.suspend_user(user_id)
    return jsonify(response), status

@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@require_super_admin
def activate_user(user_id):
    response, status = AdminService.activate_user(user_id)
    return jsonify(response), status

@admin_bp.route('/dashboard', methods=['GET'])
@require_super_admin
def get_dashboard():
    try:
        # Chamada ao serviço que já corrigimos para usar total_gross
        stats = AdminService.get_system_stats()
        return jsonify(stats), 200
    except Exception as e:
        # Log detalhado para o Docker caso algo ainda falhe
        print("--- ERRO NO DASHBOARD ADMIN ---")
        traceback.print_exc()
        return jsonify({"error": "Erro interno no servidor"}), 500