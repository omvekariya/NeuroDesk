"""
Main assignment service - Step 1: Extract skills from ticket using provided skills list
"""
from datetime import datetime
import logging
import time
import requests
from typing import Dict, Any, Optional, List, Tuple
from langchain_openai import ChatOpenAI
from models.ticket import Ticket, TicketAssignmentResponse, SkillScoreSimple
from models.skill import Skill
from models.technician import AvailabilityStatus, SkillLevel, SkillObject, Technician
from services.skill_extraction import SkillExtractionService
from services.technician_selection import TechnicianSelectionService
from config.settings import Config

logger = logging.getLogger(__name__)

class AssignmentService:
    """Main service for orchestrating ticket assignment workflow"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.skill_extraction_service = SkillExtractionService(llm)
        self.technician_selection_service = TechnicianSelectionService(llm)
        
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
        
            # Step 3: Extract skills from ticket using available skills list & LLM
            extracted_skill_names = self._extract_skills_from_ticket(ticket, available_skills)

            print("\n\n\texisting_extracted_skills", extracted_skill_names)
            
            # Step 4: Convert skill names to SkillScoreSimple objects
            existing_extracted_skills = self._get_skill_objects(extracted_skill_names["existing_skills"], available_skills)

            # Step 5: Get technicians that match the extracted skills from backend
            technicians = self._get_technicians(existing_extracted_skills)

            if len(technicians) == 0:
                technicians = self._get_technicians(existing_extracted_skills, by_skills=False)
            
            print("\n\n\texisting_extracted_skills", len(technicians))

            # Step 6: Select the best technician based on the extracted skills
            selected_technician, justification = self._select_best_technician(technicians, existing_extracted_skills, ticket)

            # Step 7: Return the result
            return TicketAssignmentResponse(
                success=True,
                selected_technician_id=selected_technician.id,
                justification=justification,
                error_message=None,
            )
            
        except Exception as e:
            logger.error(f"Error in ticket assignment process: {str(e)}")
            return TicketAssignmentResponse(
                success=False,
                selected_technician_id=None,
                justification=None,
                error_message=str(e),
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
    
    def _extract_skills_from_ticket(self, ticket: Ticket, available_skills: List[str]) -> Dict[str,Any]:
        """
        Extract skills from ticket using the skill extraction service
        
        Args:
            ticket: Ticket object
            available_skills: List of available skill names to choose from
            
        Returns:
            Dict[str,Any] containing the extracted skill names and the new skills
        """
        try:
            logger.info("Starting skill extraction (Step 1)")

            available_skills_text = [skill.name for skill in available_skills]
            
            # Extract skills using LLM with available skills list
            extracted_skills = self.skill_extraction_service.extract_skills_from_ticket(ticket, available_skills_text)
            
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
            for skill_data in skills_data["data"]["skills"]:
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
   
    def _get_technicians(self, extracted_skills: List[Skill], by_skills: bool = True) -> List[Technician]:
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
            
            if not skill_ids and by_skills:
                logger.warning("No valid skill IDs found for technician search")
                return []
            
            logger.info(f"Searching for technicians with skills: {skill_ids}")
            
            # Use the technicians by-skills endpoint

            if by_skills:

                technicians_url = f"{Config.BACKEND_SERVER_URL}/api/v1/technicians/by-skills"
            
                # Prepare query parameters
                params = {
                    'skills': skill_ids,  # API accepts array of skill IDs
                }
            
                response = requests.get(technicians_url, params=params, timeout=10)
                response.raise_for_status()
                
            else:
                # Prepare query parameters
                technicians_url = f"{Config.BACKEND_SERVER_URL}/api/v1/technicians/all"

                response = requests.get(technicians_url, timeout=10)
                response.raise_for_status()
            

            response_data = response.json()
            
            if not response_data.get('success'):
                raise Exception(f"Backend returned error: {response_data.get('message', 'Unknown error')}")
            
            # Extract technicians from the response structure
            technicians_data = response_data.get('data', {}).get('technicians', [])

            logger.info(f"Total technicians fetched: {len(technicians_data)}")
            
            # Convert response data to Technician objects
            technicians = []
            for tech_data in technicians_data:
                try:
                    # Parse skills data - convert to SkillObject format
                    skills = []
                    if tech_data.get('skills'):
                        for skill_data in tech_data['skills']:
                            if isinstance(skill_data, dict) and 'id' in skill_data:
                                skill_obj = SkillObject(
                                    id=skill_data.get('id'),
                                    percentage=skill_data.get('percentage', 0)
                                )
                                skills.append(skill_obj)
                    
                    # Parse assigned tickets (should be array of integers)
                    assigned_tickets = tech_data.get('assigned_tickets', [])
                    if not isinstance(assigned_tickets, list):
                        assigned_tickets = []
                    
                    # Parse timestamps
                    created_at = None
                    updated_at = None
                    
                    if tech_data.get('created_at'):
                        try:
                            created_at = datetime.fromisoformat(tech_data['created_at'].replace('Z', '+00:00'))
                        except (ValueError, AttributeError):
                            created_at = datetime.now()
                    else:
                        created_at = datetime.now()
                    
                    if tech_data.get('updated_at'):
                        try:
                            updated_at = datetime.fromisoformat(tech_data['updated_at'].replace('Z', '+00:00'))
                        except (ValueError, AttributeError):
                            updated_at = datetime.now()
                    else:
                        updated_at = datetime.now()
                    
                    # Create Technician object with proper field mapping
                    technician = Technician(
                        id=tech_data.get('id'),
                        name=tech_data.get('name'),
                        user_id=tech_data.get('user_id'),
                        assigned_tickets_total=tech_data.get('assigned_tickets_total', 0),
                        assigned_tickets=assigned_tickets,
                        skills=skills,
                        workload=tech_data.get('workload', 0),
                        availability_status=tech_data.get('availability_status', AvailabilityStatus.AVAILABLE),
                        skill_level=tech_data.get('skill_level', SkillLevel.JUNIOR),
                        specialization=tech_data.get('specialization'),
                        is_active=tech_data.get('is_active', True),
                        created_at=created_at,
                        updated_at=updated_at
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
        
    def _select_best_technician(self, technicians: List[Technician], extracted_skills: List[Skill], ticket: Ticket) -> Tuple[Optional[Technician], Optional[str]]:
        """
        Select the best technician based on the extracted skills
        """

        selected_technician, justification = self.technician_selection_service.select_technician_for_ticket(ticket, technicians, extracted_skills)

        if selected_technician:
            return selected_technician, justification
        else:
            return None, None

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
            required_fields = ["ticket"]
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
            
        except Exception as e:
            validation_result["valid"] = False
            validation_result["errors"].append(f"Validation error: {str(e)}")
        
        return validation_result 