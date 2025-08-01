# NeuroDesk LLM Wrapper API

A Flask-based wrapper for LLM interaction tasks using Langchain, specifically designed for ticket assignment workflows.

## Project Structure

```
ai-backend/
├── config/
│   ├── __init__.py
│   └── settings.py          # Application configuration
├── models/
│   ├── __init__.py
│   └── ticket.py            # Data models (Ticket, SkillScore, Technician)
├── services/
│   ├── __init__.py
│   ├── assignment_service.py # Main orchestration service
│   └── skill_extraction.py  # First flow: Skill extraction service
├── utils/                   # Utility functions (future)
├── tests/                   # Test files (future)
├── app.py                   # Main Flask application
├── test_first_flow.py       # Test script for first flow
├── requirements.txt          # Python dependencies
├── env.example              # Environment variables template
└── readme.md               # This file
```

## Setup Instructions

1. **Navigate to the ai-backend directory**
   ```bash
   cd ai-backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### 1. Health Check
- **GET** `/health`
- Returns application status and LLM availability

### 2. Service Status
- **GET** `/api/service-status`
- Returns current implementation status of workflows

### 3. Ticket Assignment (First Flow Implemented)
- **POST** `/api/ticket-assignment`
- Main endpoint for processing ticket assignments

#### Request Format
```json
{
  "subject": "Network connectivity issues affecting multiple users",
  "description": "Users unable to connect to corporate network. VPN connection failing and users cannot access shared drives.",
  "requester_id": 101,
  "priority": "high",
  "impact": "high",
  "urgency": "high",
  "complexity_level": "level_2",
  "tags": ["network", "vpn", "connectivity"]
}
```

#### Required Fields
- `subject`: string (5-500 characters)
- `description`: string (non-empty)
- `requester_id`: integer (positive)

#### Optional Fields
- `priority`: "low", "normal", "high", "critical" (default: "normal")
- `impact`: "low", "medium", "high", "critical" (default: "medium")
- `urgency`: "low", "normal", "high", "critical" (default: "normal")
- `complexity_level`: "level_1", "level_2", "level_3" (default: "level_1")
- `tags`: array of strings (default: [])

#### Response Format (Current - First Flow)
```json
{
  "success": true,
  "selected_technician_id": null,
  "confidence_score": null,
  "reasoning": "Skills extracted successfully. Technician selection pending implementation.",
  "extracted_skills": [
    {
      "skill": "Network Troubleshooting",
      "score": 0.9
    },
    {
      "skill": "VPN Configuration",
      "score": 0.8
    }
  ],
  "error_message": null,
  "assignment_timestamp": "2024-01-15T10:30:00Z",
  "processing_time_ms": 1250
}
```

## Workflow Implementation Status

### ✅ Implemented (First Flow)
1. **Skill Extraction**: LLM analyzes the ticket and extracts relevant technical skills with relevance scores
   - Considers priority, impact, urgency, and complexity levels
   - Uses tags for additional context
   - Assigns relevance scores (0.0 to 1.0)

### 🔄 Pending Implementation
2. **Technician Matching**: API call to find technicians with matching skills
3. **Technician Selection**: LLM selects the best technician based on skills, availability, and rating

## Testing

### Test the First Flow
```bash
python test_first_flow.py
```

This will test:
- Service status endpoint
- Ticket validation endpoint
- Skill extraction from various ticket types
- Response validation

## Configuration

Key environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-3.5-turbo)
- `OPENAI_TEMPERATURE`: Model temperature (default: 0.7)
- `TECHNICIAN_API_URL`: URL for the technician search API (defaults to mock data)
- `PORT`: Application port (default: 5000)
- `FLASK_ENV`: Flask environment (development/production)
- `LOG_LEVEL`: Logging level (default: INFO)

## Database Schema Alignment

The ticket model has been updated to match the actual database schema:

### Core Fields
- `id`: Auto-incrementing primary key
- `subject`: Ticket title (5-500 characters)
- `description`: Detailed description
- `status`: Ticket status (new, assigned, in_progress, etc.)
- `requester_id`: ID of the user who created the ticket

### Priority & Impact
- `priority`: low, normal, high, critical
- `impact`: low, medium, high, critical
- `urgency`: low, normal, high, critical
- `complexity_level`: level_1, level_2, level_3

### SLA & Timing
- `sla_violated`: Boolean flag
- `resolution_due`: Target resolution date
- `resolution_date`: Actual resolution date
- `first_response_time`: Response time in minutes
- `resolution_time`: Resolution time in minutes

### Additional Fields
- `tags`: Array of categorization tags
- `required_skills`: JSON array of required skills
- `work_logs`: JSON array of work activities
- `audit_trail`: JSON array of audit entries
- `attachments`: JSON array of file attachments

## Development

### Current Implementation
- **First Flow**: Skill extraction from tickets using LLM
- **Validation**: Comprehensive input validation and error handling
- **Logging**: Detailed logging for debugging and monitoring
- **Configuration**: Centralized configuration management
- **Database Alignment**: Models match actual database schema

### Next Steps
1. Implement technician matching service (Step 2)
2. Implement technician selection service (Step 3)
3. Add comprehensive testing suite
4. Add API documentation with Swagger/OpenAPI


