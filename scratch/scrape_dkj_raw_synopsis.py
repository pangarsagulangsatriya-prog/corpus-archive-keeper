import json
import re
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

import requests
from bs4 import BeautifulSoup


DEFAULT_TIMEOUT = 30
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0 Safari/537.36"
    )
}


def clean_text_preserve_raw(text: str) -> str:
    # Minimal cleanup agar teks web tidak pecah karena whitespace HTML.
    # Tidak mengubah wording, tidak summarize.
    text = text.replace("\xa0", " ")
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_by_selector(soup: BeautifulSoup, selector: str) -> str:
    nodes = soup.select(selector)
    parts = []
    for node in nodes:
        txt = node.get_text("\n", strip=True)
        if txt:
            parts.append(txt)
    return clean_text_preserve_raw("\n\n".join(parts))


def extract_candidates(soup: BeautifulSoup) -> str:
    # Heuristik generik. Jangan dipakai sebagai final kalau selector sudah ada.
    selectors = [
        ".summary",
        ".description",
        ".product-description",
        ".woocommerce-product-details__short-description",
        ".entry-content",
        "article",
        "main",
        "#description",
        "[itemprop='description']",
    ]

    best = ""
    for sel in selectors:
        txt = extract_by_selector(soup, sel)
        if len(txt) > len(best):
            best = txt

    if best:
        return best

    # Fallback: ambil meta description kalau tidak ada blok konten.
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content"):
        return clean_text_preserve_raw(meta["content"])

    og = soup.find("meta", attrs={"property": "og:description"})
    if og and og.get("content"):
        return clean_text_preserve_raw(og["content"])

    return ""


def scrape_source(source: Dict[str, Any]) -> Dict[str, Any]:
    url = source.get("sourceUrl", "")
    selector = source.get("selectorHint", "")

    result = dict(source)
    result.setdefault("rawSynopsisFullText", "")

    if not url:
        result["scrapeStatus"] = "missing_source_url"
        return result

    try:
        resp = requests.get(url, headers=HEADERS, timeout=DEFAULT_TIMEOUT)
        result["httpStatus"] = resp.status_code
        result["scrapedAt"] = datetime.now(timezone.utc).isoformat()

        if resp.status_code >= 400:
            result["scrapeStatus"] = f"http_error_{resp.status_code}"
            return result

        soup = BeautifulSoup(resp.text, "lxml")

        if selector:
            raw = extract_by_selector(soup, selector)
            result["extractionMethod"] = "selectorHint"
        else:
            raw = extract_candidates(soup)
            result["extractionMethod"] = "generic_candidate"

        result["rawSynopsisFullText"] = raw
        result["rawSynopsisCharCount"] = len(raw)

        if raw:
            result["scrapeStatus"] = "raw_collected"
        else:
            result["scrapeStatus"] = "no_text_extracted"

        return result

    except Exception as e:
        result["scrapeStatus"] = "scrape_error"
        result["scrapeError"] = repr(e)
        result["scrapedAt"] = datetime.now(timezone.utc).isoformat()
        return result


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: python scrape_dkj_raw_synopsis.py input_sources.json output_filled.json")
        sys.exit(1)

    in_path = sys.argv[1]
    out_path = sys.argv[2]

    with open(in_path, "r", encoding="utf-8") as f:
        rows: List[Dict[str, Any]] = json.load(f)

    filled = []
    for i, row in enumerate(rows, 1):
        print(f"[{i}/{len(rows)}] {row.get('id')} — {row.get('sourceName')} — {row.get('sourceUrl')}")
        filled.append(scrape_source(row))
        time.sleep(1)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(filled, f, ensure_ascii=False, indent=2)

    print(f"Done: {out_path}")


if __name__ == "__main__":
    main()
