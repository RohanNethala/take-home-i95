import React from 'react';
import './Catalog.css';

const Catalog = ({ products, onProductClick }) => {
  if (!products || products.length === 0) {
    return <p>Loading catalog...</p>;
  }

  return (
    <div className="catalog-container">
      <h2>Product Catalog</h2>
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-item" onClick={() => onProductClick(product.id)}>
            <h3>{product.name}</h3>
            <p><strong>Category:</strong> {product.category} / {product.subcategory}</p>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Rating:</strong> {product.rating} / 5</p>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
