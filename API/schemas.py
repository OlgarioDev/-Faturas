from pydantic import BaseModel, Field, ConfigDict

class HealthResponse(BaseModel):
    status: str
    version: str

class ChurnPredictionRequest(BaseModel):
    company_id: int = Field(..., description="Unique identifier for the company")
    monthly_invoices_count: int = Field(..., description="Number of invoices emitted this month", ge=0)
    last_login_days_ago: int = Field(..., description="Days since last login", ge=0)
    support_tickets: int = Field(..., description="Number of times the company contacted support", ge=0)
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "company_id": 1,
                "monthly_invoices_count": 50,
                "last_login_days_ago": 2,
                "support_tickets": 1
            }
        }
    )

class ChurnPredictionResponse(BaseModel):
    company_id: int
    risk_score: float = Field(..., description="Probability of churn between 0.0 and 1.0")
    recommendation: str = Field(..., description="Actionable recommendation based on the risk score")
