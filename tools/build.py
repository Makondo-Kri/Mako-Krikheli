"""Builds the website pages.

- index.html                       Streets home page      (from tools/streets.html)
- gordon-beach-run/index.html      the game page          (from gordon-beach-run/game.html)
- gordon-beach-run/c/<range>/      score-range preview pages for GitHub Pages
- c/<range>/                       old links from before Streets, sent on to the game

gordon-beach-run/game.html is the same file that is published as the claude.ai artifact.
Run from the repository root:  python3 tools/build.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
game_dir = root / "gordon-beach-run"
config = (game_dir / "config.js").read_text(encoding="utf-8")
site = re.search(r'siteUrl:\s*"([^"]*)"', config).group(1)
if not site.endswith("/"):
    site += "/"
root_url = site[: -len("gordon-beach-run/")] if site.endswith("gordon-beach-run/") else site

# Streets home page
streets = (root / "tools" / "streets.html").read_text(encoding="utf-8").replace("{{ROOT_URL}}", root_url)
(root / "index.html").write_text(streets, encoding="utf-8")

# Game page
head = (root / "tools" / "head.html").read_text(encoding="utf-8").replace("{{SITE_URL}}", site)
game = (game_dir / "game.html").read_text(encoding="utf-8")
game = re.sub(r"<title>.*?</title>\n", "", game, count=1)
game = re.sub(r'<meta name="(viewport|apple-mobile-web-app-capable|mobile-web-app-capable)"[^>]*>\n', "", game)
(game_dir / "index.html").write_text(head + game + "\n</body>\n</html>\n", encoding="utf-8")

# Score-range preview pages (the picture server on Vercel makes name pictures instead)
buckets = list(range(0, 10000, 250)) + list(range(10000, 20001, 1000))

def range_page(b, base, image_base, back):
    label = f"{b:,}+" if b else ""
    title = (f"I scored {label} in Gordon Beach Run! Can you beat me?" if b
             else "Gordon Beach Run: can you beat my score?")
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="Streets · Gordon Beach Run: help Ben-Gurion race down the Tel Aviv shore, and beat my score. תצליחו לעקוף אותי?">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Streets">
<meta property="og:title" content="{title} · תצליחו לעקוף אותי?">
<meta property="og:description" content="Streets · a free retro game for your phone. ריצה בחוף גורדון">
<meta property="og:url" content="{base}c/{b}/">
<meta property="og:image" content="{image_base}c/{b}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{image_base}c/{b}/og.png">
<script>location.replace("{back}" + location.search);</script>
</head>
<body style="background:#0c3a5a;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:40px 16px">
<p><a href="{back}" style="color:#ffd23f">Play Gordon Beach Run · שחקו</a></p>
</body>
</html>
"""

for b in buckets:
    d = game_dir / "c" / str(b); d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(range_page(b, site, site, "../../"), encoding="utf-8")
    old = root / "c" / str(b); old.mkdir(parents=True, exist_ok=True)
    (old / "index.html").write_text(range_page(b, root_url, site, "../../gordon-beach-run/"), encoding="utf-8")
    stale = old / "og.png"
    if stale.exists():
        stale.unlink()

print("built Streets home, game page and", len(buckets), "score pages for", site)
