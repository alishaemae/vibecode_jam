"""
Task generation service using Scibox LLM
"""

import json
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class TaskGenerator:
    """Generate coding interview tasks using Scibox LLM"""

    def __init__(self, client):
        """
        Initialize task generator

        Args:
            client: SciboxClient instance
        """
        self.client = client

    async def generate_task(
        self,
        level: str,  # "junior", "middle", "senior"
        domain: str,  # "algorithms", "backend", "frontend"
        previous_score: Optional[float] = None
    ) -> Dict:
        """
        Generate a coding interview task

        Args:
            level: Difficulty level (junior/middle/senior)
            domain: Programming domain (algorithms/backend/frontend)
            previous_score: Previous candidate score for adaptation

        Returns:
            Dict with task details
        """
        system_prompt = """You are an experienced technical interviewer.
Generate coding interview tasks.
Always respond in JSON format.
Ensure tasks are solvable in 10-15 minutes."""

        adaptation = ""
        if previous_score is not None:
            if previous_score >= 85:
                adaptation = "Significantly increase complexity."
            elif previous_score < 50:
                adaptation = "Decrease complexity."
            else:
                adaptation = "Maintain similar difficulty level."

        user_prompt = f"""Generate a coding interview task with these specifications:

Level: {level}
Domain: {domain}
{adaptation}

Requirements:
- Solvable in 10-15 minutes
- Include 3 example test cases with explanations
- Include 5 hidden test cases for evaluation
- Clear input/output format
- Should test problem-solving ability and code quality

Respond with ONLY valid JSON in this exact format:
{{
    "title": "Task Title",
    "description": "Detailed problem description",
    "input_format": "Format description for input",
    "output_format": "Format description for output",
    "constraints": ["Constraint 1", "Constraint 2"],
    "examples": [
        {{"input": "example input", "output": "example output", "explanation": "why this output"}}
    ],
    "hidden_tests": [
        {{"input": "test input", "output": "expected output", "edge_case_type": "type of edge case"}}
    ],
    "time_limit": "2s",
    "memory_limit": "256MB"
}}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.client.chat_completion(
                model="qwen3-32b-awq",
                messages=messages,
                temperature=0.8,  # Higher for variety
                max_tokens=2000
            )

            # Extract content
            content = response['choices'][0]['message']['content']

            # Remove markdown if present
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif content.startswith('```'):
                content = content[3:content.rfind('```')]

            # Parse JSON
            task_data = json.loads(content.strip())

            logger.info(f"Generated task: {task_data.get('title', 'Unknown')}")
            return task_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse task JSON: {e}")
            raise Exception(f"Invalid JSON response from Scibox: {e}")
        except Exception as e:
            logger.error(f"Task generation error: {e}")
            raise

    async def adapt_task(
        self,
        original_task: Dict,
        candidate_score: float
    ) -> Dict:
        """
        Adapt existing task based on candidate performance

        Args:
            original_task: Original task dict
            candidate_score: Candidate's score on previous task

        Returns:
            Adapted task
        """
        if candidate_score >= 90:
            level_adjustment = "significantly harder"
        elif candidate_score >= 70:
            level_adjustment = "slightly harder"
        elif candidate_score >= 50:
            level_adjustment = "at the same difficulty"
        else:
            level_adjustment = "easier"

        system_prompt = "You are an expert in adaptive interviewing. Modify tasks based on performance."

        user_prompt = f"""The candidate scored {candidate_score}/100 on this task:

Title: {original_task.get('title', 'Unknown')}
Description: {original_task.get('description', '')}

Generate a {level_adjustment} task in the same domain.
Keep the same JSON format as before.
Ensure new task doesn't repeat the previous one."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.client.chat_completion(
                model="qwen3-32b-awq",
                messages=messages,
                temperature=0.8,
                max_tokens=2000
            )

            content = response['choices'][0]['message']['content']

            # Clean JSON
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif content.startswith('```'):
                content = content[3:content.rfind('```')]

            task_data = json.loads(content.strip())
            logger.info(f"Adapted task: {task_data.get('title', 'Unknown')}")
            return task_data

        except Exception as e:
            logger.error(f"Task adaptation error: {e}")
            raise
