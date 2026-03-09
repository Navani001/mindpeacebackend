# MindPeace Backend

A RESTful API backend for the **MindPeace** mental wellness platform, built with **Fastify**, **TypeScript**, **Prisma**, and **PostgreSQL** (with pgvector). The backend powers an AI-driven chatbot, mood analytics, wellness task tracking, counsellor booking, and user settings.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Auth](#auth-apiauthprefix)
  - [Chatbot](#chatbot-apichatbot-prefix)
  - [Analytics](#analytics-apianalytics-prefix)
  - [Settings](#settings-apisettings-prefix)
  - [Bookings](#bookings-apibookings-prefix)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Features

- **JWT Authentication** — Secure cookie-based JWT auth with role-based access (`student`, `admin`, `consultant`).
- **AI Chatbot** — Conversational AI powered by **Google Gemini**, with semantic memory via **pgvector** embeddings (cosine similarity search over past messages).
- **End-to-End Encryption** — Chat messages are encrypted at rest using AES-256.
- **Mood Check-Ins** — Daily mood logging with historical tracking and trend analytics.
- **Mindfulness Sessions** — Log meditation and mindfulness activity sessions.
- **Wellness Tasks** — Create, track, and complete wellness tasks with streak tracking.
- **Analytics Dashboard** — Aggregated insights: mood trends, session totals, task completion rates.
- **Counsellor Booking** — Students can book appointments with consultants; consultants can accept/reject and add notes.
- **Emergency Trust Numbers** — Store and manage emergency contact numbers per user.
- **Profile Management** — Update profile info and change password.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Fastify v5 |
| ORM | Prisma v6 |
| Database | PostgreSQL + pgvector extension |
| AI | Google Gemini (`gemini-2.0-flash`, `gemini-embedding-001`) |
| Auth | `@fastify/jwt` + `@fastify/cookie` |
| Validation | Zod |
| Deployment | Vercel (serverless) |

---

## Project Structure

```
├── index.ts                  # App entry point — registers routes & starts server
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Database seeder
│   └── migrations/           # Prisma migration history
├── src/
│   ├── controllers/          # Request handlers (thin layer)
│   │   ├── auth.ts
│   │   ├── chatBot.ts
│   │   ├── analytics.ts
│   │   ├── settings.ts
│   │   └── booking.ts
│   ├── services/             # Business logic
│   │   ├── auth.ts
│   │   ├── chatBot.ts
│   │   ├── analytics.ts
│   │   ├── settings.ts
│   │   └── booking.ts
│   ├── routes/               # Route definitions
│   │   ├── auth.ts
│   │   ├── chatBot.ts
│   │   ├── analytics.ts
│   │   ├── settings.ts
│   │   └── booking.ts
│   ├── middleware/
│   │   └── jwt.ts            # Fastify instance with JWT plugin
│   └── lib/
│       ├── prisma.ts         # Prisma client singleton
│       └── crypto.ts         # AES-256 message encryption helpers
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 15 with the [`pgvector`](https://github.com/pgvector/pgvector) extension enabled
- A **Google AI API key** (Gemini)

### Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string (must support pgvector)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# JWT secret used to sign tokens
JWT_SECRET="your-jwt-secret"

# Google Gemini API key
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"

# AES-256 encryption key for chat messages (32-byte hex string)
ENCRYPTION_KEY="your-32-byte-hex-encryption-key"
```

### Installation

```bash
npm install
```

### Database Setup

Run migrations to create all tables:

```bash
npm run migrate
```

Optionally seed initial data (admin/consultant accounts):

```bash
npm run seed
```

### Running the Server

**Development** (with hot reload via nodemon):

```bash
npm run dev
```

The server starts on **port 5000** by default: `http://localhost:5000`

---

## API Reference

All protected routes require a valid JWT token (sent as a cookie or `Authorization: Bearer <token>` header).

### Auth `/api/auth` prefix

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/create` | No | Register a new user account |
| `POST` | `/api/auth/login` | No | Log in and receive a JWT; returns the user's latest chat ID |

**`POST /api/auth/create`** body:
```json
{ "name": "string", "email": "string", "password": "string", "phoneNumber": "string" }
```

**`POST /api/auth/login`** body:
```json
{ "email": "string" }
```

---

### Chatbot `/api/chatbot` prefix

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/chatbot/` | Yes | Create a new chat session |
| `GET` | `/api/chatbot/` | Yes | Get all chat sessions for the current user |
| `GET` | `/api/chatbot/latest` | Yes | Get the user's most recent chat |
| `GET` | `/api/chatbot/messages/:chatId` | Yes | Get all messages for a chat |
| `POST` | `/api/chatbot/messages/:chatId` | Yes | Send a message and receive an AI response |
| `DELETE` | `/api/chatbot/:chatId` | Yes | Delete a chat session |

Messages are encrypted at rest and use **pgvector semantic search** to surface relevant conversation history for the AI context window.

---

### Analytics `/api/analytics` prefix

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/analytics/dashboard` | Yes | Dashboard summary (mood, sessions, tasks) |
| `GET` | `/api/analytics/insights` | Yes | Detailed mood trend and analytics data |
| `GET` | `/api/analytics/tasks` | Yes | List wellness tasks |
| `POST` | `/api/analytics/check-in` | Yes | Log a daily mood check-in |
| `POST` | `/api/analytics/mindful-session` | Yes | Log a mindfulness/meditation session |
| `POST` | `/api/analytics/tasks` | Yes | Create a new wellness task |
| `PATCH` | `/api/analytics/tasks/:taskId` | Yes | Update a task's completion status |

---

### Settings `/api/settings` prefix

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/settings/profile` | Yes | Get the current user's profile |
| `PUT` | `/api/settings/profile` | Yes | Update profile information |
| `PUT` | `/api/settings/password` | Yes | Change password |
| `GET` | `/api/settings/trust-numbers` | Yes | List emergency trust numbers |
| `POST` | `/api/settings/trust-numbers` | Yes | Add a trust number |
| `DELETE` | `/api/settings/trust-numbers/:numberId` | Yes | Remove a trust number |

---

### Bookings `/api/bookings` prefix

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/bookings/consultants` | No | List all available consultants |
| `POST` | `/api/bookings/` | Yes | Student: create a booking request |
| `GET` | `/api/bookings/my` | Yes | Student: view their own bookings |
| `GET` | `/api/bookings/consultant` | Yes | Consultant: view bookings assigned to them |
| `PATCH` | `/api/bookings/:bookingId/status` | Yes | Consultant: accept or reject a booking |
| `PATCH` | `/api/bookings/:bookingId/note` | Yes | Consultant: add/update a note for the student |

Booking statuses: `pending` → `accepted` / `rejected` → `completed`  
Meeting types: `online`, `offline`

---

## Authentication

- Tokens are issued on login and signed with `JWT_SECRET`.
- Protected routes use the `fastify.authenticate` pre-handler.
- The decoded token payload includes `{ id, email, role }`.

---

## Database Schema

| Model | Purpose |
|-------|---------|
| `User` | Accounts with roles: `student`, `admin`, `consultant` |
| `Chats` | Chat sessions linked to a user |
| `messages` | Individual chat messages with optional pgvector embedding |
| `trustNumber` | Emergency contact numbers per user |
| `MoodCheckIn` | Daily mood log (one per user per day) |
| `MindfulSession` | Mindfulness/meditation session logs |
| `WellnessTaskLog` | Wellness tasks with completion tracking |
| `Booking` | Student–consultant appointment bookings |

---

## Deployment

The project is configured for **Vercel** serverless deployment via [vercel.json](vercel.json).

```bash
vercel deploy
```

Ensure all environment variables are configured in the Vercel project dashboard before deploying.
