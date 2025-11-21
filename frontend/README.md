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
