TECEZE Price Book Calculator – MERN (Professional Edition)

Overview
This project is a full‑stack web application that turns TECEZE’s global price book into a fast, professional, and deployable calculator. It supports responsive UX, branded UI (logo, colors, favicon), and a printable PDF quote. The backend is Node/Express with MongoDB, and the frontend is React (Vite) with Ant Design and Tailwind utilities.

Core Features
- Price calculator: Region → Country → Level (L1–L5) → Service type (Full Day, Half Day, Dispatch) with travel distance and OOH/Weekend multipliers
- Accurate financial rules: service management fee (5%), free 50 km, $0.40/km beyond, multipliers (1.5/2)
- Database‑backed: seeded from the official Excel price book into MongoDB
- API: /api/regions, /api/countries?region=…, /api/calculate
- Professional UX: branded header/footer, mobile drawer menu, skeleton loading, formatted totals
- PDF export: branded invoice‑style quote with logo, selections, breakdown, total

Tech Stack
- Frontend: React 19 (Vite), Ant Design, Tailwind (v4 import), Axios
- Backend: Node.js/Express, Mongoose, Helmet, CORS, Morgan
- Data/Import: MongoDB Atlas, xlsx, csv-parse (legacy CSV route disabled in final UI)

Repository Structure
- backend: Express API, models, seeders
  - src/models/PriceBook.js – normalized price book row model
  - src/models/TermsConditions.js – fee/multiplier rules
  - src/controllers/calculatorController.js – region/country/calculate
  - src/routes/calcRoutes.js – /api endpoints
  - src/seed/seedFromExcel.js – Excel import (uses frontend/public sheet path)
  - src/server.js – app bootstrap + CORS/security
- frontend: React + Vite app
  - src/pages/Calculator.jsx – main calculator page
  - src/pages/About.jsx – how it works
  - src/lib/api.js – Axios client
  - index.html – favicon/logo

Prerequisites
- Node.js 18+ (Vite v5 and plugins are pinned for Node 18 compatibility)
- Git
- MongoDB Atlas connection string (provided)

Quick Start (Local)
1) Clone
   git clone https://github.com/<your-org-or-user>/teceze-price-book-calculator.git
   cd teceze-price-book-calculator

2) Install
   cd backend && npm i
   cd ../frontend && npm i

3) Environment
   Create backend/.env (example):
   PORT=5050
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/tecezetask?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:5173,http://localhost:5174

   Create frontend/.env (example):
   VITE_API_URL=http://localhost:5050

   Why PORT 5050? macOS AirPlay sometimes binds :5000, returning 403. Using 5050 avoids conflicts.

4) Seed database from the Excel price book
   The Excel file is placed at frontend/public/Teceze Global Pricebook v0.1.xlsx
   cd backend
   npm run seed

   On success you’ll see counts like: { total: 1903, regionsCount: 8, countriesCount: 173 }

5) Run
   Start backend:
   cd backend
   npm run dev

   Start frontend (new terminal):
   cd frontend
   npm run dev

   Open http://localhost:5173

Deploy
- Backend (Render/Railway/Fly/Azure App Service):
  - Set env: PORT, MONGODB_URI, FRONTEND_URL (your deployed frontend origin[s])
  - Start command: node src/server.js
