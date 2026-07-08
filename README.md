# Baat Karlo 💬

A full-stack real-time chat application with AI-powered features — built with React, Node.js, Socket.io, and MongoDB.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb) ![Socket.io](https://img.shields.io/badge/Socket.io-4-black?style=flat&logo=socket.io) ![Groq](https://img.shields.io/badge/AI-Groq%20%2F%20Llama%203-orange?style=flat)

---

## Features

### Core Chat
- **Real-time messaging** via WebSockets (Socket.io)
- **Direct Messages (DM)** — one-on-one private conversations
- **Group Channels** — multi-member channels with admin controls
- **File sharing** — upload and download images and files in any chat
- **Image preview** — inline full-screen viewer for shared images
- **Emoji picker** — react-emoji picker integrated into the message bar
- **Multi-line messages** — Shift+Enter for new lines, Enter to send

### Authentication & Profiles
- Email/password signup and login with JWT authentication (httpOnly cookie)
- Profile setup with first name, last name, avatar color selection
- Custom profile image upload and removal
- Persistent sessions via JWT verified on both REST and WebSocket connections

### AI Features (powered by Groq / Llama 3.3-70B)
| Feature | Description |
|---|---|
| **Chat Summarizer** | Detects unread messages on chat open, shows a banner and generates a 2–4 sentence summary |
| **Per-Member Breakdown** | For group channels, expands the summary into per-sender cards with individual contribution summaries |
| **Auto Reply Suggestions** | Generates 3 ready-to-send reply suggestions with selectable tones: Friendly, Casual, Professional, Formal, Flirty, Witty |
| **Composer AI — Fix Grammar** | Corrects spelling, punctuation, and grammar while preserving your original tone |
| **Composer AI — Tone Rewrite** | Rewrites your typed message in any of 6 tones without changing the meaning |

---

## Tech Stack

### Client
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| Axios | HTTP client |
| Socket.io-client | Real-time WebSocket client |
| shadcn/ui (Radix UI) | Accessible UI components |
| react-icons | Icon library |
| moment.js | Date/time formatting |
| react-lottie | Lottie animations |
| emoji-picker-react | Emoji picker component |

### Server
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| Socket.io | Real-time bidirectional communication |
| MongoDB + Mongoose | Database and ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Multer | File upload handling |
| Groq SDK | AI inference (Llama 3.3-70B) |
| dotenv | Environment variable management |

---

## Project Structure

```
Chatting-App/
├── client/                         # React frontend (Vite)
│   └── src/
│       ├── components/ui/          # Shared UI components (shadcn)
│       ├── context/
│       │   └── SocketContext.jsx   # Socket.io connection provider
│       ├── lib/
│       │   ├── api-client.js       # Axios instance
│       │   ├── last-read.js        # localStorage last-read tracker
│       │   └── utils.js            # Tailwind merge + color helpers
│       ├── pages/
│       │   ├── auth/               # Login & signup page
│       │   ├── profile/            # Profile setup page
│       │   └── chat/               # Main chat page
│       │       └── components/
│       │           ├── chat-container/
│       │           │   ├── chat-header/        # Chat title and close
│       │           │   ├── message-container/  # Message thread + unread detection
│       │           │   ├── message-bar/        # Input, emoji, file, AI buttons
│       │           │   ├── summarize-banner/   # Unread summary prompt banner
│       │           │   ├── summary-tile/       # Floating AI summary card
│       │           │   └── reply-suggestions/  # Reply suggestion panel
│       │           ├── contacts-container/
│       │           │   ├── new-dm/             # DM contact search dialog
│       │           │   ├── create-channel/     # Channel creation dialog
│       │           │   └── profile-info/       # User info + logout bar
│       │           └── empty-chat-container/   # Welcome screen
│       ├── store/
│       │   └── slices/
│       │       ├── auth.slice.js   # User info state
│       │       └── chat-slice.js   # Chat, messages, and AI state
│       └── utils/
│           └── constants.js        # All API route constants
│
└── server/                         # Node.js + Express backend
    ├── controllers/
    │   ├── auth.controller.js      # Signup, login, profile, image
    │   ├── messages.controller.js  # Get messages, file upload
    │   ├── contact.controller.js   # Search, DM list, all contacts
    │   ├── channel.controller.js   # Create, list, channel messages
    │   └── ai.controller.js        # Summarize, suggest replies, enhance
    ├── middlewares/
    │   └── auth.middleware.js      # JWT verification
    ├── models/
    │   ├── user.model.js
    │   ├── messages.model.js
    │   └── channel.model.js
    ├── routes/
    │   ├── auth.route.js
    │   ├── contacts.route.js
    │   ├── messages.route.js
    │   ├── channel.route.js
    │   └── ai.route.js
    └── socket.js                   # Socket.io setup with JWT middleware
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- A [Groq API key](https://console.groq.com) (free tier available) for AI features

---

### 1. Clone the repository
```bash
git clone https://github.com/ayushpratap27/Chatting-App.git
cd Chatting-App
```

### 2. Set up the server
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=3001
DATABASE_URL=mongodb://localhost:27017/chatting-app
JWT_KEY=your_super_secret_jwt_key_here
ORIGIN=http://localhost:5173
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 3. Set up the client
```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:
```env
VITE_SERVER_URL=http://localhost:3001
```

Start the client:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)
| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `3001`) |
| `DATABASE_URL` | **Yes** | MongoDB connection string |
| `JWT_KEY` | **Yes** | Secret key for signing JWT tokens |
| `ORIGIN` | **Yes** | Frontend origin URL for CORS (e.g. `http://localhost:5173`) |
| `GROQ_API_KEY` | No | Groq API key for AI features. Without this, AI endpoints return 503 but the rest of the app works normally |

