import React from 'react';
import './Recommendations.css'; // Assuming you have or will create this CSS file

const Recommendations = ({ recommendations, products, loading, error }) => {

    if (loading) {
        return <div className="recommendations-loading">Generating recommendations...</div>;
    }

    if (error) {
        return <div className="recommendations-error">Error fetching recommendations: {error}</div>;
    }

    if (!recommendations || recommendations.length === 0) {
        return <div className="recommendations-empty">No recommendations available yet. Update your preferences or browse some products!</div>;
    }

    // Function to get product details by ID
    const getProductDetails = (productId) => {
        return products.find(p => p.id === productId);
    };

    return (
        <div className="recommendations-section">
            <h2>Personalized Recommendations</h2>
            <div className="recommendations-list">
                {recommendations.map((rec, index) => {
                    const product = getProductDetails(rec.product_id);
                    if (!product) {
                        // Handle case where recommended product ID might not be in the current product list
                        // This could happen if the product list updates or if the LLM hallucinates an ID
                        console.warn(`Recommended product ID ${rec.product_id} not found in catalog.`);
                        return null; // Don't render this recommendation
                    }
                    return (
                        <div key={`${rec.product_id}-${index}`} className="recommendation-item">
                            {/* Basic product image placeholder */}
                            <div className="recommendation-image-placeholder">Image</div>
                            <div className="recommendation-details">
                                <h3>{product.name}</h3>
                                <p className="recommendation-price">${product.price.toFixed(2)}</p>
                                <p className="recommendation-explanation"><strong>Why it's recommended:</strong> {rec.explanation}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Recommendations;

