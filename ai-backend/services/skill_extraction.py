"""
Skill extraction service - Step 1: Extract skills from ticket using provided skills list
"""
import json
import logging
from typing import List, Dict, Any
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from models.ticket import Ticket
from models.skill import Skill
from config.settings import Config

logger = logging.getLogger(__name__)

class SkillExtractionService:
    """Service for extracting skills from ticket information using LLM"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.json_parser = JsonOutputParser()
        self._setup_prompts()
    
    def _setup_prompts(self):
        """Setup the skill extraction prompt template"""
        self.skill_extraction_prompt = PromptTemplate(
            template="""You are a service desk assistant designed to analyze incoming support tickets and identify the relevant **technical skills** needed to resolve them.

                You will be provided:
                1. A support ticket with subject, description, and tags
                2. A list of available skills (from which you must choose)

                ---

                **Ticket Details**
                - **Subject**: {subject}
                - **Description**: {description}
                - **Tags**: {tags}

                ---

                **Available Skills**:  
                {available_skills}

                ---

                **Instructions**:
                - Analyze the subject and description to identify which skills are needed.
                - Select only from the provided list of available skills.
                - Output the result as a valid JSON object with the key `skills` containing an array of matched skills.
                - Do NOT include any explanations or text outside of the JSON.

                ---

                **Output Format**:
                {{
                    "skills": ["<skill_1>", "<skill_2>", ...]
                }}
            """,
            input_variables=["subject", "description", "tags", "available_skills"]
        )
    
    def extract_skills_from_ticket(self, ticket: Ticket, available_skills: List[str]) -> List[str]:
        """
        Extract relevant skills from ticket using LLM
        
        Args:
            ticket: Ticket object containing the issue information
            available_skills: List of available skill names to choose from
            
        Returns:
            List of skill names that match the ticket requirements
        """

        try:
            logger.info(f"Extracting skills from ticket: {ticket.subject}")
            
            # Format tags for prompt
            tags_text = ", ".join(ticket.tags) if ticket.tags else "None"
            
            # Format available skills for prompt
            available_skills_text = "\n".join([f"- {skill}" for skill in available_skills])
            
            # Create the prompt with ticket data and available skills
            prompt = self.skill_extraction_prompt.format(
                subject=ticket.subject,
                description=ticket.description,
                tags=tags_text,
                available_skills=available_skills_text
            )
            
            # Get LLM response
            logger.debug("Sending prompt to LLM for skill extraction")
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
            
            # Extract skills from response
            if 'skills' not in result_data:
                logger.error(f"Response missing 'skills' key: {result_data}")
                raise ValueError("LLM response missing 'skills' key")
            
            skills = result_data['skills']
            
            # Validate that all returned skills exist in available skills
            valid_skills = []
            
            for skill_name in skills:
                if skill_name in available_skills:
                    valid_skills.append(skill_name)
                else:
                    logger.warning(f"LLM returned skill '{skill_name}' not in available skills list")
            
            logger.info(f"Successfully extracted {len(valid_skills)} skills from ticket")
            for skill in valid_skills:
                logger.debug(f"  - {skill}")
            
            return valid_skills
            
        except Exception as e:
            logger.error(f"Error extracting skills from ticket: {str(e)}")
            raise
    
    def validate_extracted_skills(self, extracted_skills: List[str], available_skills: List[str]) -> bool:
        """
        Validate extracted skills against available skills
        
        Args:
            extracted_skills: List of extracted skill names
            available_skills: List of available skill names
            
        Returns:
            True if all extracted skills are valid, False otherwise
        """
        if not extracted_skills:
            logger.warning("No skills extracted from ticket")
            return False
        
        for skill_name in extracted_skills:
            if skill_name not in available_skills:
                logger.warning(f"Invalid skill name: '{skill_name}' not in available skills")
                return False
        
        logger.info("Skills validation passed")
        return True 