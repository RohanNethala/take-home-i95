import React, { useState, useMemo } from 'react';
import './Catalog.css';

const Catalog = ({ products, loading, error, onProductClick }) => {
    // --- State for Filters and Sorting ---
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterPriceMin, setFilterPriceMin] = useState('');
    const [filterPriceMax, setFilterPriceMax] = useState('');
    const [filterRatingMin, setFilterRatingMin] = useState(0);
    const [sortKey, setSortKey] = useState('default'); // 'default', 'price', 'rating', 'name'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

    // --- Derived Data for Filters ---
    const categories = useMemo(() => {
        if (!products) return [];
        const uniqueCategories = new Set(products.map(p => p.category));
        return ['All', ...Array.from(uniqueCategories).sort()];
    }, [products]);

    // --- Filtering and Sorting Logic ---
    const filteredAndSortedProducts = useMemo(() => {
        if (!products) return [];

        let processedProducts = [...products];

        // Apply Filters
        if (filterCategory !== 'All') {
            processedProducts = processedProducts.filter(p => p.category === filterCategory);
        }
        if (filterPriceMin !== '') {
            processedProducts = processedProducts.filter(p => p.price >= parseFloat(filterPriceMin));
        }
        if (filterPriceMax !== '') {
            processedProducts = processedProducts.filter(p => p.price <= parseFloat(filterPriceMax));
        }
        if (filterRatingMin > 0) {
            processedProducts = processedProducts.filter(p => p.rating >= filterRatingMin);
        }

        // Apply Sorting
        if (sortKey !== 'default') {
            processedProducts.sort((a, b) => {
                let valA = a[sortKey];
                let valB = b[sortKey];

                // Handle potential non-numeric sorting like name
                if (sortKey === 'name') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                let comparison = 0;
                if (valA > valB) {
                    comparison = 1;
                } else if (valA < valB) {
                    comparison = -1;
                }
                return sortOrder === 'desc' ? (comparison * -1) : comparison;
            });
        }

        return processedProducts;
    }, [products, filterCategory, filterPriceMin, filterPriceMax, filterRatingMin, sortKey, sortOrder]);

    // --- Render Logic ---
    if (loading) {
        return <div className="catalog-loading">Loading products...</div>;
    }

    if (error) {
        return <div className="catalog-error">Error: {error}</div>;
    }

    return (
        <div className="product-catalog">
            <h2>Product Catalog</h2>
            
            {/* --- Filter and Sort Controls --- */}
            <div className="catalog-controls">
                {/* Category Filter */}
                <div className="control-group">
                    <label htmlFor="category-filter">Category:</label>
                    <select 
                        id="category-filter" 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* Price Filter */}
                <div className="control-group">
                    <label>Price:</label>
                    <input 
                        type="number" 
                        placeholder="Min $" 
                        value={filterPriceMin} 
                        onChange={(e) => setFilterPriceMin(e.target.value)} 
                        min="0"
                    />
                    <span>-</span>
                    <input 
                        type="number" 
                        placeholder="Max $" 
                        value={filterPriceMax} 
                        onChange={(e) => setFilterPriceMax(e.target.value)} 
                        min={filterPriceMin || 0}
                    />
                </div>

                {/* Rating Filter */}
                <div className="control-group">
                    <label htmlFor="rating-filter">Min Rating:</label>
                    <select 
                        id="rating-filter" 
                        value={filterRatingMin} 
                        onChange={(e) => setFilterRatingMin(parseFloat(e.target.value))}
                    >
                        <option value="0">Any</option>
                        <option value="4.5">4.5+</option>
                        <option value="4">4+</option>
                        <option value="3.5">3.5+</option>
                        <option value="3">3+</option>
                    </select>
                </div>

                {/* Sort Controls */}
                <div className="control-group">
                    <label htmlFor="sort-key">Sort By:</label>
                    <select 
                        id="sort-key" 
                        value={sortKey} 
                        onChange={(e) => setSortKey(e.target.value)}
                    >
                        <option value="default">Default</option>
                        <option value="price">Price</option>
                        <option value="rating">Rating</option>
                        <option value="name">Name</option>
                    </select>
                    <button 
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        disabled={sortKey === 'default'}
                        className={`sort-order-btn ${sortOrder}`}
                    >
                        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                    </button>
                </div>
            </div>

            {/* --- Product Grid --- */}
            {filteredAndSortedProducts.length === 0 && !loading && (
                <div className="catalog-empty">No products match the current filters.</div>
            )}
            <div className="product-grid">
                {filteredAndSortedProducts.map((product) => (
                    <div 
                        key={product.id} 
                        className="product-card" 
                        onClick={() => onProductClick(product.id)}
                        title={`Click to add ${product.name} to browsing history`}
                    >
                        <div className="product-image-placeholder">Image</div> 
                        <h3>{product.name}</h3>
                        <p className="product-category">{product.category} &gt; {product.subcategory}</p>
                        <p className="product-brand">Brand: {product.brand}</p>
                        <p className="product-price">${product.price.toFixed(2)}</p>
                        <p className="product-rating">Rating: {product.rating} / 5</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;

