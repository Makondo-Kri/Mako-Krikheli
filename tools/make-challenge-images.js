// Draws the challenge preview pictures (c/<range>/og.png) from the game's own art.
// Needs Node and Playwright:  node tools/make-challenge-images.js
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const root = path.resolve(__dirname, "..");
const BUCKETS = [];
for (let s = 0; s < 10000; s += 250) BUCKETS.push(s);
for (let s = 10000; s <= 20000; s += 1000) BUCKETS.push(s);

(async () => {
  const src = fs.readFileSync(path.join(root, "game.html"), "utf8")
    .replace(/^applyLang\(\);$/m, "applyLang(); window.__drawArt = drawArt;");
  const tmp = path.join(os.tmpdir(), "gbr-images.html");
  fs.writeFileSync(tmp, src);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + tmp);
  await page.waitForTimeout(1200);
  const images = await page.evaluate(async (buckets) => {
    await document.fonts.ready;
    const out = {};
    const art = document.createElement("canvas"); art.width = 1200; art.height = 600; window.__drawArt(art, "hs");
    for (const b of buckets) {
      const W = 1200, H = 630, c = document.createElement("canvas"); c.width = W; c.height = H; const k = c.getContext("2d");
      k.fillStyle = "#3fb4ee"; k.fillRect(0, 0, W, H); k.imageSmoothingEnabled = false; k.drawImage(art, -230, 30);
      k.fillStyle = "rgba(12,58,90,.92)"; k.fillRect(0, 0, W, 120);
      k.textAlign = "center"; k.fillStyle = "#ffffff"; k.font = "46px 'Press Start 2P'"; k.fillText("GORDON BEACH RUN", W / 2, 68);
      k.fillStyle = "#ffd23f"; k.font = "800 34px Rubik"; k.direction = "rtl"; k.fillText("ריצה בחוף גורדון", W / 2, 108); k.direction = "ltr";
      // score card on the right
      k.fillStyle = "#12304a"; k.fillRect(640, 158, 520, 300); k.fillStyle = "#f6e3bb"; k.fillRect(630, 148, 520, 300);
      k.fillStyle = "#b0461f"; k.font = "800 36px Rubik"; k.fillText("SCORE · ניקוד", 890, 210);
      k.fillStyle = "#12304a"; k.font = (b >= 10000 ? "70px" : "84px") + " 'Press Start 2P'";
      k.fillText(b === 0 ? "?" : b.toLocaleString("en-US") + "+", 890, 330);
      k.fillStyle = "#3b4a58"; k.font = "600 28px Rubik"; k.fillText("Ben-Gurion's 1957 headstand", 890, 405);
      // challenge banner
      k.fillStyle = "#12304a"; k.fillRect(70, 522, 1080, 92); k.fillStyle = "#ff6a3d"; k.fillRect(60, 512, 1080, 92);
      k.fillStyle = "#ffffff"; k.font = "800 40px Rubik";
      k.direction = "ltr"; k.textAlign = "center"; k.fillText("Can you beat my score?", 340, 572);
      k.fillStyle = "#ffd23f"; k.fillText("·", 640, 572); k.fillStyle = "#ffffff";
      k.direction = "rtl"; k.fillText("תצליחו לעקוף אותי?", 890, 572); k.direction = "ltr";
      out[b] = c.toDataURL("image/png");
    }
    return out;
  }, BUCKETS);
  for (const [b, url] of Object.entries(images)) {
    const dir = path.join(root, "c", String(b)); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "og.png"), Buffer.from(url.split(",")[1], "base64"));
  }
  await browser.close();
  console.log("made", Object.keys(images).length, "challenge pictures");
})();
