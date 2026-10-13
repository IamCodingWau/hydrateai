import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ollama_connected" in data
    assert "default_model_recommended" in data

def test_reminder_ai_fallback():
    payload = {
        "user_name": "Alex",
        "current_intake_ml": 500,
        "daily_goal_ml": 2000,
        "time_of_day": "Morning",
        "personality": "encouraging",
        "model": "qwen2.5:3b"
    }
    response = client.post("/api/ai/reminder", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert len(data["message"]) > 0
    assert data["source"] in ["local_ai", "smart_fallback"]

def test_daily_summary_fallback():
    payload = {
        "user_name": "Jordan",
        "total_intake_ml": 2200,
        "daily_goal_ml": 2500,
        "logs_count": 6,
        "streak_days": 3,
        "model": "mistral:7b"
    }
    response = client.post("/api/ai/summary", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "2200" in data["message"] or len(data["message"]) > 10
