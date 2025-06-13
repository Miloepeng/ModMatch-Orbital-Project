from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import re

def moduleScrape(module_code):
    # Setup headless Chrome
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)

    # Load the module page
    url = f"https://nusmods.com/modules/{module_code}"
    driver.get(url)

    # Wait for iframes to load
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.TAG_NAME, "iframe"))
    )

    # Find and switch to the first iframe (likely the comment one)
    iframes = driver.find_elements(By.TAG_NAME, "iframe")

    # Try the first one that looks like a comment iframe
    driver.switch_to.frame(iframes[0])  # Adjust index if needed

    # Keep clicking the "Load more comments" button until it's gone
    while True:
        try:
            load_more_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "a.load-more-refresh__button"))
            )
            load_more_button.click()
            time.sleep(2)  
        except:
            #print("No more 'Load more' button found.")
            break

    # Wait for posts to appear inside the iframe
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "li.post"))
    )

    # Parse iframe content with BeautifulSoup
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

def descScrape(module_code):
    # Setup headless Chrome
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)

    # Load the module page
    url = f"https://nusmods.com/modules/{module_code}"
    driver.get(url)
    
    p_element = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "section.row div p")))
    #print(type(p_element.text))
    return p_element.text

