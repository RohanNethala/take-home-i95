// Service to handle API calls to the backend

const API_BASE_URL = "http://localhost:5001/api";

/**
 * Fetches the product catalog from the backend.
 * @returns {Promise<Array<Object>>} A promise that resolves to the list of products.
 */
export const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            // Try to parse error message from backend if available
            let errorDetail = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                // Ignore if response is not JSON
            }
            throw new Error(errorDetail);
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        // Re-throw the error so the component can handle it (e.g., show an error message)
        throw error; 
    }
};

/**
 * Sends user preferences and browsing history to the backend to get recommendations.
 * @param {Object} preferences - User preferences object.
 * @param {Array<string>} historyIds - Array of product IDs in browsing history.
 * @returns {Promise<Object>} A promise that resolves to the recommendation response.
 */
export const fetchRecommendations = async (preferences, historyIds) => {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ preferences, history_ids: historyIds }), // Match FastAPI request body model
        });

        if (!response.ok) {
            let errorDetail = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                // Ignore if response is not JSON
            }
            throw new Error(errorDetail);
        }

        const recommendations = await response.json();
        return recommendations;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        // Re-throw for component handling
        throw error;
    }
};

