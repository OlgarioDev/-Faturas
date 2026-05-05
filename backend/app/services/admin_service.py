from app.extensions import db
from app.models.core import User, SubscriptionStatus, Company
from app.models.invoice import Invoice

class AdminService:
    @staticmethod
    def suspend_user(user_id):
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
            
        user.status = SubscriptionStatus.SUSPENDED_BY_ADMIN
        db.session.commit()
        return {"message": f"User {user.email} suspended successfully"}, 200

    @staticmethod
    def activate_user(user_id):
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
            
        user.status = SubscriptionStatus.ACTIVE
        db.session.commit()
        return {"message": f"User {user.email} activated successfully"}, 200
        
    @staticmethod
    def get_system_stats():
        total_users = User.query.count()
        suspended_users = User.query.filter_by(status=SubscriptionStatus.SUSPENDED_BY_ADMIN).count()
        total_companies = Company.query.count()
        total_invoices = Invoice.query.count()
        
        # Calcular faturamento total global
        from sqlalchemy import func
        total_billing = db.session.query(func.sum(Invoice.total_amount)).scalar() or 0.0
        
        return {
            "total_users": total_users,
            "suspended_users": suspended_users,
            "total_companies": total_companies,
            "total_invoices": total_invoices,
            "total_billing": float(total_billing)
        }
