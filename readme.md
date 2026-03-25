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
| 🤖 **Jarvis AI Control Room** | `jarvis.html` | AI-powered cosmic Q&A, backed by Gemini 2.0 Flash |
| 🧠 **Cosmic Quiz** | `quiz.html` | High-fidelity interactive quiz engine to test your knowledge |
| 🔱 **Hindu Astro** | `hindu.html` | Vedic cosmology, Yugas, and ancient celestial wisdom |

---

## 🛠️ Technology Stack

### Frontend
- **HTML5 & CSS3** — Glassmorphism, advanced gradients, micro-animations
- **Vanilla JavaScript (ES Modules)** — Dynamic component injection, state management, interactive visualizations
- **Three.js** — High-performance 3D rendering for the Solar System viewer
- **Import Maps** — Dependency-free ES Module resolution (no bundler required)
- **Font Awesome & Google Fonts** — Premium iconography and typography

### Shared Components (`frontend/assets/js/`)
| File | Purpose |
|---|---|
| `components.js` | Dynamically injects shared navigation and footer HTML |
| `seo.js` | Centralized SEO metadata management per page |
| `star.js` | Animated starfield background renderer |
| `firebaseauth.js` | Firebase-based user authentication |
| `login.js` | Login flow handler |

### Backend (`backend/`)
- **Node.js + Express** — Lightweight API proxy server
- **Google Generative AI SDK** — Integrates Gemini 2.0 Flash for the Jarvis AI Control Room
- **dotenv** — Secure API key management via environment variables
- **CORS** — Configured to allow frontend–backend communication
- **nodemon** — Hot-reloading in development

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Configure the Backend

Copy the example environment file and add your API key:
```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your key:
```
GOOGLE_AI_API_KEY=your_google_ai_studio_key_here
PORT=3001
```
> Get a free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 3. Install Backend Dependencies
```bash
cd backend && npm install
```

### 4. Run the Development Environment

From the **project root**, start both frontend and backend concurrently:
```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` (via `npx serve`) |
| Backend API | `http://localhost:3001` |
| Health Check | `http://localhost:3001/api/health` |

---

## 📂 Project Structure

```
CosMos-main/
├── package.json              # Root orchestrator (concurrently)
├── frontend/
│   ├── index.html            # Landing page
│   ├── 404.html              # Custom error page
│   ├── assets/
│   │   ├── css/              # Shared stylesheets
│   │   └── js/
│   │       ├── components.js # Shared nav & footer injection
│   │       ├── seo.js        # Centralized SEO management
│   │       ├── star.js       # Starfield background
│   │       ├── firebaseauth.js
│   │       └── login.js
│   ├── homepage/             # All exploration module pages
│   │   ├── main.html
│   │   ├── scale.html
│   │   ├── deepspace.html
│   │   ├── dashboard.html
│   │   ├── exoplanets.html
│   │   ├── future.html
│   │   ├── jarvis.html
│   │   ├── quiz.html
│   │   ├── missions.html
│   │   ├── hindu.html
│   │   ├── main.css          # Primary stylesheet (~40KB)
│   │   ├── script.js         # Core page logic
│   │   ├── nav.js            # Navigation logic
│   │   └── errorHandler.js   # Global error handling
│   └── system/               # System-level configs & utilities
└── backend/
    ├── server.js             # Express server + Gemini proxy
    ├── .env                  # 🔒 Your secrets (git-ignored)
    └── .env.example          # Template for environment setup
```

---

## 🔭 The Vision

CosMos was built to bridge the gap between hard science and human curiosity. Whether you are tracking real-time missions, chatting with an AI space guide, or diving into the ancient cycles of Vedic time — this platform is your gateway to the cosmos.

**Welcome to the next frontier.**
