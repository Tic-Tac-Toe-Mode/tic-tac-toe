"""Run with python3 tests/daily_visitors_test.py against the running preview."""
import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 1800})
        replies = []
        async def response(r):
            if '/rpc/record_daily_visit' in r.url and r.ok:
                replies.append(await r.json())
        page.on('response', response)
        await page.goto('http://localhost:8080')
        await page.get_by_label('Daily visitors').wait_for()
        await page.wait_for_function("document.querySelector('[aria-label=\"Daily visitors\"] span').textContent.trim().match(/^\\d/)")
        first = replies[-1][0]
        assert first['visit_date'] == datetime.now(ZoneInfo('Africa/Lagos')).date().isoformat()
        await page.reload()
        await page.wait_for_timeout(3500)
        assert replies[-1][0]['visitor_count'] == first['visitor_count'], 'Same browser must count once per day'
        await page.evaluate("localStorage.setItem('daily-visitor-key', crypto.randomUUID())")
        await page.reload()
        await page.wait_for_timeout(3500)
        assert replies[-1][0]['visitor_count'] == first['visitor_count'] + 1, 'New browser must add one visitor'
        await page.get_by_role('button', name='2 Players', exact=False).click()
        await page.get_by_role('button', name='Start Game', exact=True).click()
        await page.get_by_label('Daily visitors').wait_for()
        assert replies[-1][0]['visitor_count'] == first['visitor_count'] + 1
        await browser.close()
        print('PASS: Lagos dates, daily deduplication, new visitors, and game placement')


asyncio.run(main())