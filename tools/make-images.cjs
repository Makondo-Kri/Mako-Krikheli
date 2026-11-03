// Draws every ready-made picture from the game's own art:
//   api/_assets/share-art.png, golda-art.png   backgrounds for the picture server
//   <game>/og-image.png                         game link previews
//   <game>/c/<range>/og.png                     score-range previews (used on GitHub Pages)
//   streets-og.png                         Streets home preview
//   <game>/favicon.png, favicon.png
// Needs Node, Playwright and the packages from package.json:
//   npm install && node tools/make-images.cjs
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const root = path.resolve(__dirname, "..");
const BUCKETS = [];
for (let s = 0; s < 10000; s += 250) BUCKETS.push(s);
for (let s = 10000; s <= 20000; s += 1000) BUCKETS.push(s);

async function sceneOf(browser, game) {
  const src = fs.readFileSync(path.join(root, game, "game.html"), "utf8")
    .replace(/^applyLang\(\);$/m, "applyLang(); window.__drawArt = drawArt; window.__setFrame = f => { frame = f; };");
  const tmp = path.join(os.tmpdir(), "streets-" + game + ".html");
  fs.writeFileSync(tmp, src);
  const page = await browser.newPage();
  await page.goto("file://" + tmp);
  await page.waitForTimeout(1000);
  const out = await page.evaluate(() => {
    window.__setFrame(8);
    const c = document.createElement("canvas"); c.width = 1200; c.height = 600; window.__drawArt(c, "run");
    const f = document.createElement("canvas"); f.width = 64; f.height = 64; const k = f.getContext("2d");
    k.imageSmoothingEnabled = false; k.drawImage(c, 430, 140, 300, 300, 0, 0, 64, 64);
    return [c.toDataURL("image/png"), f.toDataURL("image/png")];
  });
  await page.close();
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const png = (u) => Buffer.from(u.split(",")[1], "base64");
  const [gordonArt, gordonIcon] = await sceneOf(browser, "gordon-beach-run");
  const [goldaArt, goldaIcon] = await sceneOf(browser, "golda-kitchen");
  const [tourArt, tourIcon] = await sceneOf(browser, "golda-tour");
  await browser.close();
  fs.writeFileSync(path.join(root, "api", "_assets", "share-art.png"), png(gordonArt));
  fs.writeFileSync(path.join(root, "api", "_assets", "golda-art.png"), png(goldaArt));
  fs.writeFileSync(path.join(root, "gordon-beach-run", "favicon.png"), png(gordonIcon));
  fs.writeFileSync(path.join(root, "golda-kitchen", "favicon.png"), png(goldaIcon));
  fs.writeFileSync(path.join(root, "api", "_assets", "tour-art.png"), png(tourArt));
  fs.writeFileSync(path.join(root, "golda-tour", "favicon.png"), png(tourIcon));
  fs.writeFileSync(path.join(root, "favicon.png"), png(gordonIcon));

  const { ImageResponse } = await import("@vercel/og");
  const { card } = await import(path.join(root, "api", "_card.js"));
  const fonts = [
    { name: "Rubik", data: fs.readFileSync(path.join(root, "api", "_fonts", "Rubik-ExtraBold.ttf")), weight: 800, style: "normal" },
    { name: "PressStart", data: fs.readFileSync(path.join(root, "api", "_fonts", "PressStart2P.ttf")), weight: 400, style: "normal" },
  ];
  const draw = async (props, file) => {
    const res = new ImageResponse(card(props), { width: 1200, height: 630, fonts });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  };
  await draw({ art: gordonArt, mode: "streets" }, path.join(root, "streets-og.png"));
  let n = 1;
  for (const [game, key, art] of [["gordon-beach-run", "gordon", gordonArt], ["golda-kitchen", "golda", goldaArt], ["golda-tour", "tour", tourArt]]) {
    await draw({ art, game: key, mode: "play" }, path.join(root, game, "og-image.png"));
    for (const b of BUCKETS) await draw({ art, game: key, mode: "range", score: b }, path.join(root, game, "c", String(b), "og.png"));
    n += 1 + BUCKETS.length;
  }
  console.log("made", n, "previews");
})();
