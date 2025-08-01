"""
NeuroDesk LLM Wrapper API
Main Flask application for ticket assignment workflow - Step 1
"""
from flask import Flask, request, jsonify
from langchain_openai import ChatOpenAI
import logging
import os

# Import our custom modules
from config.settings import Config
from services.assignment_service import AssignmentService

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Validate configuration
try:
    Config.validate()
    logger.info("Configuration validation passed")
except ValueError as e:
    logger.error(f"Configuration error: {str(e)}")
    raise

# Initialize OpenAI model
llm = ChatOpenAI(
    model=Config.OPENAI_MODEL,
    temperature=Config.OPENAI_TEMPERATURE,
    openai_api_key=Config.OPENAI_API_KEY
)

# Initialize assignment service
assignment_service = AssignmentService(llm)

@app.route("/", methods=["GET"])
def home():
    """Home endpoint with API information"""
    return jsonify({
        "message": "NeuroDesk LLM Wrapper API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "health": "/health",
            "ticket_assignment": "/api/ticket-assignment",
            "service_status": "/api/service-status"
        },
        "required_request_fields": ["ticket", "skills"]
    })

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "llm_available": Config.OPENAI_API_KEY is not None,
        "service": "NeuroDesk LLM Wrapper"
    })

@app.route("/api/service-status", methods=["GET"])
def service_status():
    """Get assignment service status"""
    status = assignment_service.get_assignment_status()
    return jsonify(status)

@app.route("/api/ticket-assignment", methods=["POST"])
def ticket_assignment():
    """
    Endpoint #1: Ticket Assignment - Step 1
    
    Flow:
    1. Extract ticket and skills from POST request
    2. Validate the data
    3. Pass to LLM prompt to get selected skills
    4. Return selected skills as objects
    
    Request Format:
    {
      "ticket": {
        "subject": "Network connectivity issues",
        "description": "Users unable to connect to corporate network",
        "requester_id": 101,
        "priority": "high",
        "impact": "high",
        "urgency": "high",
        "complexity_level": "level_2",
        "tags": ["network", "vpn", "connectivity"]
      },
      "skills": [
        "Network Troubleshooting",
        "Windows Administration",
        "Hardware Repair",
        "Software Installation",
        "VPN Configuration"
      ]
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        request_data = request.get_json()
        
        # Validate request data using the service
        validation_result = assignment_service.validate_request_data(request_data)
        
        if not validation_result["valid"]:
            return jsonify({
                "error": "Validation failed",
                "errors": validation_result["errors"],
                "warnings": validation_result["warnings"]
            }), 400
        
        logger.info(f"Processing ticket assignment for: {request_data.get('ticket', {}).get('subject', 'Unknown')}")
        
        # Process ticket assignment
        result = assignment_service.process_ticket_assignment(request_data)
        
        # Convert response to dictionary for JSON serialization using model_dump()
        response_dict = result.model_dump()
        
        return jsonify(response_dict)
        
    except Exception as e:
        logger.error(f"Error processing ticket assignment: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route("/api/validate-request", methods=["POST"])
def validate_request():
    """
    Validate request data without processing assignment
    Useful for testing request format
    """
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        request_data = request.get_json()
        validation_result = assignment_service.validate_request_data(request_data)
        
        return jsonify(validation_result)
        
    except Exception as e:
        logger.error(f"Error validating request: {str(e)}")
        return jsonify({
            "valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "warnings": []
        }), 500

if __name__ == "__main__":
    logger.info("Starting NeuroDesk LLM Wrapper API")
    logger.info(f"Environment: {Config.FLASK_ENV}")
    logger.info(f"Port: {Config.PORT}")
    logger.info(f"Debug mode: {Config.DEBUG}")
    
    app.run(
        host='0.0.0.0',
        port=Config.PORT,
        debug=Config.DEBUG
    )
