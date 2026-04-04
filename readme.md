# CosMos 🚀 — The Ultimate Cosmic Exploration Hub

> A premium, high-fidelity web platform that blends cutting-edge scientific data with rich cultural perspectives — your immersive gateway to the universe.

---

## ✨ Modules

| Module | File | Description |
|---|---|---|
| 🏠 **Homepage** | `index.html` | Landing page with embedded interactive 3D Solar System hero |
| 🌌 **Main Hub** | `main.html` | Central navigation and overview of all exploration modules |
| 🪐 **Scale of the Universe** | `scale.html` | Interactive, scaled 3D model of the solar neighborhood |
| 🔭 **Deep Space** | `deepspace.html` | Journey beyond our solar system into the deep cosmos |
| 🚀 **Missions** | `missions.html` | Live and historical space mission tracker |
| 📡 **Live Dashboard** | `dashboard.html` | Real-time telemetry and mission status telemetry board |
| 🌍 **Exoplanets Catalog** | `exoplanets.html` | A deep-dive catalog of distant worlds orbiting other stars |
| 🔮 **Future of Humanity** | `future.html` | Visionary exploration of humanity's multi-planetary destiny |
| 🤖 **Jarvis AI Control Room** | `jarvis.html` | AI-powered cosmic Q&A, backed by Gemini Models |
| 🧠 **Cosmic Quiz** | `quiz.html` | High-fidelity interactive quiz engine to test your knowledge |
| 🔱 **Hindu Astro** | `hindu.html` | Vedic cosmology, Yugas, and ancient celestial wisdom |

---

## 🛠️ Technology Stack & Architecture

This project strictly follows a **SaaS Monorepo** architectural pattern using npm workspaces.

### Frontend (`apps/web/`)
- **HTML5 & CSS3** — Glassmorphism, advanced gradients, micro-animations.
- **Vanilla JavaScript (ES Modules)** — Dynamic component injection, state management, interactive visualizations.
- **Three.js** — High-performance 3D rendering for the Solar System viewer.
- **Netlify Ready** — Automatically deploys via out-of-the-box `netlify.toml` configuration.

### Backend App (`apps/api/`)
- **Layered Node.js + Express** — Robust API structure decoupled into routes, controllers, and constants.
- **Google Generative AI SDK** — Integrates Gemini Flash for the Jarvis AI Control Room.
- **Heroku Ready** — Powered by root-level `Procfile` for simple, scalable deployment.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
Because we use npm workspaces, you only need to run this once at the root directory to install packages for the entire monorepo!
```bash
npm install
```

### 2. Configure the Backend
Navigate to the API app and set up your private API keys:
```bash
cd apps/api
cp .env.example .env
```
Open `apps/api/.env` and insert your Gemini API Key:
```
GOOGLE_AI_API_KEY=your_google_ai_studio_key_here
PORT=3001
```

### 3. Run the Development Environment
From the **project root**, fire up both the frontend and backend servers simultaneously with one command:
```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend Client | `http://localhost:3000` |
| Backend API | `http://localhost:3001` |
| Health Check | `http://localhost:3001/api/health` |

---

## 🌍 Deployment Options

### Frontend (Netlify)
The frontend UI is securely configured for Netlify!
1. Connect this GitHub repository to Netlify.
2. Netlify will read the `netlify.toml` file at the root automatically and serve the static files from `apps/web/`.

### Backend (Heroku)
The backend requires a persistent Node.js server. 
1. Connect this repository to your Heroku app.
2. Ensure you add `GOOGLE_AI_API_KEY` to your Heroku Config Vars.
3. Deploy! Heroku will natively read the repository's `Procfile` and boot `apps/api`.
4. *Don't forget to update the `API_BASE_URL` in `apps/web/homepage/jarvis.html` to point to your new Heroku URL!*

---

## 📂 Project Structure

```text
CosMos-main/
├── package.json              # Monorepo Orchestrator (Workspaces setup)
├── netlify.toml              # UI Deployment blueprint
├── Procfile                  # API Deployment blueprint
├── packages/
│   └── shared/               # Shared project configurations
├── apps/
│   ├── web/                  # FRONTEND CLIENT
│   │   ├── index.html        # Landing page
│   │   ├── assets/           # Global CSS & Components
│   │   ├── homepage/         # Exploration Modules
│   │   └── system/           # Solar system config 
│   │
│   └── api/                  # BACKEND SERVICE
│       ├── .env              # 🔒 Local secrets 
│       ├── package.json      # API specific dependencies
│       └── src/
│           ├── config/       # Third-party integrations
│           ├── constants/    # Master AI Prompts & rules
│           ├── controllers/  # Business logic & handling
│           ├── routes/       # Express route mapping
│           └── server.js     # API entrypoint
```

---

## 🔭 The Vision

CosMos was built to bridge the gap between hard science and human curiosity. Whether you are tracking real-time missions, chatting with an AI space guide, or diving into the ancient cycles of Vedic time — this platform is your gateway to the cosmos.

**Welcome to the next frontier.**
