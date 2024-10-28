import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "clave_secreta_por_defecto"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "tu_secreto_para_jwt"
    
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "postgresql://postgres:524835@localhost/depression"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
