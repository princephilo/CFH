# CFH
Circuit Fix Hub
# 🔧 Circuit Fix Hub

A collaborative platform to diagnose and resolve circuit errors through
community support and AI-powered tools.

![Circuit Fix Hub Banner](https://img.shields.io/badge/Circuit_Fix_Hub-v1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 🚀 Features

- **Issue Submission** — Submit circuit problems via text, images, or simulations
- **AI Diagnostics** — Computer vision error detection + AI chatbot assistance
- **Community Forum** — Live discussions and collaborative troubleshooting
- **Circuit Simulator** — Interactive browser-based circuit simulation
- **Searchable Database** — Verified solutions with full-text search
- **Contributor Recognition** — Badges, points, and leaderboard system

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, CSS3                    |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB + Mongoose                |
| AI/ML      | OpenAI API, TensorFlow.js         |
| Auth       | JWT + bcrypt                       |
| Storage    | Multer (local) / Cloudinary       |
| Real-time  | Socket.io                         |

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- OpenAI API key (optional, for AI features)

### Clone and Setup

```bash
git clone https://github.com/yourusername/circuit-fix-hub.git
cd circuit-fix-hub

# Backend setup
cd backend
npm install
cp .env.example .env    # Edit with your credentials
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm start