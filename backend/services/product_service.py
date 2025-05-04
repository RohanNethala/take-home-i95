import json
import os

# Determine the absolute path to the data directory
script_dir = os.path.dirname(__file__) 
backend_dir = os.path.dirname(script_dir) 
data_path = os.path.join(backend_dir, 'data', 'products.json')

products = []

def load_products():
    """Loads product data from the JSON file."""
    global products
    try:
        # Ensure the path exists before trying to open
        if not os.path.exists(data_path):
            print(f"Error: Product data file not found at {data_path}")
            products = []
            return
            
        with open(data_path, 'r') as f:
            products = json.load(f)
        print(f"Loaded {len(products)} products from {data_path}")
    except FileNotFoundError:
        # This case might be redundant due to the check above, but kept for safety
        print(f"Error: Product data file not found at {data_path} (FileNotFoundError)")
        products = []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {data_path}")
        products = []
    except Exception as e:
        print(f"An unexpected error occurred while loading products: {e}")
        products = []

def get_all_products():
    """Returns the list of all products."""
    # Ensure products are loaded if the list is empty
    if not products:
        load_products()
    return products

def get_product_by_id(product_id):
    """Finds a product by its ID."""
    if not products:
        load_products()
    for product in products:
        # Use .get() for safer dictionary access
        if product.get('id') == product_id:
            return product
    return None

# Load products when the module is imported initially
# This ensures data is ready when other modules import this service
load_products()

