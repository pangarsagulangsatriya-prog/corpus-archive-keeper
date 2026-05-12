import json
import re
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs, unquote

import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

# --- Constants & Config ---
MANIFEST_PATH = r"C:\Users\Feedloop\Downloads\dkj_synopsis_link_discovery_manifest_54_v3_target5.md"
OUTPUT_JSON = "scratch/dkj_raw_synopsis_sources_filled_54.json"
OUTPUT_MD = "scratch/dkj_raw_synopsis_sources_filled_54.md"
OUTPUT_COVERAGE = "scratch/dkj_raw_synopsis_coverage_report_54.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
}
DEFAULT_TIMEOUT = 15

# --- Parsing Markdown ---
def parse_markdown_tables(filepath: str):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    coverage_table = []
    coverage_match = re.search(r'## Coverage Summary[^\n]*\n+((?:\|[^\n]+\|\n)+)', content)
    if coverage_match:
        lines = coverage_match.group(1).strip().split('\n')
        # Skip header (0) and separator (1)
        for line in lines[2:]:
            parts = [p.strip() for p in line.split('|')[1:-1]]
            if len(parts) >= 8:
                coverage_table.append({
                    "id": parts[0],
                    "judulBuku": parts[1],
                    "pengarang": parts[2],
                    "tahunMenang": parts[3]
                })

    source_table = []
    source_match = re.search(r'## Source Rows[^\n]*\n+((?:\|[^\n]+\|\n?)+)', content)
    if source_match:
        lines = source_match.group(1).strip().split('\n')
        # Skip header (0) and separator (1)
        for line in lines[2:]:
            parts = [p.strip() for p in line.split('|')[1:-1]]
            if len(parts) >= 12:
                source_table.append({
                    "id": parts[0],
                    "judul": parts[1],
                    "rowKind": parts[2],
                    "sourceType": parts[3],
                    "sourceName": parts[4],
                    "sourceUrl": parts[5],
                    "priority": parts[7]
                })
                
    return coverage_table, source_table

# --- Search Resolver ---
def resolve_search_url(google_url: str) -> str:
    parsed = urlparse(google_url)
    qs = parse_qs(parsed.query)
    q = qs.get("q", [""])[0]
    if not q:
        return ""
    
    query = unquote(q)
    print(f"    [DuckDuckGo] Searching: {query}")
    try:
        results = DDGS().text(query, max_results=1)
        for r in results:
            if "href" in r:
                return r["href"]
            if "link" in r:
                return r["link"]
    except Exception as e:
        print(f"    [DuckDuckGo Error]: {e}")
    time.sleep(2)
    return ""

# --- Scraping Logic ---
def clean_text_preserve_raw(text: str) -> str:
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        cl = line.strip()
        if cl:
            cleaned_lines.append(cl)
    return '\n\n'.join(cleaned_lines)

