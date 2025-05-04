import React from 'react';
import './BrowsingHistory.css'; // Assuming you have or will create this CSS file

const BrowsingHistory = ({ history, products }) => {
    // Find product details for IDs in history
    const historyProducts = history
        .map(id => products.find(p => p.id === id))
        .filter(p => p); // Filter out any undefined if product not found (shouldn't happen ideally)

    return (
        <div className="browsing-history">
            <h2>Browsing History</h2>
            {historyProducts.length === 0 ? (
                <p>You haven't viewed any products yet.</p>
            ) : (
                <ul>
                    {/* Display history in reverse chronological order (most recent first) */}
                    {[...historyProducts].reverse().map((product, index) => (
                        <li key={`${product.id}-${index}`}> {/* Use index for potential duplicates */}
                            {product.name} ({product.category})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BrowsingHistory;

