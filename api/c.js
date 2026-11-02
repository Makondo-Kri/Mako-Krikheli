// Challenge link: /api/c?s=4850&n=Mako
// WhatsApp / Facebook read the preview tags here (picture with the name and score),
// people are sent straight on to the game, which shows the score to beat.
import { cleanNick, cleanScore } from "./_card.js";

export const config = { runtime: "edge" };

const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default function handler(req) {
  const url = new URL(req.url);
  const score = cleanScore(url.searchParams.get("s"));
  const nick = cleanNick(url.searchParams.get("n"));
  const query = "?s=" + score + (nick ? "&n=" + encodeURIComponent(nick) : "");
  const picture = url.origin + "/api/og" + query;
  const game = url.origin + "/gordon-beach-run/" + query;
  const shown = score.toLocaleString("en-US");
  const title = !score
    ? "Gordon Beach Run: can you beat my score? · תצליחו לעקוף אותי?"
    : nick
      ? `${nick} scored ${shown} in Gordon Beach Run. Can you beat it? · תצליחו לעקוף?`
      : `I scored ${shown} in Gordon Beach Run. Can you beat me? · תצליחו לעקוף אותי?`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="Streets · Gordon Beach Run: help Ben-Gurion race down the Tel Aviv shore. A free retro game for your phone.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Streets">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="Streets · Gordon Beach Run: a free retro game for your phone. ריצה בחוף גורדון">
<meta property="og:url" content="${esc(url.origin + "/api/c" + query)}">
<meta property="og:image" content="${esc(picture)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(picture)}">
<meta http-equiv="refresh" content="0; url=${esc(game)}">
<script>location.replace(${JSON.stringify(game)});</script>
</head>
<body style="background:#0c3a5a;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:40px 16px">
<p><a href="${esc(game)}" style="color:#ffd23f">Play Gordon Beach Run · שחקו</a></p>
</body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
