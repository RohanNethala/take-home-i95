# Backend Setup (FastAPI)

This directory contains the backend API for the AI-Powered Product Recommendation Engine, built using FastAPI.

## Prerequisites

*   Python 3.10 or later
*   `pip` (Python package installer)
*   `python3-venv` (for creating virtual environments - install via `sudo apt install python3.10-venv` on Debian/Ubuntu)

## Setup Instructions

1.  **Navigate to the `backend` directory:**
    ```bash
    cd path/to/recommendation-takehome/backend
    ```

2.  **Create a Python virtual environment:**
    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    *(You should see `(venv)` preceding your command prompt after activation.)*

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Configure API Key:**
    *   Create a file named `.env` in the `backend` directory.
    *   Add your OpenAI API key to this file:
        ```env
        OPENAI_API_KEY=your_openai_api_key_here
        ```
    *   **Important:** Ensure the `.env` file is listed in your `.gitignore` file (if you are using Git) to avoid committing your secret key.

6.  **Run the FastAPI application:**
    ```bash
    uvicorn app:app --reload --host 0.0.0.0 --port 5001
    ```
    *   `uvicorn app:app`: Tells uvicorn to run the `app` instance found in the `app.py` file.
    *   `--reload`: Enables auto-reloading for development (the server restarts when code changes).
    *   `--host 0.0.0.0`: Makes the server accessible from outside the container/machine (necessary for the frontend to connect).
    *   `--port 5001`: Specifies the port the backend server will run on.

7.  **Access the API:**
    *   The API will be running at `http://localhost:5001` (or `http://<your-ip>:5001`).
    *   You can access the interactive API documentation (Swagger UI) at `http://localhost:5001/docs`.
    *   You can access the alternative API documentation (ReDoc) at `http://localhost:5001/redoc`.

## Project Structure

```
backend/
│
├── app.py               # Main FastAPI application, defines endpoints
├── requirements.txt     # Python dependencies
├── .env.example         # Example environment file (API keys, etc.)
├── .env                 # Actual environment file (created by user, contains API keys - DO NOT COMMIT)
├── data/
│   └── products.json    # Sample product catalog
│
├── services/
│   ├── __init__.py
│   ├── llm_service.py   # Service for LLM interactions (recommendation logic)
│   └── product_service.py  # Service for loading/accessing product data
│
└── README.md            # This file
```

## API Endpoints

*   `GET /`: Root endpoint to check if the API is running.
*   `GET /api/products`: Retrieves the full product catalog.
*   `POST /api/recommendations`: Accepts user preferences and browsing history (as JSON body) and returns personalized product recommendations.
    *   **Request Body:**
        ```json
        {
          "preferences": {
            "categories": ["Electronics"],
            "styles": ["Modern"],
            "price_range": [100, 500],
            "other_interests": "interested in smart home devices"
          },
          "history_ids": ["product005", "product012"]
        }
        ```
    *   **Success Response (200 OK):**
        ```json
        {
          "recommendations": [
            {
              "product_id": "product008",
              "explanation": "Based on your interest in Electronics and smart home devices, this Smart Thermostat could be a great addition."
            },
            {
              "product_id": "product021",
              "explanation": "Since you viewed other electronics like the Smart Speaker (product012), you might also like these Noise-Cancelling Headphones."
            },
            {
              "product_id": "product003",
              "explanation": "This Modern Desk Lamp fits your preferred style and falls within your desired price range."
            }
          ]
        }
        ```
    *   **Error Responses:** Uses standard HTTP status codes (400, 429, 500, 502, 503) with a JSON body like `{"detail": "Error message"}`.

