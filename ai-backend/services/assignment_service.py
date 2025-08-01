"""
Main assignment service - Step 1: Extract skills from ticket using provided skills list
"""
import logging
import time
import requests
from typing import Dict, Any, Optional, List
from langchain_openai import ChatOpenAI
from models.ticket import Ticket, TicketAssignmentResponse, SkillScoreSimple
from models.skill import Skill
from models.technician import Technician
from services.skill_extraction import SkillExtractionService
from config.settings import Config

logger = logging.getLogger(__name__)

class AssignmentService:
    """Main service for orchestrating ticket assignment workflow"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.skill_extraction_service = SkillExtractionService(llm)
        
    def process_ticket_assignment(self, request_data: Dict[str, Any]) -> TicketAssignmentResponse:
        """
        Process ticket assignment - Step 1: Extract skills from ticket
        
        Args:
            request_data: Dictionary containing ticket and skills information
            
        Returns:
            TicketAssignmentResponse with the extracted skills
        """
        
        try:    
            logger.info("Starting ticket assignment process - Step 1")
            
            # Step 1: Extract and validate ticket data
            ticket = self._extract_and_validate_ticket(request_data)
            
            # Step 2: Get available skills from backend
            available_skills = self._get_available_skills()

            print("\n\n\tavailable_skills", available_skills)
        
            # Step 3: Extract skills from ticket using available skills list & LLM
            extracted_skill_names = self._extract_skills_from_ticket(ticket, available_skills)
            
            # Step 4: Convert skill names to SkillScoreSimple objects
            extracted_skills = self._get_skill_objects(extracted_skill_names, available_skills)

            print("\n\n\textracted_skill_names", extracted_skill_names)

            # Step 5: Get technicians that match the extracted skills from backend
            technicians = self._get_technicians(extracted_skills)

            print("\n\n\textracted_skills", extracted_skills)

            # Step 6: Select the best technician based on the extracted skills
            selected_technician = self._select_best_technician(technicians, extracted_skills)

            print("\n\n\tselected_technician", selected_technician)

            # Step 7: Return the result
            return TicketAssignmentResponse(
                success=True,
                selected_technician_id=None,  # Will be implemented in next steps
                confidence_score=None,        # Will be implemented in next steps
                reasoning="Skills extracted successfully using provided skills list. Technician selection pending implementation.",
                extracted_skills=extracted_skills,
                error_message=None,
                assignment_timestamp=None,
            )
            
        except Exception as e:
            logger.error(f"Error in ticket assignment process: {str(e)}")
            return TicketAssignmentResponse(
                success=False,
                selected_technician_id=None,
                confidence_score=None,
                reasoning=None,
                extracted_skills=None,
                error_message=str(e),
                assignment_timestamp=None,
            )
    
    def _extract_and_validate_ticket(self, request_data: Dict[str, Any]) -> Ticket:
        """
        Extract and validate ticket data from request
        
        Args:
            request_data: Raw request data
            
        Returns:
            Validated Ticket object
        """
        try:
            # Check if ticket data exists
            if 'ticket' not in request_data:
                raise ValueError("Missing 'ticket' field in request")
            
            ticket_data = request_data['ticket']
            
            # Validate required fields
            required_fields = ["subject", "description", "requester_id"]
            missing_fields = [field for field in required_fields if field not in ticket_data]
            
            if missing_fields:
                raise ValueError(f"Missing required ticket fields: {missing_fields}")
            
            # Validate subject length
            subject = ticket_data.get("subject", "")
            if len(subject) < 5 or len(subject) > 500:
                raise ValueError("Subject must be between 5 and 500 characters")
            
            # Validate description
            description = ticket_data.get("description", "")
            if not description.strip():
                raise ValueError("Description cannot be empty")
            
            # Validate requester_id
            requester_id = ticket_data.get("requester_id")
            if not isinstance(requester_id, int) or requester_id <= 0:
                raise ValueError("requester_id must be a positive integer")
            
            # Create ticket object with defaults for optional fields
            ticket = Ticket(
                subject=ticket_data["subject"],
                description=ticket_data["description"],
                requester_id=ticket_data["requester_id"],
                priority=ticket_data.get("priority", "normal"),
                impact=ticket_data.get("impact", "medium"),
                urgency=ticket_data.get("urgency", "normal"),
                complexity_level=ticket_data.get("complexity_level", "level_1"),
                tags=ticket_data.get("tags", [])
            )
            
            logger.info(f"Created ticket object: {ticket.subject}")
            return ticket
            
        except Exception as e:
            logger.error(f"Error creating ticket object: {str(e)}")
            raise
    
    def _extract_and_validate_skills(self, request_data: Dict[str, Any]) -> List[str]:
        """
        Extract and validate skills list from request
        
        Args:
            request_data: Raw request data
            
        Returns:
            List of validated skill names
        """
        try:
            # Check if skills data exists
            if 'skills' not in request_data:
                raise ValueError("Missing 'skills' field in request")
            
            skills_data = request_data['skills']
            
            # Validate that skills is a list
            if not isinstance(skills_data, list):
                raise ValueError("'skills' must be a list")
            
            # Validate each skill name
            valid_skills = []
            for skill in skills_data:
                if not isinstance(skill, str):
                    logger.warning(f"Skipping non-string skill: {skill}")
                    continue
                
                skill_name = skill.strip()
                if len(skill_name) < 2:
                    logger.warning(f"Skipping skill with invalid length: {skill}")
                    continue
                
                valid_skills.append(skill_name)
            
            if not valid_skills:
                raise ValueError("No valid skills provided")
            
            logger.info(f"Validated {len(valid_skills)} skills")
            return valid_skills
            
        except Exception as e:
            logger.error(f"Error validating skills: {str(e)}")
            raise
    
    def _extract_skills_from_ticket(self, ticket: Ticket, available_skills: List[str]) -> List[str]:
        """
        Extract skills from ticket using the skill extraction service
        
        Args:
            ticket: Ticket object
            available_skills: List of available skill names to choose from
            
        Returns:
            List of extracted skill names
        """
        try:
            logger.info("Starting skill extraction (Step 1)")

            available_skills_text = [skill.name for skill in available_skills]
            
            # Extract skills using LLM with available skills list
            extracted_skills = self.skill_extraction_service.extract_skills_from_ticket(ticket, available_skills_text)
            
            # Validate extracted skills
            if not self.skill_extraction_service.validate_extracted_skills(extracted_skills, available_skills_text):
                raise ValueError("Skill extraction validation failed")
            
            logger.info(f"Successfully extracted {len(extracted_skills)} skills from ticket")
            return extracted_skills
            
        except Exception as e:
            logger.error(f"Error in skill extraction: {str(e)}")
            raise

    def _get_available_skills(self) -> List[Skill]:
        """
        Get available skills from the backend server
        
        Returns:
            List of Skill objects from the backend
        """
        try:
            logger.info(f"Fetching available skills from: {Config.SKILLS_API_URL}")
            
            response = requests.get(Config.SKILLS_API_URL, timeout=10)

            response.raise_for_status()
            
            skills_data = response.json()
            
            # Convert response data to Skill objects
            skills = []
            for skill_data in skills_data:
                try:
                    skill = Skill(**skill_data)
                    skills.append(skill)
                except Exception as e:
                    logger.warning(f"Failed to parse skill data: {skill_data}, error: {str(e)}")
                    continue
            
            logger.info(f"Successfully fetched {len(skills)} skills from backend")
            return skills
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch skills from backend: {str(e)}")
            raise Exception(f"Backend server unavailable: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing skills response: {str(e)}")
            raise
    
    def _get_skill_objects(self, skill_names: List[str], available_skills: List[Skill]) -> List[Skill]:
        """
        Get skill objects from available skills that match the given skill names
        
        Args:
            skill_names: List of skill names to filter by
            available_skills: List of available Skill objects to filter from
            
        Returns:
            List of Skill objects that match the given skill names
        """
        try:
            # Create a set of skill names for faster lookup (case-insensitive)
            target_names = {name.lower().strip() for name in skill_names}
            
            # Filter available skills to only those that match the target names
            filtered_skills = [
                skill for skill in available_skills 
                if skill.name.lower().strip() in target_names
            ]
            
            logger.info(f"Found {len(filtered_skills)} matching skills out of {len(available_skills)} available skills")
            return filtered_skills
            
        except Exception as e:
            logger.error(f"Error filtering skill objects: {str(e)}")
            raise
   
    def _get_technicians(self, extracted_skills: List[Skill]) -> List[Technician]:
        """
        Get technicians that match the extracted skills from the backend server
        
        Args:
            extracted_skills: List of Skill objects representing extracted skills
            
        Returns:
            List of Technician objects that match the skills
        """
        try:
            # Extract skill IDs for the search
            skill_ids = [skill.id for skill in extracted_skills if skill.id is not None]
            
            if not skill_ids:
                logger.warning("No valid skill IDs found for technician search")
                return []
            
            logger.info(f"Searching for technicians with skills: {skill_ids}")
            
            # Use the technicians by-skills endpoint
            technicians_url = f"{Config.BACKEND_SERVER_URL}/api/v1/technicians/by-skills"
            
            # Prepare query parameters
            params = {
                'skills': skill_ids,  # API accepts array of skill IDs
                'limit': 10  # Limit results to top 10 technicians
            }
            
            response = requests.get(technicians_url, params=params, timeout=10)
            response.raise_for_status()
            
            response_data = response.json()
            
            if not response_data.get('success'):
                raise Exception(f"Backend returned error: {response_data.get('message', 'Unknown error')}")
            
            # Extract technicians from the response structure
            technicians_data = response_data.get('data', {}).get('technicians', [])
            
            # Convert response data to Technician objects
            technicians = []
            for tech_data in technicians_data:
                try:
                    # Extract skills from the technician data
                    skills = []
                    if tech_data.get('skills'):
                        skills = [str(skill.get('id', '')) for skill in tech_data['skills']]
                    
                    technician = Technician(
                        id=tech_data.get('id'),
                        name=tech_data.get('name'),
                        user_id=tech_data.get('user_id'),
                        skills=skills,
                        availability=tech_data.get('availability_status', 'available'),
                        rating=4.0,  # Default rating since it's not in the response
                        experience_years=2,  # Default experience
                        complexity_level='level_2',  # Default complexity
                        current_workload=tech_data.get('workload', 0)
                    )
                    technicians.append(technician)
                except Exception as e:
                    logger.warning(f"Failed to parse technician data: {tech_data}, error: {str(e)}")
                    continue
            
            logger.info(f"Successfully fetched {len(technicians)} technicians from backend")
            return technicians
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch technicians from backend: {str(e)}")
            raise Exception(f"Backend server unavailable: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing technicians response: {str(e)}")
            raise

    def get_assignment_status(self) -> Dict[str, Any]:
        """
        Get the current status of the assignment service
        
        Returns:
            Dictionary with service status information
        """
        return {
            "service": "AssignmentService",
            "status": "active",
            "implemented_flows": ["skill_extraction_step1"],
            "pending_flows": ["technician_matching", "technician_selection"],
            "llm_available": self.llm is not None,
            "required_request_fields": ["ticket", "skills"],
            "step1_description": "Extract skills from ticket using provided skills list"
        }
    
    def validate_request_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate request data before processing
        
        Args:
            request_data: Raw request data
            
        Returns:
            Dictionary with validation results
        """
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        try:
            # Check required top-level fields
            required_fields = ["ticket", "skills"]
            for field in required_fields:
                if field not in request_data:
                    validation_result["valid"] = False
                    validation_result["errors"].append(f"Missing required field: {field}")
            
            # Validate ticket data if present
            if "ticket" in request_data:
                ticket_data = request_data["ticket"]
                required_ticket_fields = ["subject", "description", "requester_id"]
                
                for field in required_ticket_fields:
                    if field not in ticket_data:
                        validation_result["valid"] = False
                        validation_result["errors"].append(f"Missing required ticket field: {field}")
                
                # Check subject length
                if "subject" in ticket_data:
                    subject = ticket_data["subject"]
                    if len(subject) < 5:
                        validation_result["valid"] = False
                        validation_result["errors"].append("Subject must be at least 5 characters")
                    elif len(subject) > 500:
                        validation_result["valid"] = False
                        validation_result["errors"].append("Subject must be at most 500 characters")
                
                # Check description
                if "description" in ticket_data and not ticket_data["description"].strip():
                    validation_result["valid"] = False
                    validation_result["errors"].append("Description cannot be empty")
                
                # Check requester_id
                if "requester_id" in ticket_data:
                    try:
                        requester_id = int(ticket_data["requester_id"])
                        if requester_id <= 0:
                            validation_result["valid"] = False
                            validation_result["errors"].append("requester_id must be a positive integer")
                    except (ValueError, TypeError):
                        validation_result["valid"] = False
                        validation_result["errors"].append("requester_id must be a valid integer")
            
            # Validate skills data if present
            if "skills" in request_data:
                skills_data = request_data["skills"]
                if not isinstance(skills_data, list):
                    validation_result["valid"] = False
                    validation_result["errors"].append("'skills' must be a list")
                elif len(skills_data) == 0:
                    validation_result["warnings"].append("Skills list is empty")
            
        except Exception as e:
            validation_result["valid"] = False
            validation_result["errors"].append(f"Validation error: {str(e)}")
        
        return validation_result 