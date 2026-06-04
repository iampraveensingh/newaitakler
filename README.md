# AI Talker — Base44 → Express + MySQL Migration

Complete professional migration: Base44 removed, UI preserved 100%, fresh Express + MySQL2 backend.

---

## 📁 Project Structure

```
expressive-voice/
├── frontend/          ← React + Vite (Base44 completely removed)
│   ├── src/
│   │   ├── api/
│   │   │   └── base44Client.js  ← Replaced: now axios + JWT (same import name kept)
│   │   ├── lib/
│   │   │   └── AuthContext.jsx  ← Replaced: JWT-based auth
│   │   ├── Layout.jsx           ← Replaced: JWT token check
│   │   ├── pages/               ← UNCHANGED (all UI preserved)
│   │   └── components/          ← UNCHANGED
│   ├── vite.config.js           ← Replaced: removed Base44 plugin, added proxy
│   ├── package.json             ← Cleaned: @base44/sdk removed
│   └── .env.example
│
└── backend/           ← New: Node.js + Express + MySQL2
    ├── server.js
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── authController.js
    │   ├── usersController.js
    │   ├── entityController.js  ← Generic CRUD factory
    │   ├── aiController.js
    │   ├── planController.js
    │   └── uploadController.js
    ├── middleware/
    │   ├── auth.js              ← JWT verifyToken + requireAdmin
    │   └── upload.js            ← Multer config
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   ├── ai.js
    │   ├── uploads.js
    │   ├── plan.js
    │   └── entityRouter.js      ← CRUD router factory
    ├── utils/
    │   ├── response.js
    │   ├── query.js
    │   └── cron.js              ← CRON structure (no generation logic)
    ├── schema.sql               ← Full MySQL schema
    └── .env.example
```

---

## ⚡ Quick Start

### 1. Database Setup

```bash
# Create the database and all tables
mysql -u root -p < backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials, JWT secret, etc.

# Start development server
npm run dev
# → http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy and configure environment
cp .env.example .env
# (optional — vite proxy handles /api → localhost:5000 automatically in dev)

# Start development server
npm run dev
# → http://localhost:5173
```

---

## 🔑 Backend .env Configuration

```env
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=expressive_voice

# JWT (use a long random string in production!)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# External Auth (unchanged from Base44 version)
PROWEBVENTURES_LOGIN_URL=https://systems.prowebventures.com/login44.php

# AI Content Generation (optional — mock response used if not set)
OPENAI_API_KEY=sk-your-key-here

# Frontend CORS
FRONTEND_URL=http://localhost:5173
```

---

## 🌐 API Reference

All protected endpoints require: `Authorization: Bearer <jwt_token>`

### Authentication
| Method | Endpoint         | Auth | Description                        |
|--------|-----------------|------|------------------------------------|
| POST   | /api/auth/login  | ❌   | Login via ProWebVentures + issue JWT |
| GET    | /api/auth/check  | ✅   | Verify token is valid               |
| POST   | /api/auth/logout | ✅   | Confirm logout (client removes token) |

### Users
| Method | Endpoint         | Auth | Description     |
|--------|-----------------|------|-----------------|
| GET    | /api/users/me    | ✅   | Get current user profile |
| PUT    | /api/users/me    | ✅   | Update profile  |
| GET    | /api/users       | ✅ Admin | List all users (Agency page) |

### Voiceovers
| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| GET    | /api/voiceovers       | ✅   | List all (supports ?sort, ?limit, ?status) |
| GET    | /api/voiceovers/:id   | ✅   | Get one               |
| POST   | /api/voiceovers       | ✅   | Create (CRUD only)    |
| PUT    | /api/voiceovers/:id   | ✅   | Update                |
| DELETE | /api/voiceovers/:id   | ✅   | Delete                |

> **Same pattern** applies to all entity endpoints:  
> `/api/voice-clones`, `/api/custom-voices`, `/api/audio-mixes`,  
> `/api/vsl-copies`, `/api/ad-copies`, `/api/transcriptions`

### AI Generation
| Method | Endpoint          | Auth | Description                     |
|--------|------------------|------|---------------------------------|
| POST   | /api/ai/generate  | ✅   | Generate content via OpenAI LLM |

