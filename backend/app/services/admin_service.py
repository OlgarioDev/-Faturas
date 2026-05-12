# backend/app/services/admin_service.py
from app.extensions import db
from app.models.core import User, SubscriptionStatus, Company
from app.models.invoice import Invoice
from sqlalchemy import func

class AdminService:
    @staticmethod
    def suspend_user(user_id):
        # Uso do session.get para compatibilidade total
        user = db.session.get(User, user_id)
        if not user:
            return {"error": "User not found"}, 404
            
        user.status = SubscriptionStatus.SUSPENDED_BY_ADMIN
        db.session.commit()
        return {"message": f"User {user.email} suspended successfully"}, 200

    @staticmethod
    def activate_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return {"error": "User not found"}, 404
            
        user.status = SubscriptionStatus.ACTIVE
        db.session.commit()
        return {"message": f"User {user.email} activated successfully"}, 200
        
    @staticmethod
    def get_system_stats():
        try:
            total_users = User.query.count()
            suspended_users = User.query.filter_by(status=SubscriptionStatus.SUSPENDED_BY_ADMIN).count()
            total_companies = Company.query.count()
            total_invoices = Invoice.query.count()
            
            # Cálculo de faturamento usando total_gross (conforme o teu modelo)
            total_billing = db.session.query(func.sum(Invoice.total_gross)).scalar() or 0.0
            
            return {
                "total_users": total_users,
                "suspended_users": suspended_users,
                "total_companies": total_companies,
                "total_invoices": total_invoices,
                "total_billing": float(total_billing)
            }
        except Exception as e:
            # Se houver erro, fazemos print para o log do Docker e retornamos valores zerados
            # para evitar que o frontend receba o erro 500 (e o erro de CORS)
            print(f"ERRO NO ADMIN SERVICE: {str(e)}")
            return {
                "total_users": 0,
                "suspended_users": 0,
                "total_companies": 0,
                "total_invoices": 0,
                "total_billing": 0.0
            }