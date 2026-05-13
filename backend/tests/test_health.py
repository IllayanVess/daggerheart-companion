# backend/tests/test_health.py
"""
Tests for health check and root endpoints.
These don't require database access.
"""


class TestHealthEndpoint:
    """Tests for the /health endpoint"""

    def test_health_check_returns_healthy(self, client):
        """GET /health should return {status: 'healthy'}"""
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestRootEndpoint:
    """Tests for the root / endpoint"""

    def test_root_returns_welcome_message(self, client):
        """GET / should return a JSON message mentioning Daggerheart"""
        response = client.get("/")

        assert response.status_code == 200
        assert "message" in response.json()
        assert "Daggerheart" in response.json()["message"]

    def test_root_response_format(self, client):
        """Root endpoint should return JSON with a string message field"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert isinstance(data["message"], str)