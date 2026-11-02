"""Builds index.html (the website page) from game.html (the game itself).

game.html is the same file that is published as the claude.ai artifact.
This script wraps it in a full web page with the link-preview tags.
Run from the repository root:  python3 tools/build.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
config = (root / "config.js").read_text(encoding="utf-8")
site = re.search(r'siteUrl:\s*"([^"]*)"', config).group(1)
if not site.endswith("/"):
    site += "/"

head = (root / "tools" / "head.html").read_text(encoding="utf-8").replace("{{SITE_URL}}", site)
game = (root / "game.html").read_text(encoding="utf-8")
# the page head already has these, so drop the game's own copies
game = re.sub(r"<title>.*?</title>\n", "", game, count=1)
game = re.sub(r'<meta name="(viewport|apple-mobile-web-app-capable|mobile-web-app-capable)"[^>]*>\n', "", game)

(root / "index.html").write_text(head + game + "\n</body>\n</html>\n", encoding="utf-8")
print("index.html built for", site)

# Challenge pages: c/<range>/index.html carry a preview picture with that score,
# then send the visitor on to the game (keeping ?s=score&n=nickname).
buckets = list(range(0, 10000, 250)) + list(range(10000, 20001, 1000))
for b in buckets:
    label = f"{b:,}+" if b else ""
    title = (f"I scored {label} in Gordon Beach Run! Can you beat me?" if b
             else "Gordon Beach Run: can you beat my score?")
    page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="Help Ben-Gurion race down the Tel Aviv shore for his 1957 headstand, and beat my score. תצליחו לעקוף אותי?">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Gordon Beach Run">
<meta property="og:title" content="{title} · תצליחו לעקוף אותי?">
<meta property="og:description" content="A free retro game for your phone: Ben-Gurion's 1957 headstand on the Tel Aviv beach.">
<meta property="og:url" content="{site}c/{b}/">
<meta property="og:image" content="{site}c/{b}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{site}c/{b}/og.png">
<link rel="icon" type="image/png" href="../../favicon.png">
<script>location.replace("../../" + location.search);</script>
</head>
<body style="background:#0c3a5a;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:40px 16px">
<p><a href="../../" style="color:#ffd23f">Play Gordon Beach Run · שחקו</a></p>
</body>
</html>
"""
    d = root / "c" / str(b)
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(page, encoding="utf-8")
print(len(buckets), "challenge pages built")
