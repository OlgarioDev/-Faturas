import time
import logging
from fastapi import FastAPI, Request
from schemas import HealthResponse, ChurnPredictionRequest, ChurnPredictionResponse
from services import predict_churn

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("starkdata_churn_api")

app = FastAPI(
    title="chrum Prediction API",
    description="Microservice for predicting customer churn probability.",
    version="1.0.0"
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware to measure and log the latency of each request in milliseconds.
    """
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000
    
    # Add custom header for observability
    response.headers["X-Process-Time-ms"] = f"{process_time:.2f}"
    
    logger.info(
        f"Method={request.method} Path={request.url.path} "
        f"StatusCode={response.status_code} Latency={process_time:.2f}ms"
    )
    return response

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Endpoint to verify service integrity."""
    return HealthResponse(status="healthy", version="1.0.0")

@app.post("/predict/churn", response_model=ChurnPredictionResponse, tags=["Prediction"])
async def churn_prediction(request: ChurnPredictionRequest):
    """
    Predicts the probability of customer churn based on their profile.
    """
    logger.info(f"Received churn prediction request for customer_id: {request.customer_id}")
    
    # Delegate to the business logic layer
    prediction = await predict_churn(request)
    
    logger.info(
        f"Prediction completed for customer_id: {request.customer_id}. "
        f"Risk Score: {prediction.risk_score}"
    )
    return prediction
