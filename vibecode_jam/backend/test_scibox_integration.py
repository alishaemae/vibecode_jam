"""
Test script for Scibox integration
Run this to verify all services are working correctly
"""

import asyncio
import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_scibox_connection():
    """Test basic Scibox connection"""
    print("\n" + "=" * 60)
    print("TEST 1: Scibox Client Connection")
    print("=" * 60)

    try:
        from app.services.scibox import SciboxClient

        async with SciboxClient(api_key="sk-Jw0mXI7PMgeFYVCW8e8PKw") as client:
            logger.info("✓ Scibox client created")

            # Test simple chat
            messages = [{"role": "user", "content": "Say 'hello'"}]
            response = await client.chat_completion(
                model="qwen3-32b-awq",
                messages=messages,
                temperature=0.7,
                max_tokens=50
            )

            if 'choices' in response and len(response['choices']) > 0:
                content = response['choices'][0]['message']['content']
                logger.info(f"✓ Chat response: {content[:100]}...")
                return True
            else:
                logger.error("✗ Invalid response format")
                return False

    except Exception as e:
        logger.error(f"✗ Connection test failed: {e}")
        return False


async def test_task_generation():
    """Test task generation"""
    print("\n" + "=" * 60)
    print("TEST 2: Task Generation")
    print("=" * 60)

    try:
        from app.services.scibox import SciboxClient, TaskGenerator

        async with SciboxClient(api_key="sk-Jw0mXI7PMgeFYVCW8e8PKw") as client:
            generator = TaskGenerator(client)
            logger.info("✓ Task generator created")

            # Generate a task
            task = await generator.generate_task(
                level="junior",
                domain="algorithms"
            )

            if 'title' in task and 'description' in task:
                logger.info(f"✓ Generated task: {task['title']}")
                logger.info(f"  Description: {task['description'][:100]}...")
                return True
            else:
                logger.error("✗ Task missing required fields")
                return False

    except Exception as e:
        logger.error(f"✗ Task generation failed: {e}")
        return False


async def test_embedding():
    """Test embedding generation"""
    print("\n" + "=" * 60)
    print("TEST 3: Embedding Generation")
    print("=" * 60)

    try:
        from app.services.scibox import SciboxClient

        async with SciboxClient(api_key="sk-Jw0mXI7PMgeFYVCW8e8PKw") as client:
            # Generate embedding
            text = "def hello_world(): return 'hello'"
            embedding = await client.get_embedding(text, model="bge-m3")

            if isinstance(embedding, list) and len(embedding) > 0:
                logger.info(f"✓ Embedding generated: {len(embedding)} dimensions")
                logger.info(f"  First 5 values: {embedding[:5]}")
                return True
            else:
                logger.error("✗ Invalid embedding format")
                return False

    except Exception as e:
        logger.error(f"✗ Embedding test failed: {e}")
        return False


async def test_solution_evaluation():
    """Test solution evaluation"""
    print("\n" + "=" * 60)
    print("TEST 4: Solution Evaluation")
    print("=" * 60)

    try:
        from app.services.scibox import SciboxClient, SolutionEvaluator

        async with SciboxClient(api_key="sk-Jw0mXI7PMgeFYVCW8e8PKw") as client:
            evaluator = SolutionEvaluator(client)
            logger.info("✓ Solution evaluator created")

            # Evaluate sample code
            task = {
                "title": "Two Sum",
                "description": "Find two numbers that sum to target"
            }
            code = """
def twoSum(nums, target):
    seen = {}
    for num in nums:
        if target - num in seen:
            return [seen[target - num], nums.index(num)]
        seen[num] = nums.index(num)
    return []
"""

            evaluation = await evaluator.evaluate_solution(
                task=task,
                code=code,
                test_results={
                    "visible_passed": 3,
                    "visible_total": 3,
                    "hidden_passed": 5,
                    "hidden_total": 5
                },
                execution_time_ms=45.2,
                language="python"
            )

            if 'overall_score' in evaluation:
                logger.info(f"✓ Evaluation complete")
                logger.info(f"  Overall score: {evaluation['overall_score']}/100")
                logger.info(f"  Correctness: {evaluation.get('correctness_score', 0)}/100")
                logger.info(f"  Code Quality: {evaluation.get('code_quality_score', 0)}/100")
                return True
            else:
                logger.error("✗ Evaluation missing score")
                return False

    except Exception as e:
        logger.error(f"✗ Solution evaluation failed: {e}")
        return False


async def test_anti_cheat():
    """Test anti-cheat detection"""
    print("\n" + "=" * 60)
    print("TEST 5: Anti-Cheat Detection")
    print("=" * 60)

    try:
        from app.services.scibox import SciboxClient, AntiCheatLLM

        async with SciboxClient(api_key="sk-Jw0mXI7PMgeFYVCW8e8PKw") as client:
            anti_cheat = AntiCheatLLM(client)
            logger.info("✓ Anti-cheat service created")

            # Check some code
            code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
"""

            result = await anti_cheat.check_code_originality(
                code=code,
                language="python",
                task_context="Generate fibonacci numbers"
            )

            if 'similarity_score' in result:
                logger.info(f"✓ Anti-cheat check complete")
                logger.info(f"  Similarity score: {result['similarity_score']}/100")
                logger.info(f"  Is suspicious: {result.get('is_suspicious', False)}")
                logger.info(f"  Likely source: {result.get('likely_source', 'unknown')}")
                return True
            else:
                logger.error("✗ Anti-cheat result missing score")
                return False

    except Exception as e:
        logger.error(f"✗ Anti-cheat test failed: {e}")
        return False


async def test_rate_limiting():
    """Test rate limiter"""
    print("\n" + "=" * 60)
    print("TEST 6: Rate Limiting")
    print("=" * 60)

    try:
        from app.services.scibox import SciboxClient

        async with SciboxClient(api_key="sk-Jw0mXI7PMgeFYVCW8e8PKw") as client:
            logger.info("✓ Rate limiter initialized")
            logger.info(f"  Limits: {client.rate_limiter.limits}")

            # Simulate multiple requests
            for i in range(2):
                await client.rate_limiter.acquire("qwen3-32b-awq")
                logger.info(f"  Request {i + 1} acquired")

            logger.info("✓ Rate limiter working correctly")
            return True

    except Exception as e:
        logger.error(f"✗ Rate limiter test failed: {e}")
        return False


async def run_all_tests():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("SCIBOX INTEGRATION TEST SUITE")
    print("=" * 60)

    tests = [
        ("Connection", test_scibox_connection),
        ("Task Generation", test_task_generation),
        ("Embedding", test_embedding),
        ("Solution Evaluation", test_solution_evaluation),
        ("Anti-Cheat", test_anti_cheat),
        ("Rate Limiting", test_rate_limiting),
    ]

    results = []

    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"Test {test_name} crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Scibox integration is ready to use.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the logs above.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(run_all_tests())
    sys.exit(exit_code)
