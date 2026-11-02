"""Builds the website pages.

- index.html                 Streets home page        (from tools/streets.html)
- <game>/index.html          each game's page         (from <game>/game.html + tools/head-<game>.html)
- <game>/c/<range>/          score-range preview pages for GitHub Pages
- c/<range>/                 old Gordon Beach Run links from before Streets, sent on to the game

Each <game>/game.html is a complete game; gordon-beach-run/game.html is also the claude.ai version.
Run from the repository root:  python3 tools/build.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
GAMES = {
    "gordon-beach-run": "Gordon Beach Run",
    "golda-kitchen": "Golda's Kitchen",
}
buckets = list(range(0, 10000, 250)) + list(range(10000, 20001, 1000))


def site_of(game):
    config = (root / game / "config.js").read_text(encoding="utf-8")
    site = re.search(r'siteUrl:\s*"([^"]*)"', config).group(1)
    return site if site.endswith("/") else site + "/"


def range_page(b, name, base, image_base, back):
    label = f"{b:,}+" if b else ""
    title = (f"I scored {label} in {name}! Can you beat me?" if b else f"{name}: can you beat my score?")
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="Streets · {name}: a free retro game for your phone. תצליחו לעקוף אותי?">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Streets">
<meta property="og:title" content="{title} · תצליחו לעקוף אותי?">
<meta property="og:description" content="Streets · a free retro game for your phone.">
<meta property="og:url" content="{base}c/{b}/">
<meta property="og:image" content="{image_base}c/{b}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{image_base}c/{b}/og.png">
<script>location.replace("{back}" + location.search);</script>
</head>
<body style="background:#0c3a5a;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:40px 16px">
<p><a href="{back}" style="color:#ffd23f">Play {name} · שחקו</a></p>
</body>
</html>
"""


root_url = None
for game, name in GAMES.items():
    site = site_of(game)
    root_url = root_url or site[: -len(game + "/")]
    head = (root / "tools" / f"head-{game}.html").read_text(encoding="utf-8").replace("{{SITE_URL}}", site)
    page = (root / game / "game.html").read_text(encoding="utf-8")
    page = re.sub(r"<title>.*?</title>\n", "", page, count=1)
    page = re.sub(r'<meta name="(viewport|apple-mobile-web-app-capable|mobile-web-app-capable)"[^>]*>\n', "", page)
    (root / game / "index.html").write_text(head + page + "\n</body>\n</html>\n", encoding="utf-8")
    for b in buckets:
        d = root / game / "c" / str(b); d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(range_page(b, name, site, site, "../../"), encoding="utf-8")
    if game == "gordon-beach-run":
        for b in buckets:
            old = root / "c" / str(b); old.mkdir(parents=True, exist_ok=True)
            (old / "index.html").write_text(range_page(b, name, root_url, site, "../../gordon-beach-run/"), encoding="utf-8")

streets = (root / "tools" / "streets.html").read_text(encoding="utf-8").replace("{{ROOT_URL}}", root_url)
(root / "index.html").write_text(streets, encoding="utf-8")
print("built Streets home and", len(GAMES), "games for", root_url)
