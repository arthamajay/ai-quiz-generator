import requests
from bs4 import BeautifulSoup

def extract_wikipedia_content(url: str) -> str:
    """
    Extracts the main textual content from a Wikipedia page.
    Adds browser-like headers to bypass 403 errors.
    Removes navigation menus, tables, references, etc.
    """
    try:
        # Step 1: Define headers (Wikipedia blocks default Python user agents)
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        }

        # Step 2: Fetch the Wikipedia page
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise exception for HTTP 4xx/5xx

        # Step 3: Parse HTML content
        soup = BeautifulSoup(response.text, "html.parser")

        # Step 4: Extract main content area (Wikipedia uses this ID)
        content_div = soup.find("div", {"id": "mw-content-text"})

        if not content_div:
            return "No readable content found."

        # Step 5: Collect paragraph text (ignore tables, sidebars, etc.)
        paragraphs = content_div.find_all("p")
        text_content = " ".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))

        # Step 6: Clean up spacing and return clean text
        clean_text = " ".join(text_content.split())

        return clean_text

    except requests.exceptions.RequestException as req_err:
        return f"Error fetching content: {req_err}"
    except Exception as e:
        return f"Unexpected error: {e}"
