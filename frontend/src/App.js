import React, { useState, useEffect, useCallback } from 'react';
import Catalog from './components/Catalog/Catalog';
import UserPreferences from './components/UserPreferences/UserPreferences';
import BrowsingHistory from './components/BrowsingHistory/BrowsingHistory';
import Recommendations from './components/Recommendations/Recommendations';
import { fetchProducts, fetchRecommendations } from './services/api';
import './styles/App.css'; // Main CSS file

function App() {
    // --- State Management --- 
    // Products fetched from backend
    const [products, setProducts] = useState([]);
    const [productError, setProductError] = useState(null);
    const [productLoading, setProductLoading] = useState(true);

    // User preferences collected from the form
    const [preferences, setPreferences] = useState({
        categories: [],
        styles: [],
        price_range: [0, 10000], // Default 'Any'
        other_interests: ''
    });
    // Browsing history (list of product IDs)
    const [browsingHistory, setBrowsingHistory] = useState([]); 
    
    // Recommendations received from the backend
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationLoading, setRecommendationLoading] = useState(false);
    const [recommendationError, setRecommendationError] = useState(null);

    // --- Effects --- 
    // Fetch products on initial application load
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setProductLoading(true);
                setProductError(null);
                const fetchedProducts = await fetchProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                console.error("Failed to load products in App:", err);
                setProductError(err.message || "Failed to load products. Check backend connection.");
            } finally {
                setProductLoading(false);
            }
        };
        loadProducts();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Callback Handlers --- 
    // Handles clicks on products in the Catalog component
    const handleProductClick = useCallback((productId) => {
        setBrowsingHistory(prevHistory => {
            // Add product ID to history, avoid duplicates, keep limited size
            const updatedHistory = [productId, ...prevHistory.filter(id => id !== productId)];
            return updatedHistory.slice(0, 15); // Keep last 15 viewed items
        });
    }, []); // No dependencies needed as it only uses the setter function

    // Fetches new recommendations from the backend API
    const getNewRecommendations = useCallback(async (currentPreferences, currentHistory) => {
        if (!currentPreferences || !currentHistory) {
            console.warn("Attempted to fetch recommendations with invalid preferences or history.");
            return;
        }
        setRecommendationLoading(true);
        setRecommendationError(null);
        try {
            const result = await fetchRecommendations(currentPreferences, currentHistory);
            setRecommendations(result.recommendations || []);
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
            setRecommendationError(err.message || "Could not fetch recommendations.");
            setRecommendations([]); // Clear old recommendations on error
        } finally {
            setRecommendationLoading(false);
        }
    }, []); // No dependencies needed as it receives prefs/history as args

    // Handles submission of the preferences form
    const handlePreferenceSubmit = useCallback((submittedPreferences) => {
        setPreferences(submittedPreferences); // Update local state
        getNewRecommendations(submittedPreferences, browsingHistory);
    }, [browsingHistory, getNewRecommendations]); // Depend on history and the fetch function

    // --- Render Logic --- 
    return (
        <div className="App">
            <header className="App-header">
                <h1>AI-Powered Product Recommendations</h1>
            </header>
            <main className="App-main">
                {/* Left Panel: User Input */}
                <div className="left-panel">
                    <UserPreferences onSubmitPreferences={handlePreferenceSubmit} />
                    <BrowsingHistory history={browsingHistory} products={products} />
                </div>
                
                {/* Center Panel: Product Catalog - Pass products, loading, error */}
                <div className="center-panel">
                    <Catalog 
                        products={products} 
                        loading={productLoading} 
                        error={productError} 
                        onProductClick={handleProductClick} 
                    />
                </div>
                
                {/* Right Panel: Recommendations */}
                <div className="right-panel">
                    <Recommendations 
                        recommendations={recommendations} 
                        products={products} 
                        loading={recommendationLoading} 
                        error={recommendationError} 
                    />
                </div>
            </main>
            <footer className="App-footer">
                <p>i95dev AI Engineering Intern Take-Home Assignment Solution</p>
            </footer>
        </div>
    );
}

export default App;

