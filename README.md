# Streets

Free retro games set on real streets and beaches, played in the phone's browser.

**Now playing:** Gordon Beach Run. The two Golda games are hidden from the home page for now
(their folders stay in the repo; to bring one back, un-comment its card in `tools/streets.html`).

**Games in the repo**

- **Gordon Beach Run · ריצה בחוף גורדון.** Tel Aviv, 1957: help Ben-Gurion race
  from Gordon Beach to Frishman Beach (level 1), then along the promenade to the
  Jaffa clock tower (level 2).
- **Golda's Kitchen · המטבח של גולדה.** Tel Aviv, 1970: Golda Meir's cabinet meets
  at her kitchen table, and you, the newest minister, have to bake her famous cake.
- **Golda's $50 Million · 50 המיליון של גולדה.** America, 1948: plan Golda Meir's
  fundraising tour and win over every hall to raise $50 million for the state on the way.

All are in Hebrew and English, with an animated GIF to share, a leaderboard,
and challenge links that show the player's name and score.

## Files

| Path | What it is |
|---|---|
| `index.html` | Streets home page. **Built, don't edit by hand** (edit `tools/streets.html`). |
| `gordon-beach-run/game.html` | The game itself (same file as the claude.ai version). |
| `gordon-beach-run/index.html` | The game page. **Built from `game.html`.** |
| `gordon-beach-run/config.js` | Game address and leaderboard keys. |
| `gordon-beach-run/c/` | Score-range preview pages (used when hosted on GitHub Pages). |
| `golda-kitchen/` | Golda's Kitchen: same layout (`game.html`, built `index.html`, `config.js`, `c/`). |
| `golda-tour/` | Golda's $50 Million: same layout. |
| `tools/head-<game>.html` | Each game page's head (title and link-preview tags). |
| `api/og.js` | Picture server: draws the share picture with the player's name and score. |
| `api/c.js` | Challenge link page that WhatsApp / Facebook read, then sends people to the game. |
| `api/_card.js`, `api/_fonts`, `api/_assets` | Picture layout, fonts and the beach scene. |
| `supabase-setup.sql` | Creates the Gordon Beach Run leaderboard table (`scores`). |
| `supabase-golda.sql` | Creates the Golda's Kitchen leaderboard table (`golda_scores`). |
| `supabase-golda-tour.sql` | Creates the Golda's $50 Million leaderboard table (`golda_tour_scores`). |
| `tools/build.py` | Rebuilds `index.html` pages and the score pages. |
| `tools/make-images.cjs` | Redraws all ready-made preview pictures. |

## Hosting

### Vercel (recommended: share pictures show the player's name)

1. Go to **vercel.com** and sign up with **Continue with GitHub**.
2. **Add New → Project**, find **Mako-Krikheli**, tap **Import**.
3. Leave the settings as they are (Framework: *Other*, no build command) and tap **Deploy**.
4. In the new project, **Settings → General → Project Name**, you can rename it to
   `streets` so the address becomes something like `streets.vercel.app`
   (if that name is taken, Vercel adds letters).

Vercel publishes the branch that is the repository's default branch, and
re-publishes automatically on every push.

On Vercel, the games' share links go to `/api/c?s=<score>&n=<name>&g=<game>`
(`g=gordon`, `g=golda` or `g=tour`), so the WhatsApp preview shows the player's name and
exact score.

### GitHub Pages (also works, simpler pictures)

Settings → Pages → Deploy from a branch → this branch, `/ (root)`. Address:
https://makondo-kri.github.io/Mako-Krikheli/

GitHub Pages can't draw pictures on demand, so share previews show the score
range (for example "4,750+") without the name.

## Leaderboards (Supabase)

Gordon Beach Run uses the `scores` table (already set up). Golda's Kitchen uses
its own `golda_scores` table (run `supabase-golda.sql` once in Supabase →
SQL Editor), and Golda's $50 Million uses `golda_tour_scores` (`supabase-golda-tour.sql`). The keys are in each game's `config.js`. To check or tidy the board:
Supabase → **Table Editor → scores** (delete rude nicknames or fake scores
there). To set it up again from scratch, run `supabase-setup.sql` in the
Supabase SQL Editor and put the **Project URL** and the **publishable** key
(`sb_publishable_...`) in `config.js`.

Scores are sent by the player's browser, so a determined person could post a
fake score.

## Changing things

- A game: edit `<game>/game.html`, then run `python3 tools/build.py`.
- Home page: edit `tools/streets.html`, then run `python3 tools/build.py`.
- Pictures: `npm install && node tools/make-images.cjs` (needs Playwright).

Commit the built files too.

## Notes

- The real statue photo on Gordon Beach Run's end card should be one you have the
  right to share. Replace it with your own photo if needed.
- Gordon Beach Run plays the traditional Hava Nagila folk tune as chiptune; Golda's Kitchen plays the traditional pioneer song Zum Gali Gali (written from memory, not checked against a printed score).
