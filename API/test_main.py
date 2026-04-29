import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "1.0.0"}

def test_predict_churn_success():
    """Test a standard low-risk scenario."""
    payload = {
        "customer_id": "CUST-111",
        "tenure": 36,
        "monthly_charges": 45.0,
        "support_calls": 0
    }
    response = client.post("/predict/churn", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CUST-111"
    assert "risk_score" in data
    assert "recommendation" in data
    # Based on our mock logic, this should be Low Risk
    assert data["risk_score"] <= 0.4
    assert "Low Risk" in data["recommendation"]
    assert "x-process-time-ms" in response.headers

def test_predict_churn_high_risk():
    """Test a high-risk scenario to verify recommendation logic."""
    payload = {
        "customer_id": "CUST-999",
        "tenure": 2,  # Low tenure (+0.3)
        "monthly_charges": 95.0,  # High charges (+0.2)
        "support_calls": 4  # High support calls (+0.3)
    }
    response = client.post("/predict/churn", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CUST-999"
    # Base 0.1 + 0.3 + 0.2 + 0.3 = 0.9 risk score
    assert data["risk_score"] > 0.7
    assert "High Priority Retention" in data["recommendation"]

def test_predict_churn_invalid_data():
    """Test Pydantic v2 validation with invalid data."""
    payload = {
        "customer_id": "", # Invalid: min_length=1
        "tenure": -5, # Invalid: ge=0
        "monthly_charges": "not-a-float", # Invalid type
        # Missing support_calls
    }
    response = client.post("/predict/churn", json=payload)
    assert response.status_code == 422 # Unprocessable Entity
    
    errors = response.json()["detail"]
    assert len(errors) > 0
    
    # Check that multiple fields failed validation
    error_fields = [error["loc"][-1] for error in errors]
    assert "customer_id" in error_fields
    assert "tenure" in error_fields
    assert "monthly_charges" in error_fields
    assert "support_calls" in error_fields
