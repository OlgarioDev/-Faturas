import httpx
from flask import current_app

class ChurnClient:
    @staticmethod
    def get_churn_risk(company_id: int):
        """
        Calls the FastAPI microservice on the Internal Docker Network 
        (e.g., http://churn-api:8000) to get the churn risk score.
        """
        url = f"{current_app.config['CHURN_API_URL']}/predict/churn"
        
        # In a real scenario, fetch company usage data to send
        payload = {
            "company_id": company_id,
            "monthly_invoices_count": 50, # Mock data
            "last_login_days_ago": 2,
            "support_tickets": 1
        }
        
        try:
            with httpx.Client() as client:
                response = client.post(url, json=payload, timeout=5.0)
                if response.status_code == 200:
                    return response.json()
                return {"error": f"API responded with {response.status_code}"}
        except Exception as e:
            # Fallback when microservice is down
            return {"error": str(e), "churn_risk": "Unknown"}
