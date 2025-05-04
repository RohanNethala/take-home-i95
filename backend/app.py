from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import os
import uvicorn

# Adjust import paths based on the project structure
# Assuming app.py is in the backend root
from services.product_service import get_all_products, load_products, get_product_by_id
from services.llm_service import get_recommendations

# --- Pydantic Models for Request/Response --- 

class RecommendationRequest(BaseModel):
    preferences: Dict[str, Any] = Field(..., example={"categories": ["Electronics", "Clothing"], "price_range": [50, 200], "styles": ["casual"]})
    history_ids: List[str] = Field(..., example=["product001", "product015"])

class RecommendationItem(BaseModel):
    product_id: str
    explanation: str

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]

class ErrorResponse(BaseModel):
    error: str

# --- FastAPI Application Setup --- 

app = FastAPI(
    title="Product Recommendation API",
    description="API for generating product recommendations using an LLM.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Allow frontend origin during development
    "http://127.0.0.1:3000",
    # Add deployed frontend URL here if applicable
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allows specific origins
    # allow_origins=["*"], # Allows all origins (less secure)
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- Event Handlers --- 

@app.on_event("startup")
def startup_event():
    print("Initializing product data...")
    load_products() # Load products when the application starts
    print("Product data initialization complete.")

# --- API Endpoints --- 

@app.get("/", tags=["General"], summary="Root endpoint to check API status")
def read_root():
    """Simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the Recommendation System API!"}

@app.get("/api/products", tags=["Products"], summary="Get the full product catalog")
def get_products_endpoint():
    """Retrieves the list of all available products."""
    products = get_all_products()
    if not products:
        # This should ideally not happen if startup loading works
        raise HTTPException(status_code=503, detail="Product catalog is currently unavailable.")
    return products

@app.post(
    "/api/recommendations", 
    response_model=RecommendationResponse, 
    responses={ # Define potential error responses
        400: {"model": ErrorResponse, "description": "Invalid request body"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
        502: {"model": ErrorResponse, "description": "LLM response error"},
        503: {"model": ErrorResponse, "description": "Service unavailable (e.g., API key issue)"}
    },
    tags=["Recommendations"],
    summary="Generate personalized product recommendations"
)
def recommend_products_endpoint(request_body: RecommendationRequest = Body(...)):
    """Receives user preferences and browsing history, then returns LLM-generated product recommendations."""
    
    preferences = request_body.preferences
    history_ids = request_body.history_ids

    # Call the LLM service
    result = get_recommendations(preferences, history_ids)

    if "error" in result:
        error_message = result["error"]
        status_code = 500 # Default internal server error
        if "API key" in error_message:
            status_code = 503 # Service Unavailable (config issue)
        elif "Rate limit" in error_message:
            status_code = 429 # Too Many Requests
        elif "format error" in error_message or "parsing error" in error_message:
             status_code = 502 # Bad Gateway (LLM response issue)
        elif "catalog is empty" in error_message:
             status_code = 503 # Service Unavailable (data loading issue)
             
        raise HTTPException(status_code=status_code, detail=error_message)
    
    # Validate that the recommended product IDs actually exist
    valid_recommendations = []
    for rec in result.get("recommendations", []):
        if get_product_by_id(rec.get("product_id")):
            valid_recommendations.append(rec)
        else:
            # Log this, but maybe don't fail the whole request? Or maybe do?
            # For now, we just filter out invalid recommendations silently.
            print(f"Warning: LLM recommended non-existent product ID {rec.get('product_id')}, filtering out.")
            
    if not valid_recommendations and result.get("recommendations") is not None:
        # If LLM gave recommendations but none were valid product IDs
        raise HTTPException(status_code=502, detail="LLM generated recommendations, but none matched existing products.")

    return {"recommendations": valid_recommendations}

# --- Main Execution --- 

if __name__ == "__main__":
    # Use uvicorn to run the app. Run this script using: uvicorn app:app --reload --host 0.0.0.0 --port 5001
    port = int(os.environ.get("PORT", 5001)) # Default to 5001 for backend
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True) # reload=True for development

