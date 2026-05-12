# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from .config import config_by_name
from .extensions import db, ma, jwt

def create_app(config_name="dev"):
    app = Flask(__name__)
    
    # --- CONFIGURAÇÃO DE CORS (CORRIGIDA) ---
    # 1. Especificamos a origem do Frontend (localhost:3000)
    # 2. Permitimos o header de Authorization explicitamente
    # 3. Removemos o "*" para evitar bloqueios de segurança do browser
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }, supports_credentials=True)
    
    app.config.from_object(config_by_name[config_name])

    # Inicialização das extensões
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)

    # Importação dos Blueprints
    from .routes.admin import admin_bp
    from .routes.invoices import invoices_bp
    from .routes.insights import insights_bp
    from .routes.auth import auth_bp
    from .routes.settings import settings_bp
    from .routes.clients import clients_bp   
    from .routes.products import products_bp 
    from .routes.saft import saft_bp
    
    # --- REGISTO DE ROTAS ---
    # Com estes prefixos, o Frontend deve chamar: http://localhost:5000/api/...
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
    app.register_blueprint(clients_bp, url_prefix='/api/clients')    
    app.register_blueprint(products_bp, url_prefix='/api/products')  
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(insights_bp, url_prefix='/api/insights')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(saft_bp, url_prefix='/api/saft')

    @app.route('/')
    def index():
        return {
            "status": "online", 
            "message": "API +Facturas ligada!",
            "version": "1.0.0"
        }, 200

    return app