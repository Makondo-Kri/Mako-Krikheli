// Builds the share picture: Ben-Gurion running on the beach, the player's name and score.
// Plain objects instead of JSX, so no build step is needed.
const h = (type, style, children) => ({ type, props: { style, children } });

const HEBREW = /[֐-׿]/;
const LATIN_OR_DIGIT = /[A-Za-z0-9]/;
// The picture library lays text out left to right only. Hebrew-only text is
// reversed by hand so it reads correctly; mixed text is left as typed.
function visual(text) {
  if (HEBREW.test(text) && !LATIN_OR_DIGIT.test(text)) return [...text].reverse().join("");
  return text;
}

export function cleanNick(v) {
  return (v || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
}
export function cleanScore(v) {
  const n = parseInt(v, 10);
  return n > 0 && n <= 30000 ? n : 0;
}

// mode "score": name + score (shared runs); "range": score range only; "play": game preview; "streets": platform preview
// game: "gordon" (Gordon Beach Run) or "golda" (Golda's Kitchen)
export const GAMES = {
  gordon: { title: "GORDON BEACH RUN", he: "ריצה בחוף גורדון", place: "Tel Aviv, 1957", line: "Ben-Gurion races to Frishman Beach", path: "gordon-beach-run", name: "Gordon Beach Run" },
  golda: { title: "GOLDA'S KITCHEN", he: "המטבח של גולדה", place: "Shuk HaCarmel, 1970", line: "Golda races home with the cake", path: "golda-kitchen", name: "Golda's Kitchen" },
};
export function gameOf(v) { return GAMES[v] ? v : "gordon"; }

export function card({ score = 0, nick = "", art, mode = "score", game = "gordon" }) {
  const G = GAMES[gameOf(game)];
  if (mode === "play" || mode === "streets") return poster({ art, mode, G });
  const shown = !score ? "?" : score.toLocaleString("en-US") + (mode === "range" ? "+" : "");
  const nameFont = nick.length > 11 || (!nick && mode === "range") ? 54 : 66;
  return h("div", { width: 1200, height: 630, display: "flex", position: "relative", background: "#3fb4ee", fontFamily: "Rubik" }, [
    { type: "img", props: { src: art, width: 1200, height: 600, style: { position: "absolute", left: -250, top: 30 } } },
    h("div", { position: "absolute", left: 0, top: 0, width: 1200, height: 118, background: "rgba(12,58,90,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, [
      h("div", { fontFamily: "PressStart", fontSize: 26, color: "#ffd23f", letterSpacing: 4 }, "STREETS"),
      h("div", { fontFamily: "PressStart", fontSize: 40, color: "#ffffff", marginTop: 12 }, G.title),
    ]),
    h("div", { position: "absolute", left: 640, top: 150, width: 510, height: 320, background: "#12304a", display: "flex" }, []),
    h("div", { position: "absolute", left: 628, top: 140, width: 510, height: 320, background: "#f6e3bb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }, [
      h("div", { fontSize: nameFont, color: "#12304a", fontWeight: 800, maxWidth: 470, overflow: "hidden" }, visual(nick || (mode === "range" ? "Score to beat" : "Ben-Gurion fan"))),
      h("div", { fontSize: 30, color: "#b0461f", fontWeight: 800, marginTop: 14 }, "SCORE · " + visual("ניקוד")),
      h("div", { fontFamily: "PressStart", fontSize: score >= 10000 ? 64 : 76, color: "#12304a", marginTop: 18 }, shown),
    ]),
    h("div", { position: "absolute", left: 70, top: 522, width: 1080, height: 92, background: "#12304a", display: "flex" }, []),
    h("div", { position: "absolute", left: 60, top: 512, width: 1080, height: 92, background: "#ff6a3d", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 40, fontWeight: 800 }, [
      h("div", {}, "Can you beat my score?"),
      h("div", { color: "#ffd23f", margin: "0 22px" }, "·"),
      h("div", {}, visual("תצליחו לעקוף אותי?")),
    ]),
  ]);
}

// Previews without a score: the game itself, or the Streets platform
function poster({ art, mode, G }) {
  const streets = mode === "streets";
  return h("div", { width: 1200, height: 630, display: "flex", position: "relative", background: "#3fb4ee", fontFamily: "Rubik" }, [
    { type: "img", props: { src: art, width: 1200, height: 600, style: { position: "absolute", left: -250, top: 30 } } },
    h("div", { position: "absolute", left: 0, top: 0, width: 1200, height: streets ? 170 : 118, background: "rgba(12,58,90,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
      streets
        ? [h("div", { fontFamily: "PressStart", fontSize: 76, color: "#ffd23f", letterSpacing: 10 }, "STREETS"),
           h("div", { fontSize: 32, color: "#ffffff", fontWeight: 800, marginTop: 14 }, "Retro games on real streets · " + visual("משחקי רטרו ברחובות אמיתיים"))]
        : [h("div", { fontFamily: "PressStart", fontSize: 26, color: "#ffd23f", letterSpacing: 4 }, "STREETS"),
           h("div", { fontFamily: "PressStart", fontSize: 40, color: "#ffffff", marginTop: 12 }, G.title)]),
    h("div", { position: "absolute", left: 640, top: streets ? 210 : 160, width: 510, height: 260, background: "#12304a", display: "flex" }, []),
    h("div", { position: "absolute", left: 628, top: streets ? 200 : 150, width: 510, height: 260, background: "#f6e3bb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }, [
      h("div", { fontSize: 30, color: "#b0461f", fontWeight: 800 }, streets ? "NOW PLAYING" : G.place),
      h("div", { fontSize: streets ? 46 : 54, color: "#12304a", fontWeight: 800, marginTop: 10 }, streets ? "Gordon Beach Run · Golda's Kitchen" : visual(G.he)),
      h("div", { fontSize: 24, color: "#3b4a58", fontWeight: 800, marginTop: 12 }, streets ? "Two free retro games, more coming" : G.line),
    ]),
    h("div", { position: "absolute", left: 70, top: 522, width: 1080, height: 92, background: "#12304a", display: "flex" }, []),
    h("div", { position: "absolute", left: 60, top: 512, width: 1080, height: 92, background: "#ff6a3d", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 44, fontWeight: 800 }, [
      h("div", {}, "PLAY FREE"),
      h("div", { color: "#ffd23f", margin: "0 22px" }, "·"),
      h("div", {}, visual("שחקו בחינם")),
    ]),
  ]);
}
