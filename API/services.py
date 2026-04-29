import asyncio
from schemas import ChurnPredictionRequest, ChurnPredictionResponse

async def predict_churn(data: ChurnPredictionRequest) -> ChurnPredictionResponse:
    """
    Simulates a Machine Learning model prediction for customer churn.
    In a real-world scenario, this would load a model (e.g., pickle/joblib)
    or call an external ML inference service like MLflow or Sagemaker.
    """
    # Simulate processing delay
    await asyncio.sleep(0.1)
    
    # Dummy heuristic model
    # High risk if invoices are low, haven't logged in recently, and support tickets are high
    risk_score = 0.1
    
    if data.monthly_invoices_count < 5:
        risk_score += 0.3
    elif data.monthly_invoices_count > 50:
        risk_score -= 0.1
        
    if data.last_login_days_ago > 14:
        risk_score += 0.2
        
    if data.support_tickets > 2:
        risk_score += 0.3
        
    # Ensure score is bound between 0.0 and 1.0
    risk_score = max(0.0, min(1.0, risk_score))
    
    # Generate recommendation based on score
    if risk_score > 0.7:
        recommendation = "High Priority Retention: Offer training session and check setup."
    elif risk_score > 0.4:
        recommendation = "Medium Risk: Send proactive check-in email and feedback survey."
    else:
        recommendation = "Low Risk: Standard engagement."
        
    return ChurnPredictionResponse(
        company_id=data.company_id,
        risk_score=round(risk_score, 4),
        recommendation=recommendation
    )
