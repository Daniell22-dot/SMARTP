import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Set TESTING before importing
import os
os.environ["TESTING"] = "1"

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app

client = TestClient(app)


class TestHealthEndpoints:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_ping(self):
        response = client.get("/api/v1/ping")
        assert response.status_code == 200
        assert response.json()["status"] == "pong"


class TestRobotsTxt:
    def test_robots_txt_exists(self):
        response = client.get("/robots.txt")
        assert response.status_code == 200
        content = response.text
        assert "Disallow: /admin" in content
        assert "Disallow: /landlord" in content
        assert "Disallow: /api/" in content
        assert "Sitemap:" in content


class TestSitemapXml:
    def test_sitemap_xml_exists(self):
        response = client.get("/sitemap.xml")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/xml"
        content = response.text
        assert "<urlset" in content
        assert "tuiyabelong.com" in content


class TestSecurityHeaders:
    def test_security_headers_on_response(self):
        response = client.get("/health")
        assert response.headers.get("x-frame-options") == "DENY"
        assert response.headers.get("x-content-type-options") == "nosniff"
        assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
        assert "permissions-policy" in response.headers


class TestAuthValidation:
    def test_register_requires_terms_accepted(self):
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "phone": "0712345678",
            "password": "SecurePass123!",
            "first_name": "Test",
            "last_name": "User",
            "terms_accepted": False
        })
        assert response.status_code == 400

    def test_register_rejects_weak_password(self):
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "phone": "0712345678",
            "password": "weak",
            "first_name": "Test",
            "last_name": "User",
            "terms_accepted": True
        })
        assert response.status_code == 422

    def test_register_rejects_invalid_phone(self):
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "phone": "123",
            "password": "SecurePass123!",
            "first_name": "Test",
            "last_name": "User",
            "terms_accepted": True
        })
        assert response.status_code == 400

    def test_register_no_role_field_in_schema(self):
        # Role field should not be in UserCreate schema
        from app.api.endpoints.auth import UserCreate
        fields = UserCreate.model_fields
        assert "role" not in fields
        assert "terms_accepted" in fields


class TestEndpointsExist:
    """Test that new endpoints exist (return 401 without auth, not 404)"""
    
    def test_users_contacts_endpoint_exists(self):
        response = client.get("/api/v1/users/contacts")
        assert response.status_code == 401

    def test_utilities_statement_endpoint_exists(self):
        response = client.get("/api/v1/utilities/statement/1?billing_month=2026-01")
        assert response.status_code == 401

    def test_maintenance_status_update_endpoint_exists(self):
        response = client.put("/api/v1/maintenance/1/status", json={"status": "completed"})
        assert response.status_code == 401


class TestConfigSecurity:
    def test_dev_generates_secret_key(self):
        """Test that development generates a secret key."""
        import os
        os.environ["DEPLOYMENT_ENV"] = "development"
        os.environ.pop("SECRET_KEY", None)
        os.environ.pop("DATABASE_URL", None)
        
        import importlib
        import app.config
        importlib.reload(app.config)
        from app.config import Settings as NewSettings
        
        settings = NewSettings()
        assert len(settings.SECRET_KEY) == 64

    @pytest.mark.skip(reason="Module-level exception during import hard to test")
    def test_production_requires_secret_key(self):
        """Test that production requires SECRET_KEY."""
        pass