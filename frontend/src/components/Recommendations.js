import React from 'react';
import './Recommendations.css';

const Recommendations = ({ recommendations, loading, error }) => {
  return (
    <div className="recommendations-container">
      <h2>Recommendations</h2>
      {loading && <p>Loading recommendations...</p>}
      {error && <p className="error-message">Error: {error}</p>}
      {!loading && !error && recommendations.length === 0 && <p>Submit preferences to get recommendations.</p>}
      {!loading && !error && recommendations.length > 0 && (
        <ul className="recommendation-list">
          {recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              <strong>Product ID:</strong> {rec.product_id}<br />
              <strong>Explanation:</strong> {rec.explanation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Recommendations;
