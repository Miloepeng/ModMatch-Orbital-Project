from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import re

def moduleScrape(module_code):
    # --- Setup headless Chrome ---
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)

    # --- Load the module page ---
    ##module_code = "CS1101S"
    url = f"https://nusmods.com/modules/{module_code}"
    driver.get(url)

    # --- Wait for iframes to load ---
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.TAG_NAME, "iframe"))
    )

    # --- Find and switch to the first iframe (likely the comment one) ---
    iframes = driver.find_elements(By.TAG_NAME, "iframe")
    #print(f"Found {len(iframes)} iframes.")

    # Optional: You can inspect `iframe.get_attribute('src')` to pick the right one
##    for idx, iframe in enumerate(iframes):
##        print(f"Iframe {idx} src: {iframe.get_attribute('src')}")

    # Try the first one that looks like a comment iframe
    driver.switch_to.frame(iframes[0])  # Adjust index if needed

    # Keep clicking the "Load more comments" button until it's gone
    while True:
        try:
            load_more_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "a.load-more-refresh__button"))
            )
            #print("Clicking 'Load more comments'...")
            load_more_button.click()
            time.sleep(2)  # Give time for comments to load
        except:
            #print("No more 'Load more' button found.")
            break

    # --- Wait for posts to appear inside the iframe ---
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "li.post"))
    )

    # --- Parse iframe content with BeautifulSoup ---
    soup = BeautifulSoup(driver.page_source, "html.parser")
    comments = soup.select("li.post")

    output = []
    ##print(f"\nFound {len(comments)} comments:\n")
    for i, comment in enumerate(comments, start=1):
        ##print(f"Comment {i}:")
        ##print(comment.get_text(strip=True))
        temp = comment.get_text(strip=True).lower()
        temp = re.sub(r'([a-z])([0-9])', r'\1 \2', temp)
        temp = re.sub(r'([0-9])([a-z])', r'\1 \2', temp)
        output.append(temp)
        ##print("-" * 50)

    driver.quit()

    answer = ""
    for item in output:
        answer += " " + item
    return answer

