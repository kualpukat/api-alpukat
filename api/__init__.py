from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_swagger_ui import get_swaggerui_blueprint

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, 
                template_folder=os.path.join(os.getcwd(), 'templates'), 
                static_folder=os.path.join(os.getcwd(), 'static'))
    app.config.from_object('config.Config')

    db.init_app(app)

    # Register blueprints for API routes
    from .routes import api_bp
    app.register_blueprint(api_bp)

    # Swagger UI Blueprint
    SWAGGER_URL = app.config['SWAGGER_URL']
    API_URL = app.config['API_URL']
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Avocado Classification API Documentation"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    # Import and load model/labels only within app context
    from .utils import load_model_and_labels
    with app.app_context():
        db.create_all() # Create database tables
        load_model_and_labels()

    return app
