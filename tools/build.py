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
