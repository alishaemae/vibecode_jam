import pytest
from playwright.async_api import async_playwright

@pytest.mark.asyncio
async def test_full_interview_flow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("http://frontend:5173")  # имя контейнера фронтенда

        # Выбор уровня интервью
        await page.select_option("#level-select", "Junior")
        await page.select_option("#domain-select", "Algorithms")
        await page.click("#start-interview-btn")

        # Ждем загрузку задачи
        await page.wait_for_selector(".task-view")
        task_text = await page.text_content(".task-view")
        assert len(task_text) > 0

        # Вводим код в редактор
        await page.fill("#code-editor", "print('Hello World')")
        await page.click("#run-tests-btn")

        # Ждем результаты тестов
        await page.wait_for_selector(".test-result")
        results = await page.text_content(".test-result")
        assert "passed" in results.lower()

        # Submit код
        await page.click("#submit-code-btn")
        await page.wait_for_selector(".score")
        score_text = await page.text_content(".score")
        assert len(score_text) > 0

        await browser.close()
