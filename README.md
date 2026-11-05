# Daily

A personal iPhone-style app to track **weight**, **water**, and **Spanish goals**, with an **offline library of 600+ articles** (sleep, health, nutrition, water, habits, fitness, Spanish, science, space, history, nature, tech, psychology, places, culture, curiosities, life skills).

It's a web app (PWA): no App Store, no account, free hosting on GitHub Pages. Your data stays on your phone.

## 1. Put it on GitHub

1. Sign in at github.com → tap **+** → **New repository**.
2. Name it `daily`, set it to **Public**, tap **Create repository**.
3. On the new repo page tap **uploading an existing file** (or **Add file → Upload files**).
4. Select **all** the files in this folder (index.html, styles.css, app.js, articles.js, sw.js, manifest.webmanifest, the three icon PNGs, README.md) → **Commit changes**.

## 2. Turn on GitHub Pages

1. In the repo: **Settings → Pages**.
2. Under **Build and deployment → Source**, pick **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait 1–2 minutes. Your app lives at `https://YOUR-USERNAME.github.io/daily/`

## 3. Add it to your iPhone home screen

1. Open that link in **Safari**.
2. Tap the **Share** button → **Add to Home Screen**.
3. Keep **Open as Web App** switched on → **Add**.
4. Open **Daily** from your home screen — it runs full-screen like a normal app.

## 4. Download your articles (one time)

On Wi‑Fi, open the **Read** tab → **Download Library**. Keep the app open for a minute or two while it saves everything. After that every article works with no internet.

Articles come from Wikipedia (CC BY-SA 4.0); each one links to its source.

## Tips

- **Back up** now and then: Summary → ⚙︎ → Export data → Copy, and paste it into Notes.
- **Change the article list:** edit `articles.js` — any English Wikipedia page title works. Then in the app: ⚙︎ → Download missing articles.
- **After editing any file**, change `daily-v1` in `sw.js` to `daily-v2` (and so on) so your phone picks up the update. Close and reopen the app twice.