### Client (`client/.env`)
| Variable | Required | Description |
|---|---|---|
| `VITE_SERVER_URL` | **Yes** | Full URL of the backend server |

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | Create a new account |
| POST | `/login` | — | Login and receive JWT cookie |
| GET | `/user-info` | ✓ | Get current user's profile |
| POST | `/update-profile` | ✓ | Update name and color |
| POST | `/add-profile-image` | ✓ | Upload profile picture |
| DELETE | `/remove-profile-image` | ✓ | Remove profile picture |
| POST | `/logout` | — | Clear JWT cookie |

### Contacts — `/api/contacts`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/search` | ✓ | Search users by name or email |
| GET | `/get-contacts-for-dm` | ✓ | List DM contacts sorted by last message |
| GET | `/get-all-contacts` | ✓ | List all users (for channel creation) |

### Messages — `/api/messages`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/get-messages` | ✓ | Fetch DM message history |
| POST | `/upload-file` | ✓ | Upload a file for sharing |

### Channels — `/api/channel`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-channel` | ✓ | Create a new group channel |
| GET | `/get-user-channels` | ✓ | List channels the user belongs to |
| GET | `/get-channel-messages/:channelId` | ✓ | Fetch channel message history |

### AI — `/api/ai`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/summarize` | ✓ | Summarize unread messages (overall or per-user) |
| POST | `/suggest-replies` | ✓ | Generate 3 reply suggestions in a given tone |
| POST | `/enhance-message` | ✓ | Fix grammar or rewrite in a different tone |

### WebSocket Events
| Event (emit) | Direction | Payload |
|---|---|---|
| `sendMessage` | Client → Server | `{ recipient, content, messageType, fileUrl }` |
| `send-channel-message` | Client → Server | `{ channelId, content, messageType, fileUrl }` |
| `receiveMessage` | Server → Client | Populated message object |
| `receive-channel-message` | Server → Client | Populated message object + `channelId` |

---

## Deployment

Both the client and server include `vercel.json` configuration for one-click deployment on [Vercel](https://vercel.com).

### Deploy the server
1. Import the `server/` folder as a new Vercel project
2. Set the environment variables (`DATABASE_URL`, `JWT_KEY`, `ORIGIN`, `GROQ_API_KEY`)
3. The `vercel.json` routes all traffic through `index.js`

### Deploy the client
1. Import the `client/` folder as a new Vercel project
2. Set `VITE_SERVER_URL` to your deployed server URL
3. The `vercel.json` handles SPA routing (all paths → `index.html`)

---

## Security

- Passwords are hashed with **bcrypt** before storage
- JWT tokens are stored in **httpOnly cookies** (not accessible from JavaScript)
- Socket.io connections verify the JWT cookie before accepting — unauthenticated clients are rejected at the middleware level
- Message `sender` is set server-side from the verified JWT payload — clients cannot spoof sender identity
- File uploads are restricted to image MIME types for profile pictures, with size limits (5 MB for profiles, 20 MB for message files)
- Uploaded filenames are sanitized with `path.basename` to prevent path traversal attacks
- Search queries are sanitized with regex escaping before MongoDB queries

---

## License

MIT
