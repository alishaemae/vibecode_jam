"""
Metrics calculation utilities
"""

from typing import Dict, Any


def calculate_code_metrics(code: str, language: str = "python") -> Dict[str, Any]:
    """
    Calculate basic code metrics

    Args:
        code: Source code to analyze
        language: Programming language

    Returns:
        Dictionary with metrics (lines, complexity, etc.)
    """
    lines = code.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]

    return {
        "total_lines": len(lines),
        "code_lines": len(non_empty_lines),
        "language": language
    }


def calculate_score(
    correctness: float,
    code_quality: float,
    efficiency: float
) -> float:
    """
    Calculate overall score from component scores

    Args:
        correctness: Correctness score (0-100)
        code_quality: Code quality score (0-100)
        efficiency: Efficiency score (0-100)

    Returns:
        Weighted overall score
    """
    return (correctness * 0.5) + (code_quality * 0.3) + (efficiency * 0.2)
