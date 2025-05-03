import React, { useState, useEffect } from 'react';
import Catalog from './components/Catalog';
import UserPreferences from './components/UserPreferences';
import BrowsingHistory from './components/BrowsingHistory';
import Recommendations from './components/Recommendations';
import { fetchProducts, fetchRecommendations } from './services/api';
import './styles/App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    loadProducts();
  }, []);

  const handleProductClick = (productId) => {
    setHistory(prevHistory => {
      const updatedHistory = [productId, ...prevHistory.filter(id => id !== productId)];
      return updatedHistory.slice(0, 10);
    });
  };

  const handlePreferencesChange = async (newPreferences) => {
    setPreferences(newPreferences);
    setRecLoading(true);
    setRecError(null);
    setRecommendations([]);
    try {
      const data = await fetchRecommendations(newPreferences, history);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      setRecError(error.message || 'Failed to fetch recommendations.');
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Product Recommendation System (Groq/Llama3)</h1>
      </header>
      <main>
        <UserPreferences onPreferencesChange={handlePreferencesChange} />
        <BrowsingHistory history={history} products={products} />
        <Recommendations recommendations={recommendations} loading={recLoading} error={recError} />
        <Catalog products={products} onProductClick={handleProductClick} />
      </main>
    </div>
  );
}

export default App;
