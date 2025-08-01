"""
Application configuration settings
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL')
    OPENAI_TEMPERATURE = float(os.getenv('OPENAI_TEMPERATURE', '0.7'))
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    PORT = int(os.getenv('PORT', 8000))
    DEBUG = FLASK_ENV == 'development'
    
    # External API Configuration
    BACKEND_SERVER_URL = os.getenv('BACKEND_SERVER_URL', 'http://172.16.15.115:5000')
    SKILLS_API_URL = os.getenv('SKILLS_API_URL', 'http://172.16.15.115:5000/api/v1/skills/all')
    TECHNICIANS_API_URL = os.getenv('TECHNICIANS_API_URL', 'http://172.16.15.115:5000/api/v1/technicians/search')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Validation
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required")
        return True 