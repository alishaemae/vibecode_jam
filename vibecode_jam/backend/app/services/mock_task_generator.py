"""
Mock TaskGenerator for development and testing
Provides fake tasks without requiring Scibox API
"""

import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

MOCK_TASKS = {
    ("junior", "algorithms"): {
        "title": "Two Sum Problem",
        "description": "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
        "examples": [
            {"input": "[2,7,11,15], target=9", "output": "[0,1]"},
            {"input": "[3,2,4], target=6", "output": "[1,2]"}
        ],
        "constraints": "1 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
        "time_limit": "15 minutes"
    },
    ("middle", "algorithms"): {
        "title": "Longest Substring Without Repeating Characters",
        "description": "Given a string, find the length of the longest substring without repeating characters.",
        "examples": [
            {"input": '"abcabcbb"', "output": "3 (abc)"},
            {"input": '"bbbbb"', "output": "1 (b)"}
        ],
        "constraints": "0 <= s.length <= 5 * 10^4",
        "time_limit": "20 minutes"
    },
    ("senior", "algorithms"): {
        "title": "Median of Two Sorted Arrays",
        "description": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        "examples": [
            {"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0"},
            {"input": "nums1 = [1,2], nums2 = [3,4]", "output": "2.5"}
        ],
        "constraints": "O(log(m+n)) time complexity required",
        "time_limit": "25 minutes"
    },
    ("junior", "backend"): {
        "title": "REST API Design",
        "description": "Design a REST API endpoint for a TODO application. Handle GET, POST, PUT, DELETE operations.",
        "examples": [
            {"method": "GET", "endpoint": "/api/todos", "response": "list of todos"},
            {"method": "POST", "endpoint": "/api/todos", "body": '{"title": "Task"}'}
        ],
        "constraints": "Use proper HTTP status codes and error handling",
        "time_limit": "20 minutes"
    },
    ("middle", "backend"): {
        "title": "Database Optimization",
        "description": "Optimize a slow database query for a user service. Analyze and improve performance.",
        "examples": [
            {"issue": "N+1 query problem", "solution": "Use JOIN instead of loop queries"}
        ],
        "constraints": "Must handle 1M+ records efficiently",
        "time_limit": "25 minutes"
    },
    ("senior", "backend"): {
        "title": "Distributed System Design",
        "description": "Design a scalable caching layer for a high-traffic API service.",
        "examples": [
            {"pattern": "Cache-aside", "requirements": "Handle cache invalidation, consistency"}
        ],
        "constraints": "99.9% uptime SLA, < 100ms latency",
        "time_limit": "30 minutes"
    },
    ("junior", "frontend"): {
        "title": "React Component",
        "description": "Build a reusable React counter component with increment/decrement buttons.",
        "examples": [
            {"state": "count: 0", "action": "increment -> count: 1"}
        ],
        "constraints": "Use hooks, handle edge cases",
        "time_limit": "15 minutes"
    },
    ("middle", "frontend"): {
        "title": "Form State Management",
        "description": "Implement a complex form with validation, error handling, and state management.",
        "examples": [
            {"field": "email", "validation": "regex pattern"}
        ],
        "constraints": "Must handle async validation",
        "time_limit": "20 minutes"
    },
    ("senior", "frontend"): {
        "title": "Performance Optimization",
        "description": "Optimize a React application with 1000+ list items. Implement virtualization.",
        "examples": [
            {"problem": "slow rendering", "solution": "use react-window or similar"}
        ],
        "constraints": "60fps scrolling, < 50ms initial load",
        "time_limit": "30 minutes"
    }
}


class MockTaskGenerator:
    """Mock task generator for development"""

    def __init__(self, client=None):
        """Initialize with optional client (ignored in mock)"""
        self.client = client
        logger.info("MockTaskGenerator initialized")

    async def generate_task(
        self,
        level: str,
        domain: str,
        previous_score: Optional[float] = None
    ) -> Dict:
        """
        Generate a mock coding interview task

        Args:
            level: Difficulty level (junior/middle/senior)
            domain: Programming domain (algorithms/backend/frontend)
            previous_score: Previous candidate score (ignored in mock)

        Returns:
            Dict with task details
        """
        # Normalize inputs
        level = level.lower() if level else "junior"
        domain = domain.lower() if domain else "algorithms"

        # Get mock task
        key = (level, domain)
        task = MOCK_TASKS.get(key)

        if not task:
            # Return a default task if key not found
            task = {
                "title": f"{level.capitalize()} {domain.capitalize()} Task",
                "description": "Solve this coding challenge.",
                "examples": [{"input": "example input", "output": "example output"}],
                "constraints": "Standard constraints apply",
                "time_limit": "20 minutes"
            }

        logger.info(f"Generated mock task: {level} {domain}")
        return task

    async def adapt_task(
        self,
        original_task: Dict,
        candidate_score: float
    ) -> Dict:
        """
        Adapt task based on candidate score

        Args:
            original_task: Original task dict
            candidate_score: Candidate's previous score (0-100)

        Returns:
            Adapted task dict
        """
        # Simple mock adaptation
        if candidate_score >= 85:
            difficulty = "much harder"
        elif candidate_score >= 70:
            difficulty = "harder"
        elif candidate_score < 50:
            difficulty = "easier"
        else:
            difficulty = "similar"

        adapted = original_task.copy()
        adapted["title"] = f"{adapted.get('title', 'Task')} (adapted - {difficulty})"
        adapted["adaptation"] = f"Difficulty adjusted to be {difficulty} based on score: {candidate_score}"

        logger.info(f"Adapted task for score: {candidate_score}")
        return adapted
