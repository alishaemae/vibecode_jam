# Scibox LLM Integration Setup Guide

## Overview

VibeCode Jam has been integrated with Scibox LLM services for AI-powered code interviewing. This guide explains the setup, services, and how to use them.

## Architecture

```
┌─────────────────────────────────────────────────┐
│          FastAPI Backend                        │
│  ┌──────────────────────────────────────────┐  │
│  │  Interview Routes                        │  │
│  │  - POST /api/interview/start             │  │
│  │  - GET /api/interview/adapt_task/{id}   │  │
│  └────────────────┬──────────────────────────┘  │
│                   │                              │
│  ┌────────────────▼──────────────────────────┐  │
│  │  Code Routes                             │  │
│  │  - POST /api/code/submit                 │  │
│  │  - GET /api/code/hint/{session}/{task}   │  │
│  └────────────────┬──────────────────────────┘  │
│                   │                              │
│  ┌────────────────▼──────────────────────────┐  │
│  │  Scibox Services                         │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ TaskGenerator                       │ │  │
│  │  │ - Generates tasks for interviews    │ │  │
│  │  │ - Adapts difficulty                 │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ SolutionEvaluator                   │ │  │
│  │  │ - Evaluates code solutions          │ │  │
│  │  │ - Provides feedback and hints       │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ AntiCheatLLM                        │ │  │
│  │  │ - Checks code originality          │ │  │
│  │  │ - Detects plagiarism                │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ AIDialogue                          │ │  │
│  │  │ - Streaming AI interviewer          │ │  │
│  │  │ - Conversational support            │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │ EmbeddingSearch                     │ │  │
│  │  │ - Finds similar solutions           │ │  │
│  │  │ - Detects code clones               │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────┘  │
│                   │                              │
│  ┌────────────────▼──────────────────────────┐  │
│  │  Support Services                        │  │
│  │  - RedisCache (performance)              │  │
│  │  - RateLimiter (API quotas)              │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Storage Layer                           │  │
│  │  - PostgreSQL (interview data)           │  │
│  │  - Redis (caching & sessions)            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼──────────┐
│  Scibox API       │
│  (Cloud LLM)      │
└───────────────────┘
```

## Installation

### 1. Install Dependencies

```bash
pip install aiohttp python-dotenv redis asyncpg
```

### 2. Set Environment Variables

Create `.env` file:

```env
# Scibox Configuration
SCIBOX_API_KEY=sk-Jw0mXI7PMgeFYVCW8e8PKw
SCIBOX_BASE_URL=https://api.scibox.ai/v1

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost/vibecode

# API Configuration
API_BASE_URL=http://localhost:8000
ENVIRONMENT=development
```

### 3. Start Services

```bash
# Start Redis (required for caching)
docker run -d -p 6379:6379 redis:latest

# Start PostgreSQL (required for data storage)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:latest

# Start FastAPI server
uvicorn app.main:app --reload
```

## Available Models

Scibox provides three models with different capabilities:

### 1. qwen3-32b-awq (2 RPS)
- **Use Case**: Task generation, evaluation, dialogue
- **Strengths**: General-purpose, balanced performance
- **Temperature**: 0.3-0.8
- **Max Tokens**: Up to 2000

### 2. qwen3-coder-30b-a3b-instruct-fp8 (2 RPS)
- **Use Case**: Code analysis, anti-cheat, originality checks
- **Strengths**: Code-specific, better understanding of programming
- **Temperature**: 0.1-0.5
- **Max Tokens**: Up to 2000

### 3. bge-m3 (7 RPS)
- **Use Case**: Embeddings, similarity search
- **Strengths**: High-quality semantic embeddings
- **Output**: 384-dimensional vectors

## Service Components

### TaskGenerator
Generates coding interview tasks adapted to difficulty level and domain.

```python
generator = TaskGenerator(scibox_client)
task = await generator.generate_task(
    level="junior",  # junior, middle, senior
    domain="algorithms"  # algorithms, backend, frontend
)
```

**Response:**
```json
{
  "title": "Two Sum",
  "description": "...",
  "input_format": "...",
  "output_format": "...",
  "constraints": [...],
  "examples": [
    {"input": "...", "output": "...", "explanation": "..."}
  ],
  "hidden_tests": [...],
  "time_limit": "2s",
  "memory_limit": "256MB"
}
```

### SolutionEvaluator
Evaluates code solutions and provides detailed feedback.

```python
evaluator = SolutionEvaluator(scibox_client)
evaluation = await evaluator.evaluate_solution(
    task=task_dict,
    code="def solution(): pass",
    test_results={"visible_passed": 3, "visible_total": 3, ...},
    execution_time_ms=45.2,
    language="python"
)
```

**Response:**
```json
{
  "correctness_score": 95,
  "code_quality_score": 85,
  "efficiency_score": 90,
  "edge_cases_score": 100,
  "overall_score": 92,
  "feedback": {
    "summary": "...",
    "strengths": ["..."],
    "improvements": ["..."],
    "complexity_analysis": "O(n) time, O(1) space"
  },
  "next_challenge_level": "middle"
}
```

