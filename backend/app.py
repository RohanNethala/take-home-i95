from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
# Assuming app.py is in the backend root
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path)

# Adjust import paths based on the project structure
# Assuming app.py is in the backend root
from services.product_service import get_all_products, load_products, get_product_by_id
from services.llm_service import get_recommendations

# --- Flask Application Setup --- 

app = Flask(__name__)

# Configure CORS
# Allow requests from the default React development server origin
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# --- Load Product Data on Startup --- 
# Flask doesn't have a direct equivalent to FastAPI's startup events built-in
# for simple cases like this. We can load data when the service module is imported,
# or explicitly call load_products() here. The product_service already loads on import.
print("Initializing product data (via module import)...")
if not get_all_products(): # Trigger loading if it hasn't happened
    print("Product data was not loaded on import, attempting explicit load...")
    load_products()
    if get_all_products():
        print("Product data initialization complete.")
    else:
        print("Error: Failed to load product data on startup.")
else:
    print("Product data already loaded.")

# --- API Endpoints --- 

@app.route("/", methods=["GET"])
def read_root():
    """Simple endpoint to confirm the API is running."""
    return jsonify({"message": "Welcome to the Recommendation System API (Flask Version)!"})

# /api/products endpoint
@app.route("/api/products", methods=["GET"])
def get_products_endpoint():
    """Retrieves the list of all available products."""
    products = get_all_products()
    if not products:
        # If loading failed or file was empty
        abort(503, description="Product catalog is currently unavailable.")
    return jsonify(products)

# /api/recommendations endpoint
@app.route("/api/recommendations", methods=["POST"])
def recommend_products_endpoint():
    """Receives user preferences and browsing history, then returns LLM-generated product recommendations."""
    if not request.is_json:
        abort(400, description="Request body must be JSON.")

    data = request.get_json()
    preferences = data.get("preferences")
    history_ids = data.get("history_ids")

    if preferences is None or history_ids is None:
        abort(400, description="Missing 'preferences' or 'history_ids' in request body.")

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
        elif "catalog is empty" in error_message or "No products found" in error_message:
             status_code = 503 # Service Unavailable (data loading/filtering issue)
             
        abort(status_code, description=error_message)
    
    # Validate that the recommended product IDs actually exist
    valid_recommendations = []
    llm_recs = result.get("recommendations", [])
    for rec in llm_recs:
        if isinstance(rec, dict) and get_product_by_id(rec.get("product_id")):
            valid_recommendations.append(rec)
        else:
            # Log this, but filter out invalid recommendations silently.
            print(f"Warning: LLM recommended invalid/non-existent product ID or format: {rec.get('product_id', rec)}, filtering out.")
            
    if not valid_recommendations and llm_recs:
        # If LLM gave recommendations but none were valid product IDs
        abort(502, description="LLM generated recommendations, but none matched existing products.")

    return jsonify({"recommendations": valid_recommendations})

# --- Main Execution --- 

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001)) # Default to 5001 for backend
    app.run(host="0.0.0.0", port=port, debug=True) # debug=True enables auto-reloading

