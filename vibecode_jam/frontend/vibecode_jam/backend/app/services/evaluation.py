from app.services.code_executor import run_code

async def evaluate_solution(code: str, language: str):
    result = run_code(code, language)
    score = 50 + result.get("tests_passed", 0) * 5
    return {
        "correctness": score,
        "code_quality": 70,
        "feedback": "Auto-evaluation placeholder"
    }

async def anti_cheat_check(code: str):
    # Заглушка для similarity check
    return {"similarity_score": 15, "likely_source": "original", "reasoning": "No suspicious patterns"}
