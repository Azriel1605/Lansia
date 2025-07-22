import os
from datetime import timedelta
from dotenv import load_dotenv

class Config:
    # Database
    
    # SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/lansia_db')
    SQLALCHEMY_DATABASE_URI = 'postgresql://keyopptta:Ra_sy6a7e2@localhost/lansia_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    print(SQLALCHEMY_DATABASE_URI)
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # CORS
    CORS_ORIGINS = ["http://localhost:3000"]
    CORS_SUPPORTS_CREDENTIALS = True

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
