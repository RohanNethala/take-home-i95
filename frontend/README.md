# Frontend Setup (React)

This directory contains the frontend application for the AI-Powered Product Recommendation Engine, built using React (Create React App).

## Prerequisites

*   Node.js (v16 or later recommended)
*   `npm` (Node Package Manager, typically comes with Node.js)

## Setup Instructions

1.  **Navigate to the `frontend` directory:**
    ```bash
    cd path/to/recommendation-takehome/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(This command reads the `package.json` file and installs all the necessary libraries.)*

3.  **Configure Backend API URL (if necessary):**
    *   The frontend needs to know where the backend API is running.
    *   By default, it expects the backend to be at `http://localhost:5001/api` (as defined in `src/services/api.js`).
    *   If your backend is running on a different URL (e.g., a deployed URL or a different port), you **must** update the `API_BASE_URL` constant in `src/services/api.js` accordingly.

4.  **Run the React application (Development Mode):**
    ```bash
    npm start
    ```
    *   This command starts the development server.
    *   It will typically open the application automatically in your default web browser at `http://localhost:3000`.
    *   The development server provides features like hot reloading (changes in code automatically update the browser).
    *   **Note:** Ensure the backend server is running and accessible from the frontend (check CORS configuration in the backend if you encounter connection issues).

5.  **Build for Production (Optional):**
    *   To create an optimized build for deployment, run:
        ```bash
        npm run build
        ```
    *   This command creates a `build` directory containing static assets that can be deployed to a web server or hosting platform.

## Project Structure

```
frontend/
│
├── public/
│   └── index.html       # Main HTML template
│
├── src/
│   ├── App.js           # Main application component, state management
│   ├── index.js         # Entry point for the React app
│   ├── components/      # Reusable UI components
│   │   ├── Catalog.js
│   │   ├── Catalog.css
│   │   ├── UserPreferences.js
│   │   ├── UserPreferences.css
│   │   ├── Recommendations.js
│   │   ├── Recommendations.css
│   │   └── BrowsingHistory.js
│   │   └── BrowsingHistory.css
│   │
│   ├── services/
│   │   └── api.js       # API client for backend communication
│   │
│   └── styles/
│       └── App.css      # Global application styling
│
├── package.json         # NPM dependencies and scripts
├── package-lock.json    # Exact dependency versions
└── README.md            # This file
```

## Key Components

*   **`App.js`**: The main container component that manages the overall application state (products, preferences, history, recommendations) and orchestrates the interaction between other components.
*   **`Catalog.js`**: Fetches and displays the product catalog from the backend API. Allows users to click on products to add them to their browsing history.
*   **`UserPreferences.js`**: Provides a form for users to input their preferences (categories, styles, price range, other interests). Submitting the form triggers fetching new recommendations.
*   **`BrowsingHistory.js`**: Displays the list of recently viewed products (based on clicks in the Catalog).
*   **`Recommendations.js`**: Displays the personalized product recommendations received from the backend API, along with the explanations provided by the LLM.
*   **`api.js`**: Contains functions (`fetchProducts`, `fetchRecommendations`) to handle communication with the backend API endpoints.

