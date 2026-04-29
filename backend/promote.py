from app import create_app
from app.extensions import db
from app.models.core import User, Company

app = create_app('dev')

with app.app_context():
    email_to_promote = "olgario1@hotmail.com"
    user = User.query.filter_by(email=email_to_promote).first()
    
    if user:
        user.role = "super_admin"
        db.session.commit()
        print(f"Sucesso: {email_to_promote} promovido a super_admin!")
    else:
        print(f"Erro: {email_to_promote} ainda não existe na base de dados.")
        print("Crie a conta no frontend e faça login primeiro, depois corra este script novamente.")
