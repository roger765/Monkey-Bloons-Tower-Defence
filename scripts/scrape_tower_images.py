"""
Scrapes tower upgrade images from the Bloons wiki via the MediaWiki API.
Run: python scripts/scrape_tower_images.py

Downloads to: public/assets/towers/wiki/
"""

import urllib.request
import urllib.parse
import ssl
import os
import time
import json

WIKI_API = "https://bloons.fandom.com/api.php"
SOURCE_PAGE = "Tier_5_Upgrades"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "towers", "wiki")

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def api_get(params: dict) -> dict:
    params["format"] = "json"
    url = WIKI_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as r:
        return json.loads(r.read())


def get_page_image_titles() -> list[str]:
    """Return all File: titles listed on the source page."""
    titles = []
    imcontinue = None
    for _ in range(20):
        params = {"action": "query", "titles": SOURCE_PAGE, "prop": "images", "imlimit": 100}
        if imcontinue:
            params["imcontinue"] = imcontinue
        data = api_get(params)
        for page in data["query"]["pages"].values():
            titles.extend(img["title"] for img in page.get("images", []))
        if "continue" in data:
            imcontinue = data["continue"]["imcontinue"]
        else:
            break
    return titles


def get_image_urls(titles: list[str]) -> dict[str, str]:
    """Batch-resolve File titles to their CDN download URLs."""
    result = {}
    # API accepts up to 50 titles per call
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        data = api_get({
            "action": "query",
            "titles": "|".join(batch),
            "prop": "imageinfo",
            "iiprop": "url",
        })
        for page in data["query"]["pages"].values():
            info = page.get("imageinfo", [])
            if info:
                result[page["title"]] = info[0]["url"]
    return result


def download(url: str, dest: str):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20, context=SSL_CTX) as r:
        with open(dest, "wb") as f:
            f.write(r.read())


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Querying wiki for images on '{SOURCE_PAGE}'...")

    all_titles = get_page_image_titles()
    print(f"  Found {len(all_titles)} total image references\n")

    print("Resolving CDN URLs...")
    url_map = get_image_urls(all_titles)

    manifest = []
    downloaded = skipped = errors = 0

    for title, url in sorted(url_map.items()):
        # Strip "File:" prefix and normalize filename
        filename = title.removeprefix("File:").replace(" ", "_")
        dest = os.path.join(OUTPUT_DIR, filename)

        if os.path.exists(dest):
            print(f"  [skip] {filename}")
            skipped += 1
            manifest.append({"file": filename, "source": title, "url": url, "status": "cached"})
            continue

        try:
            download(url, dest)
            size_kb = os.path.getsize(dest) // 1024
            print(f"  [ok]   {filename} ({size_kb} KB)")
            manifest.append({"file": filename, "source": title, "url": url, "status": "downloaded"})
            downloaded += 1
            time.sleep(0.25)
        except Exception as e:
            print(f"  [err]  {filename}: {e}")
            manifest.append({"file": filename, "source": title, "url": url, "status": f"error: {e}"})
            errors += 1

    manifest_path = os.path.join(OUTPUT_DIR, "_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nDone: {downloaded} downloaded, {skipped} cached, {errors} errors")
    print(f"Output: {os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
