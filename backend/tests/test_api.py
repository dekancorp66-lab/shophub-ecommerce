"""Basic API tests. Run with: pytest tests/ -v"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_list_products():
    r = client.get("/api/v1/products")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert data["total"] >= 0

def test_register_and_login():
    import random
    email = f"test{random.randint(10000,99999)}@example.com"
    r = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "TestPass123!",
        "full_name": "Test User",
    })
    assert r.status_code == 201
    r = client.post("/api/v1/auth/login/json", json={"email": email, "password": "TestPass123!"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_admin_requires_auth():
    r = client.get("/api/v1/admin/products")
    assert r.status_code == 401
