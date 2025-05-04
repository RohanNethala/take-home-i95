import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration settings
config = {
    'GROQ_API_KEY': os.getenv('GROQ_API_KEY'),
    'MODEL_NAME': os.getenv('MODEL_NAME', 'llama3-8b-8192'),
    'MAX_TOKENS': int(os.getenv('MAX_TOKENS', 500)),
    'TEMPERATURE': float(os.getenv('TEMPERATURE', 0.5)),
    'DATA_PATH': os.getenv('DATA_PATH', 'data/products.json')
}