**Body:**
```json
{
  "prompt": "Create 3 ad copies for FitPro App...",
  "response_json_schema": {
    "type": "object",
    "properties": {
      "variation1": { "type": "string" },
      "variation2": { "type": "string" },
      "variation3": { "type": "string" }
    }
  }
}
```

### File Uploads
| Method | Endpoint            | Auth | Description           |
|--------|---------------------|------|-----------------------|
| POST   | /api/uploads/file   | ✅   | Upload audio/video file |

Returns: `{ "data": { "file_url": "http://localhost:5000/uploads/filename.mp3" } }`

### Plan & Usage
| Method | Endpoint                         | Auth | Description            |
|--------|----------------------------------|------|------------------------|
| GET    | /api/plan-limits?plan_id=FE      | ✅   | Get plan limits        |
| GET    | /api/usage-monthly?month_year=2025-06 | ✅ | Get monthly usage    |
| GET    | /api/dfy-offers                  | ✅   | List DFY affiliate offers |

---

## 🔄 What Changed

### Frontend — Minimal Changes

| File | What Changed |
|------|-------------|
| `src/api/base44Client.js` | **Replaced** — now exports `{ base44, auth, entities, integrations }` backed by axios + JWT. Same interface kept so all pages work without modification. |
| `src/lib/AuthContext.jsx` | **Replaced** — JWT token from localStorage instead of Base44 SDK. |
| `src/Layout.jsx` | **Replaced** — `auth.isAuthenticated()` now checks JWT token. Logout calls `auth.logout()`. |
| `src/lib/app-params.js` | **Replaced** — removed all Base44 config, just exports `apiBaseUrl`. |
| `vite.config.js` | **Replaced** — removed `@base44/vite-plugin`, added path alias and API proxy. |
| `package.json` | **Cleaned** — removed `@base44/sdk`, `@base44/vite-plugin`. Added `axios`. |
| All pages & components | **UNCHANGED** — zero UI modifications. |

### What Was Removed
- `@base44/sdk` package
- `@base44/vite-plugin` package
- All `createClient`, `createAxiosClient` imports
- `appId`, `token`, `functionsVersion` params
- Base44 public settings API call

### Auth Flow Change
| Before (Base44) | After (Express + JWT) |
|----------------|----------------------|
| Base44 managed session | JWT in `localStorage('auth_token')` |
| `base44.auth.me()` → Base44 server | `GET /api/users/me` → Express → MySQL |
| `base44.functions.invoke('login44', ...)` | `POST /api/auth/login` → ProWebVentures → Express |
| `base44.auth.logout(url)` | Clear localStorage token + redirect |

---

## 🎵 Audio Generation (CRON — Not Part of This Migration)

Per requirements, **no generation logic is implemented**. Records are CRUD only.

Status values in DB:
- `draft` — just created
- `processing` — picked up by CRON (set when user clicks generate)
- `completed` — generation done (set by CRON worker)
- `failed` — generation failed

CRON structure is in `backend/utils/cron.js` — add your generation logic there.

---

## 🗄️ Database Schema Summary

| Table | Purpose |
|-------|---------|
| `users` | Registered users with plan/addon info |
| `plans` | Plan definitions (FE, PRO, XTREME) |
| `plan_limits` | Per-plan feature limits |
| `product_entitlements` | ProWebVentures product ID → plan/addon mapping |
| `user_usage_monthly` | Monthly usage counters per user |
| `voiceovers` | Voiceover records (CRUD) |
| `voice_clones` | Voice clone records (CRUD) |
| `custom_voices` | Custom voice records (CRUD) |
| `audio_mixes` | Audio mix records (CRUD) |
| `vsl_copies` | VSL script records |
| `ad_copies` | Ad copy records |
| `transcriptions` | Transcription records (CRUD) |
| `dfy_offers` | DFY affiliate offers (admin-managed) |
| `file_uploads` | Uploaded file tracking |

---

## 🏗️ Production Deployment Notes

1. **Change JWT_SECRET** to a cryptographically random 64+ char string
2. Set `NODE_ENV=production` 
3. Set `FRONTEND_URL` to your production domain
4. Configure a reverse proxy (nginx) in front of Express
5. Use PM2 or similar for process management
6. Set up MySQL with proper credentials and a dedicated DB user
7. Configure HTTPS
8. Add `OPENAI_API_KEY` for AI generation features
9. Map your ProWebVentures `product_id`s in the `product_entitlements` table
