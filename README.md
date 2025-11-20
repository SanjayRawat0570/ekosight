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
# Mini Trello Clone + Smart Recommendations

This workspace contains a minimal scaffold for a Trello-like app: a Next.js frontend and an Express backend using MongoDB.

Folders:
- `frontend` — Next.js app (React) UI and calls to the backend.
- `backend` — Node.js + Express API, Mongoose models, recommendations logic.

This is an initial scaffold to get started. See each folder's README for run instructions.# ekosight
