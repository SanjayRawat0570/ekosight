# Backend (Express + MongoDB)

Run locally:

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install dependencies:

```powershell
cd backend; npm install
```

3. Start dev server:

```powershell
npm run dev
```

API endpoints:
- `POST /api/boards` - create board
- `GET /api/boards` - list boards
- `GET /api/boards/:id` - get board
- `POST /api/boards/:id/lists` - add list
- `POST /api/boards/:id/cards` - add card
- `GET /api/recommendations/:boardId` - get recommendations for a board

Environment / live DB notes:
- The backend reads the database connection from `backend/.env` using the `MONGODB_URI` variable. If you provided a live connection string in `backend/.env`, the server will use that when it starts.
- Do NOT commit your `backend/.env` file; it is ignored by `.gitignore` to avoid exposing credentials.

Authentication endpoints:
- `POST /api/auth/register` - register { email, password, name }
- `POST /api/auth/login` - login { email, password }

Protected endpoints (require `Authorization: Bearer <token>`):
- `POST /api/boards` - create board
- `POST /api/boards/:id/lists` - add list
- `POST /api/boards/:id/cards` - add card
- `PATCH /api/boards/:id/cards/:cardId` - update/move card
- `POST /api/boards/:id/invite` - invite member by email

