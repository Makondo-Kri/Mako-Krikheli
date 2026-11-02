// Draws every ready-made picture from the game's own art:
//   api/_assets/share-art.png              background for the picture server
//   gordon-beach-run/og-image.png          game link preview
//   gordon-beach-run/c/<range>/og.png      score-range previews (used on GitHub Pages)
//   streets-og.png                         Streets home preview
//   gordon-beach-run/favicon.png, favicon.png
// Needs Node, Playwright and the packages from package.json:
//   npm install && node tools/make-images.cjs
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const root = path.resolve(__dirname, "..");
const BUCKETS = [];
for (let s = 0; s < 10000; s += 250) BUCKETS.push(s);
for (let s = 10000; s <= 20000; s += 1000) BUCKETS.push(s);

(async () => {
  // 1. the opening scene (Ben-Gurion running on the beach) and a favicon, from the game itself
  const src = fs.readFileSync(path.join(root, "gordon-beach-run", "game.html"), "utf8")
    .replace(/^applyLang\(\);$/m, "applyLang(); window.__drawArt = drawArt; window.__setFrame = f => { frame = f; };");
  const tmp = path.join(os.tmpdir(), "streets-images.html");
  fs.writeFileSync(tmp, src);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + tmp);
  await page.waitForTimeout(1000);
  const [art, icon] = await page.evaluate(() => {
    window.__setFrame(8);
    const c = document.createElement("canvas"); c.width = 1200; c.height = 600; window.__drawArt(c, "run");
    const f = document.createElement("canvas"); f.width = 64; f.height = 64; const k = f.getContext("2d");
    k.imageSmoothingEnabled = false; k.drawImage(c, 430, 140, 300, 300, 0, 0, 64, 64);
    return [c.toDataURL("image/png"), f.toDataURL("image/png")];
  });
  await browser.close();
  const png = (u) => Buffer.from(u.split(",")[1], "base64");
  fs.writeFileSync(path.join(root, "api", "_assets", "share-art.png"), png(art));
  fs.writeFileSync(path.join(root, "gordon-beach-run", "favicon.png"), png(icon));
  fs.writeFileSync(path.join(root, "favicon.png"), png(icon));

  // 2. the previews, drawn with the same template as the picture server
  const { ImageResponse } = await import("@vercel/og");
  const { card } = await import(path.join(root, "api", "_card.js"));
  const fonts = [
    { name: "Rubik", data: fs.readFileSync(path.join(root, "api", "_fonts", "Rubik-ExtraBold.ttf")), weight: 800, style: "normal" },
    { name: "PressStart", data: fs.readFileSync(path.join(root, "api", "_fonts", "PressStart2P.ttf")), weight: 400, style: "normal" },
  ];
  const draw = async (props, file) => {
    const res = new ImageResponse(card({ art, ...props }), { width: 1200, height: 630, fonts });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  };
  await draw({ mode: "play" }, path.join(root, "gordon-beach-run", "og-image.png"));
  await draw({ mode: "streets" }, path.join(root, "streets-og.png"));
  for (const b of BUCKETS) await draw({ mode: "range", score: b }, path.join(root, "gordon-beach-run", "c", String(b), "og.png"));
  console.log("made", BUCKETS.length + 2, "previews");
})();
