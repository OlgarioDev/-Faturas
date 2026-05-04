from marshmallow import fields
from app.extensions import ma
from app.models.core import Company, User

class CompanySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Company
        load_instance = True
        include_fk = True

class UserSchema(ma.SQLAlchemyAutoSchema):
    company_name = fields.Method("get_company_name")
    company_nif = fields.Method("get_company_nif")
    company_address = fields.Method("get_company_address")
    company_phone = fields.Method("get_company_phone")

    class Meta:
        model = User
        load_instance = True
        include_fk = True

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None

    def get_company_nif(self, obj):
        return obj.company.nif if obj.company else None

    def get_company_address(self, obj):
        return obj.company.address if obj.company else None

    def get_company_phone(self, obj):
        return obj.company.phone if obj.company else None
        
company_schema = CompanySchema()
companies_schema = CompanySchema(many=True)
user_schema = UserSchema()
users_schema = UserSchema(many=True)
