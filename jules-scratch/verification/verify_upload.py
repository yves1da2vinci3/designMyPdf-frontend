from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/dashboard/templates/create/1", timeout=120000)
    page.wait_for_load_state("networkidle", timeout=120000)

    # Click the "AI Generate" button to open the modal
    page.get_by_role("button", name="AI Generate").click()
    page.wait_for_timeout(2000) # wait for modal to open

    # Wait for the dropzone to be visible
    dropzone_locator = page.locator('div[class*="mantine-Dropzone-root"]')
    dropzone_locator.wait_for(state="visible", timeout=120000)

    # Open the file chooser
    with page.expect_file_chooser() as fc_info:
        dropzone_locator.evaluate("e => e.click()")
    file_chooser = fc_info.value
    file_chooser.set_files('public/favicon.svg')

    page.wait_for_timeout(5000) # wait for upload to complete
    page.screenshot(path="jules-scratch/verification/upload.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)