const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const fetchProducts = async ()  => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchRecommendations = async (preferences, history_ids) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences, history_ids }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error response' }));
      console.error("API Error Response:", errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};
