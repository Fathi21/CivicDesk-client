# CivicDesk — Client

CivicDesk is a council resident self-service portal for Cardiff Council. This repository contains the **React frontend**.

Residents can report local issues, track requests by reference number, view all their past requests, and chat with **CivicAssist** — an AI assistant powered by a local LLM that understands council services and can pre-fill the report form from a conversation.

Council administrators log in to a separate dashboard to manage and update the status of all incoming requests.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| HTTP client | Axios |
| Styling | Plain CSS (custom design system) |
| Container | Docker + nginx |

---

## Pages & Features

### Resident (public)

**Report an Issue**
- Select request type: Pothole, Missed Bin, Noise Complaint, Planning Query, Street Lighting, Other
- Fill in name, email, location, and description
- On submit, a unique reference number is generated (e.g. `POT-20260429-AB1C2D`)

**Track a Request**
- Enter any reference number to check the current status and any admin notes

**My Requests**
- Sign in with email + any reference number to view all requests linked to that email

**CivicAssist (AI Chat)**
- Floating chat widget powered by Ollama (gemma3:4b)
- Understands council services and can suggest the right request type
- Automatically pre-fills the report form when the resident describes an issue

### Admin (protected)

**Admin Dashboard** — requires admin login

- Stat cards showing counts per status (clickable to filter)
- Filter bar by status
- Responsive table / card list of all requests
- Update modal to change status and add internal notes

---

## Running the Client

### Option 1 — Local Development

Requires: Node 20+, the API running locally at `http://localhost:5136`.

```bash
npm install
npm run dev
```

Client available at: `http://localhost:5173`

The Vite dev server proxies all `/api` requests to `http://localhost:5136` automatically — no CORS config needed.

---

### Option 2 — Docker (Full Stack)

The client is built and served by nginx inside Docker. Run from the backend repo root:

```bash
docker compose up -d
```

Client available at: `http://localhost:5173`

nginx proxies `/api` requests to the API container internally.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | API base URL override | `/api` (uses proxy) |

For local dev the Vite proxy handles routing — no env var needed.
For Docker the nginx config handles routing — no env var needed.

Only set `VITE_API_URL` if deploying to a remote server where the API is on a different domain.

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. The Dockerfile handles this automatically as part of the Docker build.

---

## Project Structure

```
src/
├── components/
│   └── ChatWidget.tsx       # Floating AI chat panel
├── pages/
│   ├── ReportPage.tsx       # Resident view (report, track, my requests)
│   ├── AdminPage.tsx        # Admin dashboard with status management
│   └── LoginPage.tsx        # Admin login form
├── services/
│   └── api.ts               # Axios client + all API calls
└── types/
    └── index.ts             # Shared TypeScript types and enums
```

---

## Admin Login

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin123!` |

> The admin account is seeded automatically when the API starts for the first time.
