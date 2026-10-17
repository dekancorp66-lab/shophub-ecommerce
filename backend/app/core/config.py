from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "ShopHub E-Commerce"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-this-to-a-secure-random-secret-key-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database - defaults to SQLite for local/dev. For PostgreSQL set DATABASE_URL
    # Example Postgres: postgresql://user:password@localhost:5432/ecommerce
    DATABASE_URL: str = "sqlite:///./ecommerce.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Admin seed
    FIRST_ADMIN_EMAIL: str = "admin@shophub.com"
    FIRST_ADMIN_PASSWORD: str = "Admin123!"
    
    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
