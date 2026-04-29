import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        print('Navigating to register...')
        await page.goto('http://localhost:3000/register')
        
        print('Filling form...')
        await page.fill('input[name="companyName"]', 'Empresa Teste Playwright')
        await page.fill('input[name="nif"]', '999999999')
        await page.fill('input[name="email"]', 'playwright_test_100@gmail.com')
        await page.fill('input[name="password"]', 'Password123')
        await page.fill('input[name="confirmPassword"]', 'Password123')
        
        print('Submitting...')
        
        async def handle_request(route, request):
            if 'supabase' in request.url:
                print('SUPABASE REQUEST:', request.url)
            await route.continue_()
            
        await page.route('**/*', handle_request)
        
        async def handle_dialog(dialog):
            print('ALERT SEEN:', dialog.message)
            await dialog.accept()
            
        page.on('dialog', handle_dialog)
        
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(3000)
        
        print('Done.')
        await browser.close()

asyncio.run(run())
