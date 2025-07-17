import os

# Get the base directory of the project
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://user:password@host/db_name')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_super_secret_key_change_in_production')
    JWT_EXPIRATION_DAYS = int(os.getenv('JWT_EXPIRATION_DAYS', '7'))
    
    # Frontend configuration using absolute paths
    TEMPLATE_FOLDER = os.path.join(BASE_DIR, 'templates')
    STATIC_FOLDER = os.path.join(BASE_DIR, 'static')
    
    # Swagger UI configuration
    SWAGGER_URL = '/api/docs'
    API_URL = '/static/swagger.json'
    
    # Environment configuration
    ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ['true', '1', 'yes']
    
    # File upload configuration
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file size
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    
    # Model configuration
    MODEL_PATH = os.path.join(BASE_DIR, 'model.tflite')
    LABELS_PATH = os.path.join(BASE_DIR, 'labels.txt')
