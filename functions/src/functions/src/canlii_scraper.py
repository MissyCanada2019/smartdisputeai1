import requests
from bs4 import BeautifulSoup

def scrape_canlii_cases(keyword, province="on", max_results=10):
    url = f"https://www.canlii.org/en/{province}/search/?q={keyword}&sort=decisionDate+desc"
    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    cases = []
    for case in soup.select(".result_title a")[:max_results]:
        title = case.get_text(strip=True)
        link = "https://www.canlii.org" + case.get("href")
        cases.append({"title": title, "url": link})

    return cases

# OPTIONAL: test locally
if __name__ == "__main__":
    test_cases = scrape_canlii_cases("tenant")
    for c in test_cases:
        print(c)
