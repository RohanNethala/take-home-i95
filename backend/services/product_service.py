import json
import os
from typing import List, Dict, Optional

script_dir = os.path.dirname(__file__)
data_path = os.path.join(script_dir, "..", "data", "products.json")

_products_cache: Optional[List[Dict]] = None
_products_dict_cache: Optional[Dict[str, Dict]] = None

def load_products() -> None:
    # Loads product data from the JSON file into the cache.
    global _products_cache, _products_dict_cache
    try:
        with open(data_path, 'r') as f:
            _products_cache = json.load(f)
            _products_dict_cache = {product["id"]: product for product in _products_cache}
        print(f"Successfully loaded {len(_products_cache)} products from {data_path}")
    except FileNotFoundError:
        print(f"Error: Product data file not found at {data_path}")
        _products_cache = []
        _products_dict_cache = {}
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {data_path}")
        _products_cache = []
        _products_dict_cache = {}
    except Exception as e:
        print(f"An unexpected error occurred loading products: {e}")
        _products_cache = []
        _products_dict_cache = {}

def get_all_products() -> List[Dict]:
    # Returns the list of all products from the cache.
    if _products_cache is None:
        load_products()
    return list(_products_cache) if _products_cache else []

def get_product_by_id(product_id: str) -> Optional[Dict]:
    # Returns a single product by its ID from the cache.
    if _products_dict_cache is None:
        load_products()
    product = _products_dict_cache.get(product_id) if _products_dict_cache else None
    return dict(product) if product else None
