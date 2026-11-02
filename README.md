# Gordon Beach Run · ריצה בחוף גורדון

A retro platform game for phones. Tel Aviv, 1957: help Ben-Gurion race from
Gordon Beach to Frishman Beach for his famous headstand. Hebrew and English,
an animated GIF to share in WhatsApp, and a leaderboard.

Play it in the browser, no install.

## Files

| File | What it is |
|---|---|
| `index.html` | The website page. **Built from `game.html`, don't edit it by hand.** |
| `game.html` | The game itself (same file as the claude.ai version). |
| `config.js` | Website address and leaderboard keys. |
| `og-image.png` | The picture WhatsApp / Facebook show when someone shares the link. |
| `favicon.png` | Browser tab icon. |
| `supabase-setup.sql` | Creates the leaderboard table. |
| `tools/build.py` | Rebuilds `index.html` after you change `game.html` or `config.js`. |

## 1. Put the website online (GitHub Pages, free)

1. On GitHub open **Makondo-Kri/Mako-Krikheli → Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Pick the branch that has these files (and the `/ (root)` folder), then **Save**.
4. After a minute or two the game is live at
   **https://makondo-kri.github.io/Mako-Krikheli/**

GitHub Pages needs the repository to be **public** on a free GitHub plan.

If you host it somewhere else (Netlify, your own domain), change `siteUrl` in
`config.js` to that address and run `python3 tools/build.py`, so link previews
point to the right place.

## 2. Turn on the leaderboard (Supabase, free)

1. Create a free account at **supabase.com** and click **New project**
   (any name, e.g. `gordon-beach-run`; pick a region close to Israel, e.g. Frankfurt).
2. In the project, open **SQL Editor → New query**, paste everything from
   `supabase-setup.sql`, and click **Run**.
3. Open **Project Settings → API** (or **Data API**) and copy:
   - **Project URL** → `supabaseUrl` in `config.js`
   - **anon public** key → `supabaseAnonKey` in `config.js`

   The anon key is meant to be public; the table rules only allow reading the
   board and adding new scores.
4. Commit the updated `config.js`. No rebuild needed for the keys.

With both values empty, the game simply hides the leaderboard.

### Looking after the board

- See and delete entries in Supabase → **Table Editor → scores** (for example
  rude nicknames).
- Scores are sent by the player's browser, so a determined person could post a
  fake score. Delete those in the Table Editor. If it becomes a problem, the
  next step is a small server-side check.

## 3. Changing the game

Edit `game.html`, then run:

```
python3 tools/build.py
```

and commit both `game.html` and `index.html`.

## Notes

- The real statue photo on the end card should be one you have the right to
  share. Replace it with your own photo if needed.
- The melody is the traditional Hava Nagila folk tune, played as chiptune.
