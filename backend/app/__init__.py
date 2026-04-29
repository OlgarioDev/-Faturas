from flask import Flask
from flask_cors import CORS
from .config import config_by_name
from .extensions import db, ma, jwt

def create_app(config_name="dev"):
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    from .routes.admin import admin_bp
    from .routes.invoices import invoices_bp
    from .routes.insights import insights_bp
    
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
    app.register_blueprint(insights_bp, url_prefix='/api/insights')

    @app.route('/')
    def index():
        return {
            "status": "online",
            "message": "A API do +Facturas está a funcionar corretamente!",
            "docs": "Aceda às rotas /api/* para utilizar os serviços."
        }, 200

    return app
