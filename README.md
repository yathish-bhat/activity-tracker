# Pulse — Activity Tracker

A full-stack activity tracking web app with a sleek dark UI, built with React + Vite frontend and Node.js/Express + SQLite backend.

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend (`/backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |

### Frontend (`/frontend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:5000 | Backend API base URL |

## Deployment

### Backend on Render
1. Connect your repo
2. Set root directory to `/backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable: `PORT` (Render sets this automatically)

### Frontend on Vercel
1. Connect your repo
2. Set root directory to `/frontend`
3. Add environment variable: `VITE_API_URL` → your Render backend URL (e.g., `https://pulse-api.onrender.com`)

## Activity Types

| Type | Emoji | Color |
|------|-------|-------|
| work | 💼 | #5a9cf5 (blue) |
| workout | 🏋️ | #ff6b6b (coral) |
| water | 💧 | #5a9cf5 (blue) |
| sleep | 😴 | #b5a9f5 (lavender) |
| meditation | 🧘 | #b5a9f5 (lavender) |
| walk | 🚶 | #c8f55a (lime) |
| care | 🌿 | #10b981 (emerald) |
| reading | 📚 | #f59e0b (amber) |
| custom | ✨ | #6b6b80 (muted) |