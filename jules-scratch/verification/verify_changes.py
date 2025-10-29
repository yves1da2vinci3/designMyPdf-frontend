from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/dashboard/templates/create/1")
    page.get_by_role("button", name="Visual Editor").click()
    page.screenshot(path="jules-scratch/verification/visual-editor.png")
    page.get_by_role("button", name="Code Editor").click()
    page.screenshot(path="jules-scratch/verification/code-editor.png")
    page.goto("http://localhost:3000/dashboard/templates")
    page.get_by_role("button", name="Mass Print").click()
    page.screenshot(path="jules-scratch/verification/mass-print-modal.png")
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)
    page.locator("#create-template-button").click()
    page.screenshot(path="jules-scratch/verification/new-template-modal.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
