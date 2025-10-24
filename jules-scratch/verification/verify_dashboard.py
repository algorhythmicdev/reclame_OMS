from playwright.sync_api import Page, expect

def verify_dashboard(page: Page):
    """
    This test verifies that the dashboard page of the Reclame Fabriek mockup
    is rendered correctly.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173/")

    # 2. Assert: Check for a key element on the page to ensure it's loaded.
    # We'll look for the "Active Jobs" heading.
    active_jobs_heading = page.get_by_role("heading", name="Active Jobs")
    expect(active_jobs_heading).to_be_visible()

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/dashboard.png")

# This is the boilerplate to run the test function
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_dashboard(page)
    browser.close()
