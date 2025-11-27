"""
Anti-cheat service using LLM for code originality check
"""

import json
import logging
from typing import Dict

logger = logging.getLogger(__name__)


class AntiCheatLLM:
    """Check code originality using LLM"""

    def __init__(self, client):
        """
        Initialize anti-cheat service

        Args:
            client: SciboxClient instance
        """
        self.client = client

    async def check_code_originality(
        self,
        code: str,
        language: str = "python",
        task_context: str = ""
    ) -> Dict:
        """
        Check if code appears to be plagiarized

        Args:
            code: Code to check
            language: Programming language
            task_context: Context about the task

        Returns:
            Dict with plagiarism assessment
        """
        system_prompt = """You are an expert code analyst.
Determine if this code was likely copied from well-known sources.
Be thorough but fair in your assessment.
Always respond in JSON format."""

        user_prompt = f"""Analyze this {language} code for originality:

```{language}
{code}
```

{f"Task context: {task_context}" if task_context else ""}

Check against:
- Common LeetCode solutions
- StackOverflow examples
- GitHub repositories
- Learning materials
- Well-known algorithms

Look for:
- Exact copies or minimal modifications
- Unusual variable naming patterns
- Copy-paste artifacts
- Overly polished code vs. coding style

Respond with ONLY valid JSON:
{{
    "similarity_score": 0-100,
    "is_suspicious": true/false,
    "likely_source": "leetcode/stackoverflow/github/original/unknown",
    "reasoning": "Detailed explanation",
    "confidence": "low/medium/high",
    "flags": ["Flag 1 if any", "Flag 2 if any"],
    "recommendation": "accept/review/reject"
}}

Scoring:
- 0-30: Appears original
- 31-60: Some similarities, likely legitimate
- 61-80: Notable similarities, review carefully
- 81-100: Very similar to known solutions"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.client.chat_completion(
                model="qwen3-coder-30b-a3b-instruct-fp8",  # Use coder model for code analysis
                messages=messages,
                temperature=0.2,  # Very low for consistency
                max_tokens=800
            )

            content = response['choices'][0]['message']['content']

            # Extract JSON
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content[content.find('```') + 3:content.rfind('```')]

            result = json.loads(content.strip())

            logger.info(
                f"Code check - "
                f"Similarity: {result.get('similarity_score', 0)}, "
                f"Suspicious: {result.get('is_suspicious', False)}"
            )
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse anti-cheat JSON: {e}")
            raise Exception(f"Invalid anti-cheat response: {e}")
        except Exception as e:
            logger.error(f"Anti-cheat check error: {e}")
            raise

    async def analyze_code_style(
        self,
        code: str,
        language: str = "python"
    ) -> Dict:
        """
        Analyze code style characteristics

        Args:
            code: Code to analyze
            language: Programming language

        Returns:
            Dict with style analysis
        """
        system_prompt = """Analyze the coding style and patterns in this code."""

        user_prompt = f"""Analyze this {language} code's style:

```{language}
{code}
```

Respond with JSON:
{{
    "style_confidence": "low/medium/high",
    "coding_level": "junior/middle/senior",
    "common_patterns": ["pattern1", "pattern2"],
    "unusual_aspects": ["aspect1", "aspect2"],
    "suggests_external_help": true/false
}}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.client.chat_completion(
                model="qwen3-coder-30b-a3b-instruct-fp8",
                messages=messages,
                temperature=0.2,
                max_tokens=500
            )

            content = response['choices'][0]['message']['content']

            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]

            return json.loads(content.strip())

        except Exception as e:
            logger.error(f"Style analysis error: {e}")
            raise
