"""
Technician selection service - Select the best technician for a ticket based on skills and availability
"""
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from models.ticket import Ticket
from models.skill import Skill
from models.technician import Technician
from config.settings import Config

logger = logging.getLogger(__name__)

class TechnicianSelectionService:
    """Service for selecting the best technician for a ticket using LLM"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.json_parser = JsonOutputParser()
        self._setup_prompts()
    
    def _setup_prompts(self):
        """Setup the technician selection prompt template"""
        self.technician_selection_prompt = PromptTemplate(
            template="""
                LLM Prompt: The Intelligent Ticket Assignment System

                Your Role: You are an advanced AI-powered Ticket Assignment System. Your primary function is to analyze an incoming support ticket and a list of available technicians to determine the single best technician for the job. You must follow a strict set of rules to ensure efficiency, proper skill utilization, and timely resolution of issues.

                Input Data Structure:  
                You will be given two JSON objects: `technicians` and `ticket`.

                - `technicians`: An array of objects, where each object represents a technician with the following structure.
                - `ticket`: An object representing the ticket to be assigned.

                Assignment Rules & Logic:  
                You must follow these rules in order. The first rule that matches the ticket's priority dictates the assignment logic.

                **Rule 1: Critical Priority Tickets**  
                If `ticket.priority` is `"critical"`:
                - **Identify Specialists**: Immediately filter the technician list to find those whose specialization matches the core issue described in the ticket's `name` and `description`.
                - **Select the Expert**: From that filtered list, assign the ticket to a technician with a `skill_level` of `"experienced"`.
                - **Override Other Factors**: For critical tickets, ignore both `workload` and `availability_status`. The urgency of the ticket is the only thing that matters. If multiple experienced specialists exist, select the one with the lower workload.

                **Rule 2: High & Medium Priority Tickets**  
                If `ticket.priority` is `"high"` or `"medium"`:
                - **Filter by Availability**: First, filter the list to include only technicians with `availability_status` of `"available"`.
                - **Calculate Suitability Score**: For each available technician, calculate a Suitability Score using the following weighted formula:  
                `Score = (0.6 * Skill_Match_Score) + (0.4 * Workload_Score)`

                - *Skill_Match_Score* (0 to 1 scale):  
                    Count how many of the `ticket.required_skills` the technician possesses.  
                    Calculate the average percentage of those matching skills.  
                    Final `Skill_Match_Score` = (count_of_matching_skills / total_required_skills) * (average_percentage / 100).  
                    A technician who has most of the required skills with a high percentage will score the highest.

                - *Workload_Score* (0 to 1 scale):  
                    This score is inversely related to the technician's workload. A lower workload is better.  
                    Calculate it as: `1 - workload`.  
                    A technician with a workload of 0.2 gets a score of 0.8.

                - **Assign to Highest Score**: Assign the ticket to the technician with the highest final Suitability Score.

                **Rule 3: Low Priority Tickets**  
                If `ticket.priority` is `"low"`:
                - **Training Opportunity**: These tickets are ideal for skill development. You should primarily consider technicians with a `skill_level` of `"junior"` or `"mid"`.
                - **Apply Standard Scoring**: Use the same Suitability Score formula from Rule 2 to find the best fit among junior and mid-level technicians who are `"available"`. This ensures they are still qualified, but gives them the opportunity before it goes to an experienced technician.
                - **Fallback**: If no junior or mid-level technicians are available or qualified, then evaluate experienced technicians using the same scoring logic.

                Output Format:  
                Your final output must be a single JSON object containing the ID of the chosen technician and a brief, clear with detailed & pointwise justification for your choice.
                Instructions for Justification:
                - Justification must be detailed and pointwise.
                - Try to Justify the selection based on all the parameters you considered and keep it as detailed as possible. 
                - Do Not involve the meta information like the ticket ID, rule number, Skill ID, etc. in the justification. Justification must not contain any Non-interpetable things.
                - Justification must be presentable to the end-user.

                
                Example Output:
                {{
                    "selected_technician_id": 10
                    "justification": "Assigned based on Critical Priority Rule. Technician is an experienced specialist in Network Security, which matches the ticket's requirements."
                }}

                **Input:**

                Ticket Data  
                Name: {ticket_name}  
                Description: {ticket_description}  
                Priority: {ticket_priority}  

                Skills required for the ticket:  
                {required_skills}

                Technicians:  
                {available_technicians}

            """,
            input_variables=["ticket_name", "ticket_description", "ticket_priority", "available_technicians", "required_skills"]
        )
    
    def select_technician_for_ticket(self, ticket: Ticket, available_technicians: List[Technician], required_skills: List[Skill]) -> Tuple[Technician, str]:
        """
        Select the best technician for a ticket using LLM
        
        Args:
            ticket: Ticket object containing the issue information
            available_technicians: List of available Technician objects to choose from
            required_skills: List of Skill objects required for the ticket
            
        Returns:
            Selected Technician object or None if no suitable technician found
        """
        try:
            logger.info(f"Selecting technician for ticket: {ticket.subject}")
            
            # Format required skills for prompt
            required_skills_text = "\n".join([f"- {skill.name}" for skill in required_skills])
            
            # Format available technicians for prompt
            technicians_text = self._format_technicians_for_prompt(available_technicians)
            
            # Create the prompt with ticket data, technicians, and required skills
            prompt = self.technician_selection_prompt.format(
                ticket_name=ticket.subject,
                ticket_description=ticket.description,
                ticket_priority=ticket.priority,
                available_technicians=technicians_text,
                required_skills=required_skills_text
            )
            
            # Get LLM response
            logger.info("Sending prompt to LLM for technician selection")
            response = self.llm.invoke(prompt)
            
            # Parse JSON response using JsonOutputParser
            try:
                result_data = self.json_parser.parse(response.content)
            except Exception as e:
                logger.error(f"Failed to parse LLM response as JSON: {response.content}")
                # Fallback to manual JSON parsing
                try:
                    result_data = json.loads(response.content)
                except json.JSONDecodeError as json_error:
                    raise ValueError(f"Invalid JSON response from LLM: {str(json_error)}")
            
            # Extract technician selection from response
            if 'selected_technician_id' not in result_data:
                logger.error(f"Response missing 'selected_technician_id' key: {result_data}")
                raise ValueError("LLM response missing 'selected_technician_id' key")
            
            selected_technician_id = result_data['selected_technician_id']
            justification = result_data['justification']
            
            # Find the selected technician from available technicians
            selected_technician = self._find_technician_by_id(available_technicians, selected_technician_id)

            
            if selected_technician:
                logger.info(f"Successfully selected technician: {selected_technician.name} (ID: {selected_technician.id}) with justification: {justification}")
                
            else:
                logger.warning(f"LLM selected technician ID '{selected_technician_id}' not found in available technicians")
            
            return selected_technician, justification
            
        except Exception as e:
            logger.error(f"Error selecting technician for ticket: {str(e)}")
            raise
    
    def _format_technicians_for_prompt(self, technicians: List[Technician]) -> str:
        """
        Format technicians list for prompt template with relevant fields
        
        Args:
            technicians: List of Technician objects
            
        Returns:
            Formatted string representation of technicians
        """
        technician_lines = []
        for tech in technicians:
            # Basic technician info
            tech_info = f"- ID: {tech.id}, Name: {tech.name}"
            tech_info += f", Workload: {tech.workload}%"
            tech_info += f", Skill Level: {tech.skill_level}"
            tech_info += f", Availability: {tech.availability_status}"
            
            if tech.specialization:
                tech_info += f", Specialization: {tech.specialization}"
            
            # Format skills information
            if tech.skills and len(tech.skills) > 0:
                skills_info = []
                for skill in tech.skills:
                    skills_info.append(f"Skill ID {skill.id} ({skill.percentage}%)")
                tech_info += f", Skills: [{', '.join(skills_info)}]"
            else:
                tech_info += ", Skills: [No skills assigned]"
            
            # Add assigned tickets info if available
            if tech.assigned_tickets_total > 0:
                tech_info += f", Assigned Tickets: {tech.assigned_tickets_total}"
            
            technician_lines.append(tech_info)
        
        return "\n".join(technician_lines)
    
    def _find_technician_by_id(self, technicians: List[Technician], technician_id: int) -> Optional[Technician]:
        """
        Find technician by ID from the list
        
        Args:
            technicians: List of Technician objects
            technician_id: ID of the technician to find
            
        Returns:
            Technician object if found, None otherwise
        """
        for technician in technicians:
            if technician.id == technician_id:
                return technician
        return None