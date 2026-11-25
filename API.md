# Những Con Cá Bị Trừ KPI: how it works

An internal "rebellion club" site. Members log in, answer one shared mission a day (that answer is one **log on the fire**), keep a personal streak and a group fire alive, and chat in a shared room.

## Layout

| Path | What |
|---|---|
| `public/` | Static frontend (`index.html`, `app.css`, `app.js`, `assets/`). No build step. |
| `server/app.mjs` | The whole API. |
| `server/store.mjs` | Storage: Netlify Blobs in production, JSON files in `./.data` locally. Supports conditional writes. |
| `server/quotes/*.mjs` | The quote bank (~1000), **server-only**. The client only ever receives today's quote. |
| `server/missions.mjs` | The daily missions (60). |
| `netlify/functions/api.mjs` | Netlify Function that mounts `server/app.mjs` at `/api/*`. |
| `dev-server.mjs` | Local server: `npm install && npm run dev`, then open http://localhost:8888 |

Optional env vars on Netlify: `HMN_TEAM_CODE` (registration requires this invite code) and `HMN_SECRET` (the token signing key; one is generated automatically if unset).

## Rules

- **Day** means the Vietnam calendar day (UTC+7). Quotes and missions rotate through a fixed shuffle, one per day, and nothing repeats until the whole bank has been used.
- **Personal streak**: consecutive days with an answer. Weekends never break it, and today doesn't break it until the day is over.
- **Group fire**: a day keeps the fire burning if at least `need = clamp(ceil(members / 3), 1, 6)` members answered (never more than the member count). If a **workday** ends below that, the fire **dies**: the streak goes back to 0, `deaths` goes up by one, and it has to be lit again from day 1. Weekends never kill it, and a weekend day with enough logs still adds a day.

## Endpoints

Every endpoint except `public`, `register` and `login` needs the header `Authorization: Bearer <token>`. Errors come back as `{ error }` with a message in Vietnamese that is safe to show to users. On a 401, send the user back to the login screen.

| Method & path | Body / query | Returns |
|---|---|---|
| `GET /api/public` | – | `{ today, quote, members, fire: { current, best, deaths, litToday, need, fuel } }`. No names (used on the login screen). |
| `POST /api/register` | `{ username, password, name?, avatar?, teamCode? }` | `{ token }` |
| `POST /api/login` | `{ username, password }` | `{ token }` (valid for 60 days) |
| `GET /api/state` | – | `State` |
| `POST /api/answer` | `{ date: state.today, text (2–180 chars), anon }` | `State`. Once per day; 409 if already answered or if `date` is stale. |
| `POST /api/react` | `{ id, emoji }` with emoji ∈ `😂 🤗 🔥 ✊ 💀` | `State`. Sending the same emoji again removes it. |
| `POST /api/profile` | `{ name?, avatar? }` | `State` |
| `GET /api/chat?after=<id>` | `after` is optional | `{ messages }` from today and yesterday, oldest first, at most 150. With `after`, only messages newer than that id. |
| `POST /api/chat` | `{ text (≤500 chars), image?: { data: base64, w, h } }` (text or image required) | `{ message }`; image messages carry `image: { id, w, h }`. The image must really be JPG/PNG/GIF/WebP (checked from its bytes, SVG refused) and at most 2 MB. The browser shrinks photos before upload. |
| `GET /api/img/<id>` | – | The image bytes. Requires login like everything else, so the frontend fetches with the auth header and displays the image through an object URL. |

`State` = `{ today, serverTime, quote: { no, of, text }, mission: { title, hint }, fire: { current, best, deaths, lastDeath, need, fuel, litToday, weekend, fuelers[] }, me: { …member, answer, week[] }, members[], answers[] }`.

User text is stored raw. The frontend inserts it with `textContent` only.
