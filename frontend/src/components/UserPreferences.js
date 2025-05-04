import React, { useState } from 'react';
import './UserPreferences.css'; // Assuming you have or will create this CSS file

const UserPreferences = ({ onSubmitPreferences }) => {
    // Define potential preference options
    // These could be dynamically loaded or expanded
    const availableCategories = ["Electronics", "Clothing", "Sports", "Home", "Beauty", "Health", "Office", "Pets", "Books", "Accessories", "Footwear", "Toys"];
    const availableStyles = ["Modern", "Classic", "Casual", "Sporty", "Minimalist", "Luxury"];
    const priceRanges = [
        { label: "Any", value: [0, 10000] }, // Represents no price limit
        { label: "Under $50", value: [0, 50] },
        { label: "$50 - $100", value: [50, 100] },
        { label: "$100 - $250", value: [100, 250] },
        { label: "$250 - $500", value: [250, 500] },
        { label: "Over $500", value: [500, 10000] },
    ];

    // State for user selections
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0].value); // Default to 'Any'
    const [otherInterests, setOtherInterests] = useState('');

    const handleCategoryChange = (event) => {
        const { value, checked } = event.target;
        setSelectedCategories(prev => 
            checked ? [...prev, value] : prev.filter(cat => cat !== value)
        );
    };

    const handleStyleChange = (event) => {
        const { value, checked } = event.target;
        setSelectedStyles(prev => 
            checked ? [...prev, value] : prev.filter(style => style !== value)
        );
    };

    const handlePriceChange = (event) => {
        const selectedRange = priceRanges.find(r => r.label === event.target.value);
        setSelectedPriceRange(selectedRange ? selectedRange.value : priceRanges[0].value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const preferences = {
            categories: selectedCategories,
            styles: selectedStyles,
            price_range: selectedPriceRange,
            other_interests: otherInterests.trim() || undefined // Only include if not empty
        };
        onSubmitPreferences(preferences);
        // Optionally clear form or give feedback
        // console.log("Preferences submitted:", preferences);
    };

    return (
        <div className="user-preferences">
            <h2>Your Preferences</h2>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Favorite Categories:</legend>
                    {availableCategories.map(category => (
                        <div key={category}>
                            <input 
                                type="checkbox" 
                                id={`cat-${category}`} 
                                value={category} 
                                onChange={handleCategoryChange} 
                                checked={selectedCategories.includes(category)}
                            />
                            <label htmlFor={`cat-${category}`}>{category}</label>
                        </div>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Preferred Styles:</legend>
                    {availableStyles.map(style => (
                        <div key={style}>
                            <input 
                                type="checkbox" 
                                id={`style-${style}`} 
                                value={style} 
                                onChange={handleStyleChange} 
                                checked={selectedStyles.includes(style)}
                            />
                            <label htmlFor={`style-${style}`}>{style}</label>
                        </div>
                    ))}
                </fieldset>

                <fieldset>
                    <legend>Price Range:</legend>
                    <select onChange={handlePriceChange} defaultValue={priceRanges[0].label}>
                        {priceRanges.map(range => (
                            <option key={range.label} value={range.label}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </fieldset>
                
                <fieldset>
                    <legend>Other Interests (Optional):</legend>
                    <textarea 
                        placeholder="e.g., sustainable products, specific brands, tech gadgets" 
                        value={otherInterests}
                        onChange={(e) => setOtherInterests(e.target.value)}
                    />
                </fieldset>

                <button type="submit">Update Preferences & Get Recommendations</button>
            </form>
        </div>
    );
};

export default UserPreferences;

