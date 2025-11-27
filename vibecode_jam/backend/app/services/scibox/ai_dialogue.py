"""
AI dialogue service for streaming conversations during interview
"""

import logging
import json
from typing import List, Dict, AsyncGenerator

logger = logging.getLogger(__name__)


class AIDialogue:
    """Manage conversational AI during interview"""

    def __init__(self, client):
        """
        Initialize dialogue service

        Args:
            client: SciboxClient instance
        """
        self.client = client
        self.conversation_history: List[Dict] = []
        self.max_history = 20  # Keep last 20 messages for context

    async def send_message(
        self,
        message: str,
        context: Dict
    ) -> AsyncGenerator[str, None]:
        """
        Send message to AI and stream response

        Args:
            message: User message
            context: Interview context (task, code, etc.)

        Yields:
            Response chunks as they're generated
        """
        system_prompt = """You are Alex, a friendly AI coding interviewer.
Your goal is to help the candidate showcase their skills through dialogue.
Ask clarifying questions but don't give direct answers.
Be professional but approachable.
Provide constructive feedback when appropriate.
Keep responses concise (1-2 paragraphs max)."""

        # Add context about current interview state
        context_str = self._build_context_string(context)

        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": message
        })

        # Build messages list with context and history
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"Interview context:\n{context_str}"}
        ]

        # Add conversation history (last 10 exchanges for context)
        messages.extend(self.conversation_history[-20:])

        try:
            response = await self.client.chat_completion(
                model="qwen3-32b-awq",
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                stream=True
            )

            full_response = ""

            # Stream response
            async for chunk in self._stream_response(response):
                full_response += chunk
                yield chunk

            # Add AI response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": full_response
            })

            # Keep history size manageable
            if len(self.conversation_history) > self.max_history:
                self.conversation_history = self.conversation_history[-self.max_history:]

            logger.debug("Dialogue message processed successfully")

        except Exception as e:
            logger.error(f"Dialogue error: {e}")
            raise

    async def _stream_response(self, response) -> AsyncGenerator[str, None]:
        """
        Parse and yield streaming response chunks

        Args:
            response: Aiohttp response

        Yields:
            Text chunks
        """
        try:
            async for line in response.content:
                line_text = line.decode('utf-8').strip()

                if not line_text or not line_text.startswith('data: '):
                    continue

                data_text = line_text[6:]  # Remove 'data: ' prefix

                if data_text == '[DONE]':
                    break

                try:
                    chunk = json.loads(data_text)

                    if 'choices' in chunk:
                        delta = chunk['choices'][0].get('delta', {})
                        if 'content' in delta:
                            yield delta['content']

                except json.JSONDecodeError:
                    continue

        except Exception as e:
            logger.error(f"Stream parsing error: {e}")
            raise

    def _build_context_string(self, context: Dict) -> str:
        """Build context string from interview state"""
        lines = []

        if context.get('task_title'):
            lines.append(f"Current Task: {context['task_title']}")

        if context.get('task_description'):
            lines.append(f"Problem: {context['task_description'][:200]}...")

        if context.get('code_submitted'):
            lines.append("Status: Code has been submitted")

        if context.get('test_status'):
            lines.append(f"Tests: {context['test_status']}")

        if context.get('candidate_level'):
            lines.append(f"Level: {context['candidate_level']}")

        return "\n".join(lines) if lines else "Interview in progress"

    def reset_conversation(self):
        """Reset conversation history for new task"""
        self.conversation_history = []
        logger.info("Conversation history reset")

    def get_conversation_summary(self) -> Dict:
        """
        Get summary of conversation

        Returns:
            Dict with conversation stats
        """
        return {
            "total_exchanges": len(self.conversation_history) // 2,
            "message_count": len(self.conversation_history),
            "has_history": len(self.conversation_history) > 0
        }
