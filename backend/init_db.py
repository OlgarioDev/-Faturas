from app import create_app
from app.extensions import db
from app.models.core import User, Company
from app.models.invoice import Invoice

app = create_app('dev')

with app.app_context():
    db.create_all()
    print("Tabelas criadas com sucesso na base de dados Supabase!")
