# Flowboard

> Real-time collaborative task management

Flowboard is a production-grade, Trello-style task board where teams collaborate in real time. Cards move between columns instantly across all connected clients, live cursors show who is working where, and a persistent activity feed logs every action on the board.

---

## Demo

> Open the same board in two windows and watch changes sync instantly — cards, columns, presence, and cursors all update live with no refresh.

---

## Features

| Feature | Details |
|---|---|
| **Real-time sync** | Card moves, edits, and deletions broadcast instantly to all users on the board via Socket.io rooms |
| **Live cursors** | Throttled mouse positions streamed at 20fps, rendered as name-tagged overlays on the board |
| **Presence bar** | Avatar row showing every user currently viewing the board |
| **Optimistic UI** | Card moves update local state immediately before server confirmation — feels instant on any connection |
| **Drag and drop** | Smooth card reordering across columns via `@dnd-kit` with a drag ghost overlay |
| **Activity feed** | Persistent, paginated audit log of every board action streamed live via WebSocket |
| **JWT auth** | Stateless authentication on both REST routes and Socket.io handshake |
| **Board management** | Create, edit, delete boards — invite and remove members by email |
| **Rate limiting** | Separate limiters for API (100 req/15 min) and auth routes (10 req/15 min) |
| **Test suite** | 18 passing tests across auth, boards, and cards using Jest + Supertest |

---

## Tech Stack

### Backend
- **Node.js** + **Express 4** — REST API
- **Socket.io 4** — WebSocket server with board rooms
- **Mongoose 8** + **MongoDB** — data layer
- **JWT** + **bcryptjs** — authentication
- **express-rate-limit** — brute force protection

### Frontend
- **React 19** + **Vite** — UI
- **@dnd-kit** — drag and drop
- **Socket.io-client** — real-time connection
- **Axios** — HTTP client with auth interceptor
- **Tailwind CSS** — styling
- **date-fns** — relative timestamps
- **lodash.throttle** — cursor emit throttling

### Dev & Deploy
- **Jest** + **Supertest** — backend tests
- **nodemon** — dev server
- **Render** — backend hosting
- **Vercel** — frontend hosting

---

## Architecture

### Real-time layer

Every board has a dedicated Socket.io room (`board:<boardId>`). Users join the room on page load and leave on unmount. All mutations — card moves, creates, deletes, column creates — are emitted only to that room, so users on different boards never receive irrelevant events.

```
Client A ──┐
Client B ──┼──► board:abc123 room ──► all clients in room
Client C ──┘
```

### Socket authentication

JWT is passed in the Socket.io handshake `auth.token` field and verified in `io.use()` middleware before any connection is established. This is a separate auth check from the HTTP layer — WebSocket is a different protocol and does not inherit HTTP session state.

### Optimistic UI

On drag-end, the card's local state updates immediately via `CARD_MOVED_OPTIMISTIC` dispatch. The socket event fires in parallel. If the server returns an error, a `CARD_MOVE_ROLLBACK` dispatch restores the previous state. This is the same pattern used by Trello and Linear.

### State management

Board state uses `React Context + useReducer` — no Redux. State is normalised as `{ columns: { id: col }, cards: { id: card } }` maps for O(1) lookups in the reducer. The `useBoard` hook owns the reducer and all socket listeners.

### Presence tracking

Online users are tracked in a server-side `Map<boardId, Map<userId, userInfo>>`. This is intentionally in-memory — simple and sufficient for a single server instance. The README includes a note on swapping to Redis for multi-instance scaling.

---

## Project Structure

