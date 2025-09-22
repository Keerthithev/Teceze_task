TECEZE Price Book Calculator (MERN)

Overview
Full‑stack price book calculator for TECEZE. Pick Region → Country → Level (L1–L5) → Service Type (Full Day, Half Day, Dispatch), add travel distance and optional out‑of‑hours/weekend multipliers. The app calculates base, travel, service management fee (5%), and total, and can export a professional PDF.

Live URL
- Frontend: https://teceze.netlify.app
- Backend API (Render): https://teceze-task.onrender.com (data pre‑seeded in MongoDB Atlas)


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

- /calculator → input region, country, optional supplier, comma separated keys; see summed total

Deployment
- Backend (Render/Railway/Fly):
  - Set environment variables: PORT, MONGODB_URI, FRONTEND_URL=<deployed frontend URL>
  - Start command: node src/server.js
- Frontend (Vercel/Netlify):
  - Set VITE_API_URL=<deployed backend base URL>