### AntiCheatLLM
Checks code originality and detects plagiarism.

```python
anti_cheat = AntiCheatLLM(scibox_client)
result = await anti_cheat.check_code_originality(
    code="def solution(): pass",
    language="python",
    task_context="Find two numbers that sum to target"
)
```

**Response:**
```json
{
  "similarity_score": 25,
  "is_suspicious": false,
  "likely_source": "original",
  "reasoning": "...",
  "confidence": "high",
  "flags": [],
  "recommendation": "accept"
}
```

### AIDialogue
Provides streaming conversational support during interviews.

```python
dialogue = AIDialogue(scibox_client)
async for chunk in dialogue.send_message(
    message="I'm stuck on this problem",
    context={"task_title": "Two Sum", "code_submitted": False}
):
    print(chunk, end="", flush=True)
```

### EmbeddingSearch
Finds similar solutions using semantic search.

```python
search = EmbeddingSearch(scibox_client)

# Add known solutions to database
await search.add_known_solution(
    code="def two_sum(nums, target): ...",
    metadata={"task_id": 1, "source": "leetcode", "domain": "arrays"}
)

# Find similar solutions
similar = await search.find_similar(
    code="def solution(nums, target): ...",
    threshold=0.85,
    max_results=5
)
```

## API Endpoints

### Interview Endpoints

#### Start Interview
```http
POST /api/interview/start
Content-Type: application/json

{
  "candidate_email": "user@example.com",
  "level": "junior",
  "domain": "algorithms"
}

Response:
{
  "session_id": 123,
  "task": {
    "title": "Two Sum",
    "description": "...",
    "examples": [...]
  },
  "ws_url": "/api/chat/ws/123"
}
```

#### Get Adaptive Task
```http
GET /api/interview/adapt_task/123

Response:
{
  "task": {
    "title": "3Sum",
    "description": "...",
    "examples": [...]
  }
}
```

### Code Endpoints

#### Submit Code
```http
POST /api/code/submit
Content-Type: application/json

{
  "session_id": 123,
  "task_id": 456,
  "code": "def solution(nums, target): ...",
  "language": "python"
}

Response:
{
  "tests_passed": "Evaluating...",
  "score": 92,
  "evaluation": {
    "scores": {...},
    "feedback": {...},
    "anti_cheat": {...},
    "similar_solutions_found": false
  },
  "next_task_ready": true
}
```

#### Get Hint
```http
GET /api/code/hint/123/456

Response:
{
  "hint": "Consider using a hash map to track complement values..."
}
```

## Testing

Run the integration test suite:

```bash
python backend/test_scibox_integration.py
```

This will test:
- ✓ Scibox connection
- ✓ Task generation
- ✓ Embedding generation
- ✓ Solution evaluation
- ✓ Anti-cheat detection
- ✓ Rate limiting

## Performance Optimization

### 1. Rate Limiting
The client automatically respects API quotas:
- qwen3-32b-awq: 2 requests/second
- qwen3-coder-30b: 2 requests/second
- bge-m3: 7 requests/second

### 2. Caching
Redis cache reduces API calls:
- Task cache: 24 hours (tasks are reusable)
- Evaluation cache: 1 hour (exact code matches)
- Session cache: Interview duration

### 3. Batching
Events are batched before sending (configurable interval)

## Troubleshooting

### "API key invalid"
Check your `.env` file and Scibox dashboard

### "Rate limit exceeded"
Wait for the rate limiter to clear (max 60 seconds)

### "No response from server"
Check Redis and PostgreSQL are running

### "Connection timeout"
Verify Scibox API is accessible and check network

## Configuration Options

```python
# Scibox Client
SciboxClient(
    api_key="...",
    base_url="https://api.scibox.ai/v1"
)

# Cache
RedisCache(redis_url="redis://localhost:6379")

# Rate Limiter
RateLimiter({
    "qwen3-32b-awq": 2,
    "qwen3-coder-30b-a3b-instruct-fp8": 2,
    "bge-m3": 7
})
```

## Security Considerations

1. **API Key**: Store in environment variables, never commit to Git
2. **Rate Limiting**: Prevents API abuse
3. **Anti-Cheat**: Detects and flags suspicious code
4. **Input Validation**: All user inputs are validated
5. **Error Handling**: Sensitive errors are masked in responses

## Future Enhancements

- [ ] Advanced plagiarism detection using multiple services
- [ ] Real-time code execution and testing
- [ ] Multi-language support expansion
- [ ] Interactive code visualization
- [ ] Performance profiling and optimization suggestions
- [ ] Integration with GitHub for code analysis

## Support

For issues or questions:
1. Check logs: `journalctl -u vibecode`
2. Review test results: `python test_scibox_integration.py`
3. Check Scibox dashboard for API status
4. Review `.env` configuration

## License

VibeCode Jam © 2025
