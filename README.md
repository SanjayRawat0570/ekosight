# Mini Trello Clone + Smart Recommendations

This workspace contains a minimal Trello-like app scaffold: a Next.js frontend and an Express backend using MongoDB.

Folders:
- `frontend` — Next.js app (React) UI and calls to the backend.
- `backend` — Node.js + Express API, Mongoose models, authentication, and recommendations logic.

Quick start (PowerShell):

```powershell
# Start backend
cd backend
copy .env.example .env
npm install
npm run dev

# In a separate terminal, start frontend
cd ..\frontend
npm install
npm run dev
```

Frontend expects backend at `http://localhost:4000` by default. Set `NEXT_PUBLIC_API_URL` to change.

See `backend/README.md` and `frontend/README.md` for more details.

Environment / live DB notes:
- Place your live MongoDB connection string in `backend/.env` as `MONGODB_URI` (do not put DB URIs in frontend env files).
- The frontend should only know the backend API URL via `NEXT_PUBLIC_API_URL` (for example in `frontend/.env.local`).

Run both frontend and backend together from the repository root:

```powershell
cd c:\Users\ftt\Desktop\Ekosight
npm install
npm run dev
```

This will install the root `devDependencies` (used to run both services concurrently) and start both the backend (`http://localhost:4000`) and frontend (`http://localhost:3000`).
# Mini Trello Clone + Smart Recommendations

This workspace contains a minimal scaffold for a Trello-like app: a Next.js frontend and an Express backend using MongoDB.

Folders:
- `frontend` — Next.js app (React) UI and calls to the backend.
- `backend` — Node.js + Express API, Mongoose models, recommendations logic.

