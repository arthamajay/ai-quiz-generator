import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, unquote


def _extract_title_from_url(url: str) -> str:
    """Pull the article title out of a Wikipedia URL."""
    parsed = urlparse(url)
    # path is like /wiki/Narendra_Modi
    parts = parsed.path.split("/wiki/")
    if len(parts) < 2:
        raise ValueError(f"Cannot extract Wikipedia title from URL: {url}")
    return unquote(parts[1])  # e.g. "Narendra_Modi"


def _fetch_via_rest_api(title: str) -> str:
    """
    Use the Wikipedia REST API (v1) to get clean article text.
    Returns the plain-text summary + full extract.
    """
    # /page/summary gives a clean intro paragraph
    # /page/mobile-sections gives full sections as JSON
    api_url = f"https://en.wikipedia.org/api/rest_v1/page/mobile-sections/{title}"
    headers = {
        "User-Agent": "ai-quiz-generator/1.0 (educational project)",
        "Accept": "application/json",
    }
    resp = requests.get(api_url, headers=headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    texts = []

    # Lead section
    lead = data.get("lead", {})
    for section in lead.get("sections", []):
        html = section.get("text", "")
        if html:
            soup = BeautifulSoup(html, "html.parser")
            texts.append(soup.get_text(separator=" ", strip=True))

    # Remaining sections
    for section in data.get("remaining", {}).get("sections", []):
        html = section.get("text", "")
        if html:
            soup = BeautifulSoup(html, "html.parser")
            section_text = soup.get_text(separator=" ", strip=True)
            if section_text:
                texts.append(section_text)

    full_text = " ".join(texts)
    # Collapse whitespace
    return " ".join(full_text.split())


def _fetch_via_html_scrape(url: str) -> str:
    """
    Fallback: scrape the desktop Wikipedia page directly.
    Works for pages that the REST API doesn't cover.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
    }
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove unwanted elements before extracting text
    for tag in soup.find_all(["table", "sup", "span.mw-editsection",
                               "div.navbox", "div.sidebar", "div.reflist"]):
        tag.decompose()

    content_div = soup.find("div", {"id": "mw-content-text"})
    if not content_div:
        return ""

    paragraphs = content_div.find_all("p")
    texts = [p.get_text(separator=" ", strip=True) for p in paragraphs if p.get_text(strip=True)]
    return " ".join(" ".join(t.split()) for t in texts)


def extract_wikipedia_content(url: str) -> str:
    """
    Main entry point. Tries the Wikipedia REST API first (most reliable),
    falls back to HTML scraping if the API fails.
    Raises ValueError with a user-friendly message if content cannot be extracted.
    """
    try:
        title = _extract_title_from_url(url)
    except ValueError as e:
        return f"Invalid Wikipedia URL: {e}"

    # --- Attempt 1: REST API ---
    try:
        text = _fetch_via_rest_api(title)
        if len(text) > 200:
            return text
    except Exception:
        pass  # fall through to scrape

    # --- Attempt 2: HTML scrape ---
    try:
        text = _fetch_via_html_scrape(url)
        if len(text) > 200:
            return text
    except Exception:
        pass

    return "Could not extract content from the provided Wikipedia URL. Please check the URL and try again."
