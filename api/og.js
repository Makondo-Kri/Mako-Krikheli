// Picture for a shared score: /api/og?s=4850&n=Mako&g=golda  (1200x630 PNG; g is gordon, golda or tour)
import { ImageResponse } from "@vercel/og";
import { card, cleanNick, cleanScore, gameOf } from "./_card.js";

export const config = { runtime: "edge" };

const rubik = fetch(new URL("./_fonts/Rubik-ExtraBold.ttf", import.meta.url)).then((r) => r.arrayBuffer());
const pixel = fetch(new URL("./_fonts/PressStart2P.ttf", import.meta.url)).then((r) => r.arrayBuffer());
const arts = {
  gordon: fetch(new URL("./_assets/share-art.png", import.meta.url)).then((r) => r.arrayBuffer()),
  golda: fetch(new URL("./_assets/golda-art.png", import.meta.url)).then((r) => r.arrayBuffer()),
  tour: fetch(new URL("./_assets/tour-art.png", import.meta.url)).then((r) => r.arrayBuffer()),
};

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export default async function handler(req) {
  const q = new URL(req.url).searchParams;
  const score = cleanScore(q.get("s"));
  const nick = cleanNick(q.get("n"));
  const game = gameOf(q.get("g"));
  const [r, p, a] = await Promise.all([rubik, pixel, arts[game]]);
  return new ImageResponse(card({ score, nick, game, art: "data:image/png;base64," + toBase64(a) }), {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Rubik", data: r, weight: 800, style: "normal" },
      { name: "PressStart", data: p, weight: 400, style: "normal" },
    ],
    headers: { "cache-control": "public, max-age=31536000, immutable" },
  });
}