```
flowboard/
├── server/
│   └── src/
│       ├── controllers/        # Request/response handlers
│       │   ├── auth/
│       │   ├── board/
│       │   ├── card/
│       │   ├── column/
│       │   └── activity/
│       ├── services/           # Business logic
│       │   ├── auth/
│       │   ├── board/
│       │   ├── card/
│       │   ├── column/
│       │   └── activity/
│       ├── models/             # Mongoose schemas
│       │   ├── User.js
│       │   ├── Board.js
│       │   ├── Column.js
│       │   ├── Card.js
│       │   └── Activity.js
│       ├── middleware/
│       │   ├── auth/           # JWT verify (HTTP + Socket)
│       │   └── rateLimit/
│       ├── sockets/
│       │   ├── board/          # Card and column event handlers
│       │   ├── presence/       # Join, leave, cursor handlers
│       │   └── index.js        # Socket.io setup
│       ├── routes/
│       │   ├── auth/
│       │   ├── board/
│       │   ├── card/
│       │   ├── column/
│       │   ├── activity/
│       │   └── index.js        # Central router
│       ├── tests/
│       │   ├── auth/
│       │   ├── board/
│       │   └── card/
│       ├── app.js              # Express setup
│       └── server.js           # HTTP server + MongoDB connect
│
└── client/
    └── src/
        ├── api/                # Axios instance + per-resource API files
        ├── context/            # AuthContext, BoardContext
        ├── hooks/              # useSocket, useBoard, usePresence
        ├── components/
        │   ├── Board/          # Board, BoardInfo, AddMember
        │   ├── Column/         # Column, AddColumnButton
        │   ├── Card/           # Card, AddCard
        │   ├── Presence/       # PresenceBar, UserCursor
        │   ├── ActivityFeed/   # ActivityFeed, ActivityItem
        │   └── common/         # Avatar
        └── pages/              # LoginPage, RegisterPage, DashboardPage, BoardPage
```

---

## Data Models

### Card reordering strategy

Cards use an integer `order` field per column. On drag-end, the server shifts conflicting cards using `Card.updateMany({ order: { $gte: newOrder } }, { $inc: { order: 1 } })` to make room, then saves the moved card. This avoids float precision drift from fractional ordering and keeps the DB consistent with a predictable number of writes.

### Activity meta

Every mutating socket event creates an `Activity` document with an `action` string (`card.created`, `card.moved`, `card.deleted`, `column.created`) and a `meta` object storing context like `fromColumnTitle`, `toColumnTitle`, and `cardTitle`. This makes the feed human-readable without extra queries.

---

## Socket Events

| Direction | Event | Description |
|---|---|---|
| Client → Server | `board:join` | Join room, broadcast presence |
| Client → Server | `board:leave` | Leave room, update presence |
| Client → Server | `card:create` | Create card, broadcast to room |
| Client → Server | `card:move` | Move card, bulk reorder, broadcast |
| Client → Server | `card:update` | Update card fields, broadcast |
| Client → Server | `card:delete` | Delete card, broadcast |
| Client → Server | `column:create` | Create column, broadcast |
| Client → Server | `cursor:move` | Throttled cursor position |
| Server → Client | `card:created` | New card appended to column |
| Server → Client | `card:moved` | Card position updated |
| Server → Client | `card:updated` | Card fields updated |
| Server → Client | `card:deleted` | Card removed from state |
| Server → Client | `column:created` | Column appended to board |
| Server → Client | `presence:update` | Online users list updated |
| Server → Client | `cursor:moved` | Remote cursor position |
| Server → Client | `activity:new` | New activity prepended to feed |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/didulabhanuka/Flowboard-Real-time-collaborative-task-management.git
cd flowboard
```

### 2. Set up the server

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/flowboard
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

```bash
npm run dev
```

### 4. Open the app

Navigate to `http://localhost:5173`

---

## Running Tests

```bash
cd server
npm test
```

All 18 tests cover auth (register, login, validation), boards (CRUD, access control), and cards (create, update, move, delete).

---

## Deployment

### Backend — Render

1. Push `server/` to a GitHub repository
2. Create a new **Web Service** on Render
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `server/.env` in the Render dashboard
6. Update `CLIENT_URL` to your Vercel frontend URL

### Frontend — Vercel

1. Push `client/` to a GitHub repository
2. Import the repository in Vercel
3. Add environment variables:
   - `VITE_API_URL` → your Render backend URL + `/api`
   - `VITE_SOCKET_URL` → your Render backend URL
4. Deploy

---

## What I'd Add Next

- **Redis** for presence tracking across multiple server instances
- **Conflict resolution** for simultaneous card edits (operational transform or CRDT)
- **Offline support** with optimistic queue and sync on reconnect
- **Card detail modal** with markdown description, comments, and file attachments
- **Board templates** for common workflows
- **Notifications** for card assignments and mentions

---

## License

MIT