- Frontend (Vercel/Netlify):
  - Set env VITE_API_URL to your deployed API URL (e.g., https://api.yourdomain.com)
  - Build command: vite build; Output dir: dist

API Reference
- GET /api/regions → ["APAC", "Europe", …]
- GET /api/countries?region=APAC → ["Australia", "India", …]
- POST /api/calculate
  Body
  {
    "country": "Australia",
    "level": "L1",
    "service_type": "Full Day Visit (8hrs)",
    "distance": 80,
    "out_of_hours": true,
    "weekend": false
  }
  Response (example)
  {
    "currency": "USD",
    "payment_terms": "60 Days",
    "base_price": 48000,
    "travel_fee": 12,
    "multipliers_applied": { "out_of_hours": true, "weekend": false, "multiplier": 1.5 },
    "service_management_fee_pct": 5,
    "service_management_fee": 2406,
    "total": 50418
  }

Business Rules Implemented
- Free travel distance: first 50 km; beyond charged at $0.40/km
- Out‑of‑Hours multiplier: 1.5×
- Weekend/Holiday multiplier: 2×
- Service Management fee: 5% of subtotal
- Currency/payment terms: from country row in the price book

Branding/UX
- Header: logo (favicon + header), center title, right actions (desktop) or drawer (mobile)
- Calculator: Ant Design Form with selects and inputs; skeleton loader on calculate
- Quote: statistic cards (base, travel, fee, total) with brand colors
- PDF: professionally formatted invoice‑style using jsPDF

Scripts
- backend
  - npm run dev – nodemon on src/server.js
  - npm start – node src/server.js
  - npm run seed – import Excel into MongoDB
- frontend
  - npm run dev – Vite dev server
  - npm run build – production build
  - npm run preview – serve build locally

Troubleshooting
- 403 from /health on :5000 (macOS): Port is in use by AirPlay. Switch to PORT=5050 and update VITE_API_URL.
- CORS: set FRONTEND_URL to a comma‑separated list of allowed origins (e.g., http://localhost:5173,http://localhost:5174).
- Regions empty: check backend logs, ensure seed was successful, verify MongoDB connection string.

License
This project is for TECEZE’s assessment and demonstration purposes.

Repository Structure
```
Teceze/
├─ backend/
│  ├─ package.json
│  └─ src/
│     ├─ server.js                # Express bootstrap, CORS/security
│     ├─ utils/db.js              # Mongo connection
│     ├─ models/
│     │  ├─ PriceBook.js
│     │  └─ TermsConditions.js
│     ├─ controllers/
│     │  └─ calculatorController.js
│     ├─ routes/
│     │  └─ calcRoutes.js
│     └─ seed/
│        └─ seedFromExcel.js      # Excel → Mongo seeder
├─ frontend/
│  ├─ index.html                  # favicon set to tecezelogo.png
│  └─ src/
│     ├─ App.jsx                  # Header, routes, footer
│     ├─ pages/
│     │  ├─ Calculator.jsx        # UI + PDF invoice
│     │  └─ About.jsx
│     └─ lib/api.js               # Axios API client
└─ README.md
```

How to Clone and Run
```
git clone https://github.com/Keerthithev/Teceze_task.git
cd Teceze_task

# Backend
cd backend && npm i
cp .env.example .env  # If provided; otherwise create as shown above
npm run seed          # Optional: import Excel
npm run dev

# Frontend
cd ../frontend && npm i
echo "VITE_API_URL=http://localhost:5050" > .env
npm run dev
```

Live Repo
- GitHub: [Keerthithev/Teceze_task](https://github.com/Keerthithev/Teceze_task.git)

Teceze Price Book Calculator (MERN)

Prerequisites
- Node.js 18+
- MongoDB Atlas connection string (provided)

Project Structure
- backend: Express + Mongoose (models, controllers, routes)
- frontend: React + Vite (pages for CSV upload and calculator)

Backend (Express)
1) Env vars (create backend/.env):
   PORT=5000
   MONGODB_URI=mongodb+srv://KeerthiDev:9AkQP1TaAYasb09H@keerthidev.stiw0.mongodb.net/tecezetask?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:5173

2) Run dev server:
   cd backend
   npm run dev

API Endpoints
- GET /health → { status: 'ok' }
- GET /api/prices?region=&country=&supplier= → list prices
- POST /api/prices/upload (multipart/form-data, file field name: file) → import CSV
- POST /api/prices/calculate → { region, country, supplier?, keys: ["L1", "L2", ...] }

Frontend (Vite React)
1) Env vars (create frontend/.env):
   VITE_API_URL=http://localhost:5000

2) Run dev:
   cd frontend
   npm run dev

Pages
- /upload → upload CSV to backend
- /calculator → input region, country, optional supplier, comma separated keys; see summed total

Deployment
- Backend (Render/Railway/Fly):
  - Set environment variables: PORT, MONGODB_URI, FRONTEND_URL=<deployed frontend URL>
  - Start command: node src/server.js
- Frontend (Vercel/Netlify):
  - Set VITE_API_URL=<deployed backend base URL>

Notes
- The DB connection prefers MONGODB_URI. If missing, it falls back to the provided Atlas URI and dbName tecezetask.
- CSV parser coerces numeric-looking values (removes $, €, £, commas) and stores other columns under data map.