def scrape_source(url: str, source_type: str) -> tuple[str, str]:
    if not url.startswith("http"):
        return "", "blocked_or_unavailable"
    
    print(f"    [Scrape] Fetching: {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=DEFAULT_TIMEOUT, allow_redirects=True)
        if resp.status_code != 200:
            return "", "blocked_or_unavailable"
        
        soup = BeautifulSoup(resp.text, 'lxml')
        
        blocks = []
        if 'goodreads' in source_type.lower():
            div = soup.find('div', {'class': 'BookPageMetadataSection__description'}) or soup.find('div', id='description')
            if div: blocks.append(div.get_text(separator='\n', strip=True))
        elif 'google_books' in source_type.lower():
            div = soup.find('div', {'id': 'synopsistext'}) or soup.find('div', {'class': 'book_info'})
            if div: blocks.append(div.get_text(separator='\n', strip=True))
        elif 'gpu' in url.lower() or 'gramedia' in url.lower():
            div = soup.find('div', {'class': 'summary'}) or soup.find('div', {'class': 'product-desc'})
            if div: blocks.append(div.get_text(separator='\n', strip=True))
        elif 'marjinkiri' in url.lower() or 'bentang' in url.lower() or 'mojokstore' in url.lower():
            div = soup.find('div', {'class': 'woocommerce-product-details__short-description'}) or soup.find('div', id='tab-description')
            if div: blocks.append(div.get_text(separator='\n', strip=True))
        
        if not blocks:
            meta = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
            if meta and meta.get('content'):
                blocks.append(meta.get('content'))

        raw_text = "\n".join(blocks).strip()
        if raw_text:
            return clean_text_preserve_raw(raw_text), "raw_collected"
        else:
            return "", "metadata_only"
            
    except requests.exceptions.RequestException:
        return "", "blocked_or_unavailable"
    except Exception:
        return "", "blocked_or_unavailable"

# --- Main ---
def main():
    coverage_table, source_table = parse_markdown_tables(MANIFEST_PATH)
    
    books_data = {}
    for cov in coverage_table:
        books_data[cov['id']] = {
            "id": cov['id'],
            "judulBuku": cov['judulBuku'],
            "publishedTitle": cov['judulBuku'],
            "pengarang": cov['pengarang'],
            "tahunMenang": cov['tahunMenang'],
            "sources": [],
            "coverage": {"validSourceCount": 0, "targetReached": False}
        }
        
    print(f"Total books parsed: {len(books_data)}")
    
    sources_by_id = {}
    for src in source_table:
        if src['rowKind'] == 'not_applicable': continue
        sources_by_id.setdefault(src['id'], []).append(src)
        
    for idx, (book_id, book) in enumerate(books_data.items(), 1):
        srcs = sources_by_id.get(book_id, [])
        srcs.sort(key=lambda x: int(x['priority']) if x['priority'].isdigit() else 99)
        
        print(f"\n[{idx}/{len(books_data)}] Processing {book_id} : {book['judulBuku']} ({len(srcs)} sources in manifest)")
        
        for src in srcs:
            if len(book["sources"]) >= 5:
                break
                
            actual_url = src['sourceUrl']
            if src['rowKind'] == 'targeted_source_search':
                resolved = resolve_search_url(actual_url)
                if resolved:
                    actual_url = resolved
                else:
                    continue
                    
            text, status = scrape_source(actual_url, src['sourceType'])
            
            book["sources"].append({
                "sourceType": src['sourceType'].split('_search')[0],
                "sourceName": src['sourceName'].replace(' targeted search', '').replace(' search', '').strip(),
                "sourceUrl": actual_url,
                "rawSynopsisContributor": "",
                "rawSynopsisFullText": text,
                "scrapeStatus": status,
                "validationNote": "Auto-scraped via V3 pipeline."
            })
            if status == "raw_collected":
                book["coverage"]["validSourceCount"] += 1
            
            time.sleep(1)
            
        book["coverage"]["targetReached"] = len(book["sources"]) >= 5
        
    final_list = list(books_data.values())
    
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2, ensure_ascii=False)
        
    with open(OUTPUT_MD, "w", encoding="utf-8") as f:
        f.write("# DKJ Synopsis Sources Filled (V3)\n\n")
        for b in final_list:
            f.write(f"## {b['id']} - {b['judulBuku']}\n")
            for i, s in enumerate(b['sources'], 1):
                f.write(f"### Source {i}: {s['sourceName']}\n")
                f.write(f"- URL: {s['sourceUrl']}\n")
                f.write(f"- Status: {s['scrapeStatus']}\n\n")
                if s['rawSynopsisFullText']:
                    f.write(f"```text\n{s['rawSynopsisFullText']}\n```\n\n")
                    
    coverage_report = {
        "totalBooks": len(final_list),
        "totalSources": sum(len(b['sources']) for b in final_list),
        "booksWithNoSources": [b['id'] for b in final_list if len(b['sources']) == 0],
        "booksReachingTarget5": [b['id'] for b in final_list if b["coverage"]["targetReached"]]
    }
    with open(OUTPUT_COVERAGE, "w", encoding="utf-8") as f:
        json.dump(coverage_report, f, indent=2, ensure_ascii=False)

    print("\n[Done] Pipeline finished!")

if __name__ == "__main__":
    main()
