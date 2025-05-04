# Backend Setup (Flask)

This directory contains the backend API for the AI-Powered Product Recommendation Engine, built using Flask.

## Prerequisites

*   Python 3.10 or later
*   `pip` (Python package installer)
*   `python3-venv` (for creating virtual environments - e.g., `sudo apt install python3.10-venv` on Debian/Ubuntu)

## Setup Instructions

1.  **Navigate to the `backend` directory:**
    ```bash
    cd path/to/recommendation_code/backend
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
    *   Add your Groq API key to this file:
        ```env
        GROQ_API_KEY=your_groq_api_key_here
        # Optional: Specify model, max tokens, temperature
        # MODEL_NAME=llama3-8b-8192
        # MAX_TOKENS=500
        # TEMPERATURE=0.5
        ```
    *   **Important:** Ensure the `.env` file is listed in your `.gitignore` file (if you are using Git) to avoid committing your secret key.

6.  **Run the Flask application (Development):**
    ```bash
    python3 app.py
    ```
    *   This command runs the Flask development server.
    *   `--host 0.0.0.0`: Makes the server accessible from outside the container/machine (necessary for the frontend to connect).
    *   `--port 5001`: Specifies the port the backend server will run on.
    *   `debug=True`: Enables auto-reloading for development (the server restarts when code changes) and provides a debugger.
    *   **Note:** For production, use a production-ready WSGI server like Gunicorn or Waitress instead of the built-in development server.

7.  **Access the API:**
    *   The API will be running at `http://localhost:5001` (or `http://<your-ip>:5001`).
    *   Unlike FastAPI, Flask does not provide automatic interactive API documentation out-of-the-box. Refer to the endpoint descriptions below or the source code (`app.py`) for details.

## Project Structure

```
backend/
│
├── app.py               # Main Flask application, defines routes
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
    *   **Response:** `{"message": "Welcome to the Recommendation System API (Flask Version)!"}`
*   `GET /api/products`: Retrieves the full product catalog.
    *   **Success Response (200 OK):** JSON array of product objects.
    *   **Error Response (503 Service Unavailable):** If product catalog cannot be loaded.
*   `POST /api/recommendations`: Accepts user preferences and browsing history (as JSON body) and returns personalized product recommendations.
    *   **Request Body (Content-Type: application/json):**
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
              "product_id": "prod...",
              "explanation": "Explanation why this product is recommended..."
            },
            ...
          ]
        }
        ```
    *   **Error Responses:** Uses standard HTTP status codes with a JSON body like `{"error": "Error description"}` generated via Flask's `abort(code, description=...)`.
        *   `400 Bad Request`: If request body is not JSON or missing required fields (`preferences`, `history_ids`).
        *   `429 Too Many Requests`: If Groq API rate limit is exceeded.
        *   `500 Internal Server Error`: For unexpected server errors.
        *   `502 Bad Gateway`: If the LLM response has format/parsing errors or recommends non-existent products.
        *   `503 Service Unavailable`: If the Groq API key is missing/invalid, or if the product catalog is empty/unavailable after filtering.


