import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://user:password@host/db_name')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_super_secret_key')
    JWT_EXPIRATION_DAYS = 7
    
    # Frontend configuration
    TEMPLATE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'templates')
    STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static')
    
    # Swagger UI configuration
    SWAGGER_URL = '/api/docs'
    API_URL = '/static/swagger.json' # Path to your swagger.json file
