from groq import Groq, RateLimitError, APIError
import os
from dotenv import load_dotenv
import json
from .product_service import get_all_products, get_product_by_id
from typing import Dict, Any, List

# Load environment variables from .env file
script_dir = os.path.dirname(__file__)
backend_dir = os.path.dirname(script_dir) 
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path=dotenv_path)

# Configure Groq API client
groq_api_key = os.getenv("GROQ_API_KEY")
client = None
if groq_api_key:
    try:
        client = Groq(api_key=groq_api_key)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
else:
    print("Warning: GROQ_API_KEY not found in .env file. LLM service will not function.")

# Read model configuration from environment variables with defaults
MODEL_NAME = os.getenv("MODEL_NAME", "llama3-8b-8192")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", 500))
TEMPERATURE = float(os.getenv("TEMPERATURE", 0.5))

def format_product_for_llm(product: Dict[str, Any]) -> str:
    """Formats a product dictionary into a string suitable for the LLM prompt."""
    features_str = ", ".join(product.get("features", []))
    tags_str = ", ".join(product.get("tags", []))
    return f"""ID: {product.get("id")}
Name: {product.get("name")}
Category: {product.get("category")}, Subcategory: {product.get("subcategory")}
Brand: {product.get("brand")}
Price: ${product.get("price")}
Rating: {product.get("rating")}
Description: {product.get("description")}
Features: {features_str}
Tags: {tags_str}"""

