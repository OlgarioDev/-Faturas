from flask import Blueprint, jsonify
from app.services.admin_service import AdminService
from app.schemas.core_schemas import users_schema
from app.models.core import User
from app.middleware import require_super_admin

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@require_super_admin
def list_users():
    users = User.query.all()
    return jsonify(users_schema.dump(users)), 200

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
    stats = AdminService.get_system_stats()
    return jsonify(stats), 200
