# Backend (Express + MongoDB)

This document describes how to run the backend, the API surface, a short architecture overview, the database schema, and notes about the live deployment.

Live backend
- Demo / production backend URL: `https://ekosight.onrender.com`
- 

```bash
curl https://ekosight.onrender.com/api/boards
curl https://ekosight.onrender.com/api/recommendations/<boardId>
```

Quick start (local)

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.

```powershell
cd backend
npm install
npm run dev
```

You should see a masked connection message and then "Connected to MongoDB" and the backend listen message.

API endpoints (summary)
- `POST /api/auth/register` — register { email, password, name }
- `POST /api/auth/login` — login { email, password }
- `GET /api/boards` — list boards
- `POST /api/boards` — create board (requires `Authorization: Bearer <token>`)
- `GET /api/boards/:id` — fetch board details (lists, cards, members)
- `POST /api/boards/:id/lists` — add list to board (auth)
- `POST /api/boards/:id/cards` — add card to list (auth)
- `PATCH /api/boards/:id/cards/:cardId` — update card (move, set due date) (auth)
- `POST /api/boards/:id/invite` — invite member by email (adds to `board.members`) (auth)
- `GET /api/recommendations/:boardId` — get recommendations for a board
- `GET /api/recommendations/:boardId/debug` — debug output (tokenization, detected matches)

Security
- Protected endpoints require a JWT in the `Authorization: Bearer <token>` header. Tokens are issued by `/api/auth/login` and `/api/auth/register`.

Architecture :
- The backend is a small Express application that stores boards, lists, and cards in MongoDB using Mongoose. Authentication is handled with JWT tokens. The recommendations feature runs on the server: it analyzes card titles and descriptions and returns suggested due dates, suggested list movements, and related card groups.

Database schema (overview)
- The demo uses a single `Board` collection. Each `Board` document contains:
  - `title` (string)
  - `lists` (array) — embedded list objects: { title, position }
  - `cards` (array) — embedded card objects: { title, description, list, labels, dueDate, createdAt }
  - `members` (array) — member emails (simple collaboration)

Design note: embedding lists and cards makes the demo simple and lets the UI fetch a board with lists and cards in a single request. For production-scale apps, you might normalize cards/lists into their own collections.

Recommendation logic (short)
- Uses `chrono-node` to parse natural-language dates where possible (e.g., "tomorrow", "next Friday", "in 3 days").
- Falls back to keyword heuristics for urgency and relative dates ("urgent", "today", "tomorrow").
- Suggests list moves when it detects progress/completion/review keywords ("started" → "In Progress", "done" → "Done", "review" → "Review").
- Finds related cards by token overlap (Jaccard-like score) and label overlap to recommend grouping.

Features (concise)
- Authentication: register and login (JWT)
- Boards: create and list boards
- Lists: add lists inside boards
- Cards: add cards (title/description/labels/dueDate) and update cards (move, set due date)
- Collaboration (mini): invite member by email (adds to board members list)
- Smart Recommendations: for each board, server provides suggested due dates, suggested list moves, and related-card groups



```bash
curl https://ekosight.onrender.com/api/boards
```



Quick start 

1. Copy .env and set `MONGODB_URI` and `JWT_SECRET`.

```powershell
cd backend
npm install
npm run dev
```



API endpoints (summary)
- `POST /api/auth/register` — register { email, password, name }
- `POST /api/auth/login` — login { email, password }
- `GET /api/boards` — list boards
- `POST /api/boards` — create board (requires `Authorization: Bearer <token>`)
- `GET /api/boards/:id` — fetch board details (lists, cards, members)
- `POST /api/boards/:id/lists` — add list to board (auth)
- `POST /api/boards/:id/cards` — add card to list (auth)
- `PATCH /api/boards/:id/cards/:cardId` — update card (move, set due date) (auth)
- `POST /api/boards/:id/invite` — invite member by email (adds to `board.members`) (auth)
- `GET /api/recommendations/:boardId` — get recommendations for a board
- `GET /api/recommendations/:boardId/debug` — debug output (tokenization, detected matches)



Architecture 
- The backend is a small Express app that stores boards, lists and cards in MongoDB using Mongoose. Authentication is handled by JWTs. Recommendation logic is implemented server‑side: the recommendations endpoint analyzes card text to suggest due dates, list moves, and related cards.

Database schema 
- `Board` (single collection) — stores:
  - `title`: string
  - `lists`: array of embedded list objects { title, position }
  - `cards`: array of embedded card objects { title, description, list, labels, dueDate, createdAt }
  - `members`: array of member emails (simple collaboration model)

Rationale: embedding lists and cards inside `Board` keeps the demo simple and allows fetching a board with everything in one query. For larger scale, consider separate `Card` / `List` collections with references.

Recommendation logic
- Uses `chrono-node` to parse natural language dates from card text when present, with fallbacks to simple keyword heuristics ("tomorrow", "urgent").
- Suggests list moves when progress/completion/review keywords appear (e.g. "started" => "In Progress").
- Finds related cards by token overlap (Jaccard-like score) and label overlap.

Features (small list)
- User registration and login (JWT)
- Create boards, lists, and cards
- Invite members (by email — adds to board member list)
- Update card (move between lists, set due date)
- Recommendations panel: suggested due dates, suggested list movements, related-card groups
# Backend (Express + MongoDB)

Run locally:

1. Copy  .env and set `MONGODB_URI`.
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

Environment / live DB 
- The backend reads the database connection from `backend/.env` using the `MONGODB_URI` variable. 

Authentication endpoints:
- `POST /api/auth/register` - register { email, password, name }
- `POST /api/auth/login` - login { email, password }

Protected endpoints (require `Authorization: Bearer <token>`):
- `POST /api/boards` - create board
- `POST /api/boards/:id/lists` - add list
- `POST /api/boards/:id/cards` - add card
- `PATCH /api/boards/:id/cards/:cardId` - update/move card
- `POST /api/boards/:id/invite` - invite member by email

