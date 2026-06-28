# ChowdaQuest V1

GitHub-ready static prototype for ChowdaQuest RI.

## Files

- `index.html` — homepage
- `src/styles.css` — all visual styling
- `src/app.js` — prototype interactivity
- `data/restaurants.json` — seed restaurant data
- `assets/chowder-hero.png` — Chowder hero artwork

## Run locally

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Deploy on Netlify from GitHub

1. Create a GitHub repo named `chowdaquest`.
2. Upload these files.
3. In Netlify: Add new site → Import existing project → GitHub.
4. Build command: leave blank.
5. Publish directory: `.`
6. Deploy.

## Connect chowdaquest.com

In Netlify:

```text
Site settings → Domain management → Add domain → chowdaquest.com
```

Then add the DNS records Netlify gives you inside WordPress domain DNS.

## Future backend plan

- Supabase Auth for login
- Supabase Postgres for restaurants/reviews
- Supabase Storage for photos
- Netlify for frontend hosting
- WordPress only for domain/DNS
