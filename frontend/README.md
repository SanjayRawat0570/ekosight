# Frontend (Next.js)

Run locally:

```powershell
cd frontend
npm install
npm run dev
```

By default the frontend expects the backend URL to be set via `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

Examples:
- Local development: `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Live backend (Render): `NEXT_PUBLIC_API_URL=https://ekosight.onrender.com` (already set in `frontend/.env.local`)

Notes:
- The frontend supports registration and login. After login the JWT token is stored in `localStorage` and used for protected API requests.
- Open `http://localhost:3000` to use the UI in development. Create a board and then open it to manage lists/cards and view recommendations.

Architecture (in plain English)
- The frontend is a small Next.js React app. Pages are server/client rendered where appropriate; it uses an Axios wrapper (`utils/api.js`) to call the backend API and automatically attaches the JWT from `localStorage`.

Database/schema note
- The frontend does not store databases itself — it reads/writes via the backend API. The backend exposes boards that include lists and cards in each board object.

Features (short)
- Register and login (JWT saved to `localStorage`)
- Create and list boards
- Open a board to add lists and cards
- Move cards between lists and set due dates
- Recommendations panel: suggested due dates, suggested list moves, and related card groups

How recommendations work (short)
- The frontend requests `/api/recommendations/:boardId`. The backend analyzes card titles/descriptions and returns structured suggestions (suggested due dates, suggested list moves, a confidence score and reason, and related-card groups). The UI shows these suggestions and allows applying them (which calls the backend to update the card).

Troubleshooting
- If you get `Network Error` in the browser, confirm the backend URL in `frontend/.env.local` and that the backend is reachable (try `curl https://ekosight.onrender.com/api/boards`).

