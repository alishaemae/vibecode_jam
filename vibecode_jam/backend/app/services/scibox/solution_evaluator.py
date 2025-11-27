"""
Solution evaluation service using Scibox LLM
"""

import json
import logging
from typing import Dict

logger = logging.getLogger(__name__)


class SolutionEvaluator:
    """Evaluate code solutions and provide detailed feedback"""

    def __init__(self, client):
        """
        Initialize evaluator

        Args:
            client: SciboxClient instance
        """
        self.client = client

    async def evaluate_solution(
        self,
        task: Dict,
        code: str,
        test_results: Dict,
        execution_time_ms: float,
        language: str = "python"
    ) -> Dict:
        """
        Evaluate a candidate's code solution

        Args:
            task: Task dict with problem description
            code: Code submitted by candidate
            test_results: Dict with test results
            execution_time_ms: Code execution time
            language: Programming language

        Returns:
            Dict with evaluation scores and feedback
        """
        system_prompt = """You are a senior technical interviewer.
Evaluate code submissions objectively and constructively.
Consider correctness, code quality, efficiency, and style.
Always respond in JSON format."""

        test_summary = f"""Visible tests: {test_results.get('visible_passed', 0)}/{test_results.get('visible_total', 0)} passed
Hidden tests: {test_results.get('hidden_passed', 0)}/{test_results.get('hidden_total', 0)} passed
Execution time: {execution_time_ms}ms"""

        user_prompt = f"""Evaluate this {language} solution:

Problem: {task.get('title', 'Unknown')}
Description: {task.get('description', '')}

Code:
```{language}
{code}
```

Test Results:
{test_summary}

Evaluate on these criteria:
1. Correctness (0-100): Does it solve the problem correctly?
2. Code Quality (0-100): Is the code clean, readable, well-structured?
3. Efficiency (0-100): Time/space complexity, optimization
4. Edge Cases (0-100): Handles edge cases properly?

Respond with ONLY valid JSON:
{{
    "correctness_score": 0-100,
    "code_quality_score": 0-100,
    "efficiency_score": 0-100,
    "edge_cases_score": 0-100,
    "overall_score": 0-100,
    "feedback": {{
        "summary": "Brief assessment (2-3 sentences)",
        "strengths": ["Strength 1", "Strength 2"],
        "improvements": ["Improvement 1", "Improvement 2"],
        "complexity_analysis": "Time and space complexity analysis"
    }},
    "next_challenge_level": "junior/middle/senior"
}}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.client.chat_completion(
                model="qwen3-32b-awq",
                messages=messages,
                temperature=0.3,  # Lower for consistency
                max_tokens=1500
            )

            content = response['choices'][0]['message']['content']

            # Extract JSON
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]

            evaluation = json.loads(content.strip())

            logger.info(
                f"Solution evaluated - "
                f"Overall: {evaluation.get('overall_score', 0)}/100"
            )
            return evaluation

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse evaluation JSON: {e}")
            raise Exception(f"Invalid evaluation response: {e}")
        except Exception as e:
            logger.error(f"Solution evaluation error: {e}")
            raise

    async def provide_hint(
        self,
        task: Dict,
        code: str,
        language: str = "python"
    ) -> str:
        """
        Provide a hint without giving away the solution

        Args:
            task: Task dict
            code: Current code
            language: Programming language

        Returns:
            Hint text
        """
        system_prompt = """You are a helpful coding mentor.
Provide subtle hints that guide towards the solution without giving it away.
Focus on approach, not the final answer."""

        user_prompt = f"""The candidate is working on: {task.get('title', 'Unknown')}

Problem: {task.get('description', '')}

Current code:
```{language}
{code}
```

Provide a helpful hint (1-2 sentences) that points them in the right direction
without revealing the solution."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.client.chat_completion(
                model="qwen3-32b-awq",
                messages=messages,
                temperature=0.5,
                max_tokens=200
            )

            hint = response['choices'][0]['message']['content']
            logger.debug(f"Hint provided for: {task.get('title', 'Unknown')}")
            return hint

        except Exception as e:
            logger.error(f"Hint generation error: {e}")
            raise
