import React, { useState } from 'react';
import './UserPreferences.css';

const UserPreferences = ({ onPreferencesChange }) => {
  const [categories, setCategories] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [styles, setStyles] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const preferences = {};
    if (categories) preferences.categories = categories.split(',').map(s => s.trim()).filter(Boolean);
    const range = [];
    if (priceMin) range.push(parseFloat(priceMin));
    if (priceMax) range.push(parseFloat(priceMax));
    if (range.length > 0) preferences.price_range = range;
    if (styles) preferences.styles = styles.split(',').map(s => s.trim()).filter(Boolean);

    onPreferencesChange(preferences);
  };

  return (
    <div className="preferences-container">
      <h2>Your Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="categories">Preferred Categories (comma-separated):</label>
          <input
            type="text"
            id="categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="e.g., Electronics, Clothing"
          />
        </div>
        <div className="form-group price-range">
          <label>Price Range:</label>
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min $"
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max $"
            min={priceMin || 0}
          />
        </div>
        <div className="form-group">
          <label htmlFor="styles">Preferred Styles/Tags (comma-separated):</label>
          <input
            type="text"
            id="styles"
            value={styles}
            onChange={(e) => setStyles(e.target.value)}
            placeholder="e.g., casual, modern, eco-friendly"
          />
        </div>
        <button type="submit">Update Preferences & Get Recommendations</button>
      </form>
    </div>
  );
};

export default UserPreferences;
