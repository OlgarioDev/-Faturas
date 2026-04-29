from app.extensions import ma
from app.models.core import Company, User

class CompanySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Company
        load_instance = True
        include_fk = True

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        
company_schema = CompanySchema()
companies_schema = CompanySchema(many=True)
user_schema = UserSchema()
users_schema = UserSchema(many=True)
