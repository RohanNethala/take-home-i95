from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import uvicorn
import os

# Here we adjust the import paths we use based on the structure of the project
from services.product_service import get_all_products, load_products, get_product_by_id

app = FastAPI(
    title="Product Recommendation API",
    description="API for generating product recommendations.",
    version="0.1.0"
)

# Here is where we configure the CORS, you can adjust origins as needed for your frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

# Here is the event handler for when the app starts up

@app.on_event("startup")
def startup_event():
    print("Initializing product data...")
    load_products() 
    print("Product data initialization complete.")

# Here are the API endpoints

@app.get("/", tags=["General"], summary="Root endpoint to check API status")
def read_root():
    return {"message": "Welcome to the Recommendation System API!"}

@app.get("/api/products", response_model=List[Dict], tags=["Products"], summary="Get the full product catalog")
def get_products_endpoint():
    products = get_all_products()
    if not products:
        raise HTTPException(status_code=503, detail="Product catalog is currently unavailable.")
    return products

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
