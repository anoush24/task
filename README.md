# ⚡ TaskFlow | System Access Dashboard

A high-performance Task Management system with a futuristic "Command Center" aesthetic. 

## 🚀 Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express + JWT (Access/Refresh Tokens)
- **Database:** MongoDB Atlas

## ✨ Key Features
- **Dual-Token Auth:** Secure session management with HTTP-only cookies.
- **RBAC:** Admin vs. User roles with specific dashboard permissions.
- **Modern UI:** Permanent Cyan-Glow aesthetic with Montserrat typography.
- **API Docs:** Integrated Swagger UI for endpoint testing.

## 🛠️ Setup Instructions
1. **Clone the repo:** `git clone <repo-url>`
2. **Backend:**
   - `cd backend && npm install`
   - Create `.env` (see `.env.example`)
   - `nodemon server.js`
3. **Frontend:**
   - `cd frontend && npm install`
   - `npm run dev`