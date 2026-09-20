from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_returns_ok():
    """Test that the health endpoint returns status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "analytics"
    assert "db" in data


def test_forecast_returns_501():
    """Test that the forecast stub returns 501."""
    response = client.post("/forecast")
    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "Not Implemented"
    assert "Monte Carlo" in data["message"]
