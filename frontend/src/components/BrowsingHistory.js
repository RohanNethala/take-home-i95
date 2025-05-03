import React from 'react';
import './BrowsingHistory.css';

const BrowsingHistory = ({ history, products }) => {
  const historyProducts = history.map(id => products.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="history-container">
      <h2>Browsing History (Click product in catalog to add)</h2>
      {historyProducts.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        <ul>
          {historyProducts.map(product => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrowsingHistory;
