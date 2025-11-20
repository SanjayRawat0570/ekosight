# Frontend (Next.js)

Run locally:

```powershell
cd frontend
npm install
npm run dev
```

By default the frontend expects the backend at `http://localhost:4000`. You can set `NEXT_PUBLIC_API_URL` to change that.

Notes:
- The frontend supports registration and login. After login the JWT token is stored in `localStorage` and used for protected API requests.
- Open `http://localhost:3000` to use the UI. Create a board and then open it to manage lists/cards and view recommendations.
