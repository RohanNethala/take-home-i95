# Take Home Assessment for i95 AI Engineering Internship

This is part of my submission for i95's AI Engineering Internship Take Home Assessment. The assignment was to make a simplified product recommendation system that leverages LLMs to generate personalized recommendations based on user preferences and browsing history.

Tech Stack: React.js, REST APIs, Groq API (Llama 3 LLM), Flask, Python

Setup and Running Instructions
Please refer to the README files within the respective backend and frontend directories for detailed setup and execution instructions:

Approach and Implementation Details
Development Journey: FastAPI to Flask
Implementing the backend was tough at first, especially with structuring the API and integrating the LLM service smoothly. To handle all of this, the backend was initially developed using FastAPI instead of with Flask. This framework's features, like automatic documentation and asynchronous support, helped with rapid prototyping and allowed for focusing on getting the core recommendation logic (product loading, LLM interaction, prompt engineering) working.
Once all the required features, like recommendations, were implemented and working fully well with the FastAPI backend, a refactoring process was undertaken to migrate the backend to Flask. This transition was significantly smoother as the core service logic (product_service.py, llm_service.py) was largely independent of what framework was being used. The shift involved replacing FastAPI-specific components (like FastAPI app instance, uvicorn, request/response models) with their Flask equivalents (Flask app instance, route decorators, request, jsonify, abort). This two-step approach allowed for tackling the core API logic first before finalizing the backend with the desired Flask framework.

1. Backend (Flask)
Framework: Flask is used for the final backend implementation, providing a lightweight and flexible structure for the API.
Data Handling: The product_service.py loads the products.json data into memory on startup for efficient access.
LLM Interaction: The llm_service.py handles all communication with the Groq API.
It formats the product catalog, user preferences, and browsing history into a structured prompt.
It calls the specified Groq model (e.g., Llama 3).
It includes robust error handling for API calls (authentication, rate limits, invalid requests) and response parsing.
It validates the structure and content of the LLM's response, ensuring recommended product IDs exist in the catalog.

API Endpoints:
/api/products: Returns the full product list.
/api/recommendations: Accepts POST requests with user preferences and history, returning LLM-generated recommendations.
CORS: Configured using Flask-CORS to allow requests from the frontend development server origin (http://localhost:3000 and potentially deployed frontend URLs).

3. Frontend (React)
Framework: Built using Create React App.
Component Structure: The UI is divided into logical components (Catalog, UserPreferences, BrowsingHistory, Recommendations).
State Management: The main App.js component manages the core application state (products, preferences, history, recommendations, loading/error states) using useState and useCallback hooks.
API Communication: The src/services/api.js module centralizes API calls to the backend using the fetch API, including error handling.

User Interaction:
Clicking products in the Catalog adds their ID to the browsingHistory state.
Submitting the UserPreferences form updates the preferences state and triggers a call to the backend for new recommendations.
Styling: Basic CSS is provided for each component and the main app layout (App.css) to ensure a clean, functional, and minimally responsive interface.

Filtering and Sorting:
In addition to the basic front-end requirements, I also implemented product filtering and sorting functionality in the Catalog.js file. This allows the user to be able to sort the products in the catalog by price, rating, etc., in either descending or ascending order, and they can also toggle filters for specific critera. This was an extra bonus feature I decided to add as I created the front-end and connected it to the back-end.

4. Prompt Engineering (llm_service.py)
The quality of recommendations heavily depends on the prompt provided to the LLM. The strategy employed here involves:

System Prompt:
Defines the LLM's role: "expert eCommerce product recommendation engine".
Sets the goal: Provide personalized recommendations based on preferences, history, and catalog.
Specifies constraints: Exactly 3 recommendations, include product ID and a brief explanation (max 2 sentences) linked to user input.
Mandates the output format: A specific JSON structure ({"recommendations": [{"product_id": "...", "explanation": "..."}]}). This is crucial for reliable parsing.

User Prompt:
Provides context in distinct sections:
User Preferences: Passed as a JSON string for clarity.
Browsing History: Formatted as a list of viewed product names and IDs.
Product Catalog: The full catalog is included, with each product formatted clearly (ID, Name, Category, Price, Description, Features, Tags). For larger catalogs, this would need optimization (e.g., filtering, sampling, embedding search).
Explicitly asks the LLM to generate 3 recommendations based on the provided context and adhere to the JSON format.

Parameters:
model: Configurable via .env, defaults to a Groq model like llama3-8b-8192.
temperature: Set to 0.5 for slightly more focused and less random recommendations compared to higher values.
max_tokens: Set to 500 to allow sufficient space for 3 recommendations and explanations.
response_format: Utilizes { "type": "json_object" } to enforce JSON output from the LLM, simplifying parsing.
Post-processing: The response content is parsed as JSON. The structure is validated, and crucially, each recommended product_id is checked against the loaded product catalog to filter out potential hallucinations or invalid IDs.

Challenges Faced and Solutions

Backend Framework Transition: The backend was initially built with FastAPI for rapid prototyping of the core recommendation logic before being refactored to use Flask as the final framework.
Solution: Developed core services (product_service, llm_service) to be largely framework-independent. After validating functionality with FastAPI, systematically replaced FastAPI components with Flask equivalents (app instance, routing, request/response handling).

Frontend-Backend Connectivity in Sandbox: The frontend, accessed via a public URL, couldn't connect to the backend running on localhost:5001 inside the sandbox.
Solution: Exposed the backend's port (5001) using the deploy_expose_port tool to get a public URL. Updated the API_BASE_URL in the frontend's api.js service to use this public backend URL. Restarted the frontend server.

React Dev Server Host Check: The default Create React App development server configuration sometimes prevents access from external URLs (like the temporary Manus proxy).
Solution: Restarted the frontend server using the DANGEROUSLY_DISABLE_HOST_CHECK=true environment variable to bypass the host check for testing purposes.

LLM Response Formatting: Ensuring the LLM consistently returns valid JSON in the specified format.
Solution: Provided very explicit instructions in the system prompt regarding the JSON structure and used the response_format={"type": "json_object"} parameter in the API call. Implemented validation on the backend to check the structure and ensure recommended product IDs exist.

Syntax Errors (f-strings): Encountered minor Python syntax errors related to nested quotes within f-strings during implementation.
Solution: Corrected the f-string formatting using different quote types or temporary variables as needed.

Time Spent
Approximately 10 - 15 hours were spent on understanding the requirements for this assessment, setting up the environments, implementing the backend (initially FastAPI, then Flask) and frontend code along with the filtering and sorting features, debugging issues (connectivity, LLM responses), writing documentation, and preparing the submission structure.

Code Quality and Comments
Code is organized into separate services and components.
Comments have been added to explain key logic, especially in llm_service.py (prompt design) and App.js (state management).
Error handling is implemented in both frontend API calls and backend services/endpoints.
Basic responsive CSS has been added.
