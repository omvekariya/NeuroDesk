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
                - Output the result as a valid JSON object with the key `skills` containing an array of matched skills.
                - Do NOT include any explanations or text outside of the JSON.

                **Skill Selection Rules**:
                - Select from the provided list of available skills if relevant or near to relevant skills are present in available skills.
                - If No skill relevant to the ticket is present in available skills, then create new skill/skill(s).
                - If multiple skills are relevant to the ticket, then return all the skills that are relevant to the ticket.
                - Create at max 3 new skills if needed. Try to create minimum number of new skills.
                - Skills should be at max 2-3 words long. keeps the skill names crisp and concise.

                ---

                **Output Format**:
                {{
                    "skills": [
                        {{
                            "name": "<new_skill_name>",
                            "description": "<new_skill_description>",
                            "is_new": true
                        }},
                        {{
                            "name": "<existing_skill_name>",
                            "description": "",
                            "is_new": false
                        }}
                    ]
                }}

            """,
            input_variables=["subject", "description", "tags", "available_skills"]
        )
    
    def extract_skills_from_ticket(self, ticket: Ticket, available_skills: List[str]) -> Dict[str, Any]:
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
            
            # Validate and categorize skills
            existing_skills = []
            new_skills = []
            all_skills = []
            
            for skill_obj in skills:
                # Validate skill object structure
                if not isinstance(skill_obj, dict):
                    logger.warning(f"Invalid skill object format: {skill_obj}")
                    continue
                
                if 'name' not in skill_obj or 'is_new' not in skill_obj:
                    logger.warning(f"Skill object missing required fields: {skill_obj}")
                    continue
                
                skill_name = skill_obj['name']
                is_new = skill_obj.get('is_new', False)
                description = skill_obj.get('description', '')
                
                # Validate skill object
                validated_skill = {
                    'name': skill_name,
                    'description': description,
                    'is_new': is_new
                }
                
                all_skills.append(validated_skill)
                
                if is_new:
                    # New skill
                    if not description:
                        logger.warning(f"New skill '{skill_name}' missing description")
                    new_skills.append({
                        'name': skill_name,
                        'description': description
                    })
                    logger.debug(f"  - NEW: {skill_name} - {description}")
                else:
                    # Existing skill - validate it exists in available skills
                    if skill_name in available_skills:
                        existing_skills.append(skill_name)
                        logger.debug(f"  - EXISTING: {skill_name}")
                    else:
                        logger.warning(f"LLM marked skill '{skill_name}' as existing but it's not in available skills list")
                        # Treat as new skill
                        new_skills.append({
                            'name': skill_name,
                            'description': description or f"Auto-generated skill for {skill_name}"
                        })
                        # Update the skill object
                        validated_skill['is_new'] = True
                        validated_skill['description'] = description or f"Auto-generated skill for {skill_name}"
            
            # Validate new skills count
            if len(new_skills) > 3:
                logger.warning(f"LLM created {len(new_skills)} new skills, exceeding limit of 3")
                new_skills = new_skills[:3]  # Keep only first 3
                # Update all_skills to reflect this limit
                all_skills = [skill for skill in all_skills if not skill['is_new'] or skill['name'] in [s['name'] for s in new_skills]]
            
            result = {
                'existing_skills': existing_skills,
                'new_skills': new_skills,
                'all_skills': all_skills
            }
            
            logger.info(f"Successfully extracted {len(existing_skills)} existing and {len(new_skills)} new skills from ticket")
            
            return result
            
        except Exception as e:
            logger.error(f"Error extracting skills from ticket: {str(e)}")
            raise
    
    def     validate_extracted_skills(self, extraction_result: Dict[str, Any], available_skills: List[str]) -> bool:
        """
        Validate extracted skills result
        
        Args:
            extraction_result: Result from extract_skills_from_ticket
            available_skills: List of available skill names
            
        Returns:
            True if the extraction result is valid, False otherwise
        """
        try:
            existing_skills = extraction_result.get('existing_skills', [])
            new_skills = extraction_result.get('new_skills', [])
            all_skills = extraction_result.get('all_skills', [])
            
            if not existing_skills and not new_skills:
                logger.warning("No skills extracted from ticket")
                return False
            
            # Validate existing skills
            for skill_name in existing_skills:
                if skill_name not in available_skills:
                    logger.warning(f"Invalid existing skill name: '{skill_name}' not in available skills")
                    return False
            
            # Validate new skills structure
            for new_skill in new_skills:
                if not isinstance(new_skill, dict):
                    logger.warning(f"Invalid new skill format: {new_skill}")
                    return False
                
                if 'name' not in new_skill:
                    logger.warning(f"New skill missing 'name' field: {new_skill}")
                    return False
                
                # Check skill name length (should be 2-3 words)
                skill_name = new_skill['name']
                word_count = len(skill_name.split())
                if word_count > 3:
                    logger.warning(f"New skill name '{skill_name}' has {word_count} words, exceeds 3-word limit")
            
            # Validate new skills count
            if len(new_skills) > 3:
                logger.warning(f"Too many new skills created: {len(new_skills)} (max 3)")
                return False
            
            logger.info("Skills validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Error validating extracted skills: {str(e)}")
            return False
    
    def get_skill_names_only(self, extraction_result: Dict[str, Any]) -> List[str]:
        """
        Helper method to get just the skill names from extraction result
        
        Args:
            extraction_result: Result from extract_skills_from_ticket
            
        Returns:
            List of all skill names (both existing and new)
        """
        skill_names = []
        skill_names.extend(extraction_result.get('existing_skills', []))
        skill_names.extend([skill['name'] for skill in extraction_result.get('new_skills', [])])
        return skill_names