def get_recommendations(preferences: Dict[str, Any], history_ids: List[str]) -> Dict[str, Any]:
    """Generates product recommendations using the Groq API based on preferences and history."""
    if not client:
        return {"error": "Groq API key not configured or client not initialized.", "recommendations": []}

    try:
        all_products = get_all_products()
        if not all_products:
            return {"error": "Product catalog is empty or could not be loaded.", "recommendations": []}

        # --- Pre-filter products based on STRICT preferences (Category, Price) --- 
        filtered_catalog = all_products
        
        pref_categories = preferences.get("categories", [])
        pref_price_range = preferences.get("price_range", [])

        # Filter by Category if specified (More Flexible: Case-Insensitive, Partial Match)
        if pref_categories:
            # Normalize user preferences (lowercase, stripped)
            pref_categories_lower = [c.lower().strip() for c in pref_categories if isinstance(c, str)]
            
            temp_catalog = []
            for p in filtered_catalog:
                product_cat_lower = p.get("category", "").lower().strip()
                # Check if the product category *starts with* any of the user's preferred categories
                # OR if any user category *starts with* the product category (handles shorter DB entries)
                if any(product_cat_lower.startswith(user_cat) or user_cat.startswith(product_cat_lower) for user_cat in pref_categories_lower):
                    temp_catalog.append(p)
            filtered_catalog = temp_catalog

        # Filter by Price Range if specified
        min_price, max_price = None, None
        try:
            if len(pref_price_range) == 1:
                min_price = float(pref_price_range[0])
            elif len(pref_price_range) >= 2:
                min_price = float(pref_price_range[0])
                max_price = float(pref_price_range[1])
        except (ValueError, TypeError):
             print(f"Warning: Invalid price range format received: {pref_price_range}. Ignoring price filter.")
             min_price, max_price = None, None
        
        if min_price is not None:
            filtered_catalog = [p for p in filtered_catalog if p.get("price", float("inf")) >= min_price]
        if max_price is not None:
            filtered_catalog = [p for p in filtered_catalog if p.get("price", float("-inf")) <= max_price]

        # Check if essential filtering removed all products
        if not filtered_catalog:
             print(f"Warning: Pre-filtering by category/price removed all products. Prefs: {preferences}")
             return {"error": "No products found matching the specified category/price filters.", "recommendations": []}
        
        product_catalog_str = "\n\n---\n\n".join([format_product_for_llm(p) for p in filtered_catalog])
        print(f"Sending {len(filtered_catalog)} pre-filtered products (by category/price) to LLM.")

        # Format browsing history
        history_products = [get_product_by_id(pid) for pid in history_ids if get_product_by_id(pid)]
        history_str = "User has recently viewed:\n" + "\n".join([f"- {p.get('name')} (ID: {p.get('id')})" for p in history_products]) if history_products else "User has no browsing history yet."

        # Format preferences (ensure all fields are included)
        preferences_str = "User Preferences:\n" + json.dumps(preferences, indent=2)

        # --- Adjusted Prompt Engineering --- 
        system_prompt = (
            "You are an expert eCommerce product recommendation engine. "
            "Your goal is to provide personalized product recommendations based on the user's preferences, their browsing history, and the *provided* product catalog (which is pre-filtered by category and price). "
            "**Strictly adhere to the user's specified `categories` and `price_range` if provided.** Recommendations MUST belong to one of the specified categories and fall within the price range. "
            "**Strongly consider the user's `styles`/`tags` and `other_interests` preferences.** Aim to find products that match these, but prioritize category/price constraints. Use `other_interests` to understand broader user needs. "
            "Only recommend products from the provided catalog. "
            "Provide exactly 3 recommendations if possible, selecting the *best* matches from the provided catalog based on all criteria (strict: category/price, strong: styles/tags/interests, consider: history). "
            "If you cannot find 3 good matches within the constraints, provide fewer. "
            "For each recommendation, include the product ID and a brief, user-friendly explanation (max 2 sentences) for why it's recommended, explicitly linking it to their preferences (category, price, style, interests) or history. "
            "Format your response *only* as a JSON object containing a single key 'recommendations', which is a list of objects. "
            "Each object in the list must have two keys: 'product_id' (string) and 'explanation' (string). "
            "Do not include any other text, greetings, apologies, or markdown formatting like ```json. Only return the raw JSON object."
        )

        user_prompt = (
            f"{preferences_str}\n\n"
            f"{history_str}\n\n"
            f"Available Product Catalog (Use ONLY these products, already filtered by category/price):\n---\n{product_catalog_str}\n\n---"
            f"Based *strictly* on category/price preferences, *strongly considering* styles/tags/interests, and considering browsing history, provide up to 3 product recommendations with explanations in the specified JSON format."
        )

        chat_completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
            response_format={"type": "json_object"}
        )

        content = chat_completion.choices[0].message.content
        
        # Attempt to parse the JSON response (simplified due to response_format="json_object")
        try:
            recommendation_data = json.loads(content)
            if isinstance(recommendation_data, dict) and \
               "recommendations" in recommendation_data and \
               isinstance(recommendation_data["recommendations"], list):
                validated_recommendations = []
                for rec in recommendation_data["recommendations"]:
                    if isinstance(rec, dict) and "product_id" in rec and "explanation" in rec:
                        if get_product_by_id(rec["product_id"]):
                            validated_recommendations.append(rec)
                        else:
                            print(f"Warning: LLM recommended non-existent product ID: {rec['product_id']}")
                    else:
                        print(f"Warning: LLM recommendation item has incorrect format: {rec}")
                return {"recommendations": validated_recommendations}
            else:
                print(f"Error: LLM response JSON structure is invalid or missing 'recommendations' key. Data: {recommendation_data}")
                return {"error": "LLM response format error.", "recommendations": []}

        except json.JSONDecodeError as e:
            print(f"Error: Could not decode JSON response from LLM: {content}. Error: {e}")
            return {"error": "LLM response JSON parsing error.", "recommendations": []}

    except RateLimitError as e:
        print(f"Groq Rate Limit Error: {e}")
        return {"error": "Rate limit exceeded with Groq API. Please try again later.", "recommendations": []}
    except APIError as e:
        print(f"Groq API Error: {e}")
        return {"error": f"An error occurred with the Groq API: {e}", "recommendations": []}
    except Exception as e:
        import traceback
        print(f"An unexpected error occurred in get_recommendations: {e}")
        print(traceback.format_exc())
        return {"error": f"An unexpected server error occurred: {e}", "recommendations": []}

