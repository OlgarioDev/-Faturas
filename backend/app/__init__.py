from flask import Flask
from flask_cors import CORS
from .config import config_by_name
from .extensions import db, ma, jwt

def create_app(config_name="dev"):
    app = Flask(__name__)
    
    # CORS configurado para aceitar os headers do Frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)

    # Import Blueprints
    from .routes.admin import admin_bp
    from .routes.invoices import invoices_bp
    from .routes.insights import insights_bp
    from .routes.auth import auth_bp
    from .routes.settings import settings_bp
    from .routes.clients import clients_bp   
    from .routes.products import products_bp 
    from .routes.saft import saft_bp
    
    # REGISTO DAS ROTAS COM PREFIXO /api (Harmonização com o Frontend)
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
    app.register_blueprint(insights_bp, url_prefix='/api/insights')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(settings_bp, url_prefix='/api/settings') # Atenção aqui!
    app.register_blueprint(clients_bp, url_prefix='/api/clients')    
    app.register_blueprint(products_bp, url_prefix='/api/products')  
    app.register_blueprint(saft_bp, url_prefix='/api/saft')

    @app.route('/')
    def index():
        return {
            "status": "online",
            "message": "A API do +Facturas está a funcionar corretamente!",
            "docs": "Aceda às rotas /api/* para utilizar os serviços."
        }, 200

    return app