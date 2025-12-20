import os
from datetime import timedelta

class Config:
    """Flask 应用配置"""

    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'taiwaka-coffee-secret-key-2024'
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # 数据库配置
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(BASE_DIR, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 文件上传配置
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-2024'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # CORS 配置
    CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']
