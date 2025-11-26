import asyncio
from app.services.llm_service import call_llm_stream, call_llm
from app.services.code_executor import run_code
from app.services.evaluation import evaluate_solution, anti_cheat_check
from app.utils.hashing import hash_code

LLM_MODELS = {
    "main_chat": "qwen3-32b-awq",
    "code_analysis": "qwen3-coder-30b",
    "embedding_search": "bge-m3",
}

async def orchestrate_submission(code: str, language: str):
    """
    Полный pipeline submit с тремя моделями:
    - qwen3-coder: similarity и качество кода
    - bge-m3: embedding similarity
    - qwen3-32b: финальная оценка и feedback
    """
    # Параллельный запуск
    coder_task = call_llm(LLM_MODELS["code_analysis"], {"code": code, "language": language})
    embedding_task = call_llm(LLM_MODELS["embedding_search"], {"code": code, "language": language})
    main_task = call_llm(LLM_MODELS["main_chat"], {
        "messages": [
            {"role": "system", "content": "You are a technical interviewer."},
            {"role": "user", "content": code}
        ],
        "language": language
    })

    coder_res, embedding_res, main_res = await asyncio.gather(coder_task, embedding_task, main_task)

    # Расчёт suspicious_score
    paste_events = 0
    devtools_opens = 0
    llm_similarity = coder_res.get("similarity_score", 0)
    embedding_similarity = embedding_res.get("similarity", 0)

    suspicious_score = paste_events*20 + devtools_opens*30 + llm_similarity*0.5 + embedding_similarity*0.3

    return {
        "evaluation": main_res,
        "coder_analysis": coder_res,
        "embedding_analysis": embedding_res,
        "suspicious_score": suspicious_score
    }


async def decide_next_task(score: int, time_spent: int, last_task_type: str):
    """
    Адаптивная генерация следующей задачи
    """
    if score > 80 and time_spent < 600:
        level = "hard"
    elif score < 50:
        level = "easy"
    else:
        level = "medium"

    return {
        "title": f"Next {level} task",
        "description": f"Generated based on score {score} and time {time_spent}"
    }
