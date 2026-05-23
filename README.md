# 🎊 فرحنا | Farahna — Wedding Planner Platform

A full-stack Arabic wedding planning platform with cloud database, secure authentication, and premium UI.

**Live URL:** `https://farahna.onrender.com`

## 🛡️ Security Features

- 🔐 **bcrypt** password hashing (12 salt rounds)
- 🎫 **JWT** token authentication (24h expiry)
- 🔒 **HTTPS** (automatic via Render)
- 🛡️ **Helmet** security headers (CSP, HSTS, X-Frame-Options)
- ⏱️ **Rate limiting** (200 req/15min, 10 login attempts/15min)
- 🚫 **NoSQL injection prevention** (express-mongo-sanitize)
- 🧹 **HPP** parameter pollution protection
- 🔑 **Role-based access** (organizer / vendor)

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (cloud) |
| Auth | bcrypt + JWT |
| Hosting | Render.com (free tier) |
| Font | Cairo (Google Fonts) |

## 📂 Project Structure

```
├── server/
│   ├── server.js           # Express entry point
│   ├── config/db.js        # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   └── security.js     # Helmet, rate-limit, CORS
│   ├── models/             # 9 Mongoose schemas
│   ├── routes/             # 9 API route files
│   └── seed.js             # Initial data seeder
├── public/                 # Frontend (served by Express)
│   ├── index.html
│   ├── api.js              # REST API client
│   ├── app.js              # Dashboard UI
│   ├── services.js         # Business logic
│   ├── components.js       # UI components
│   └── styles.css          # Premium CSS design
├── package.json
├── .env.example
└── .gitignore
```

## ⚡ Quick Start (Local Dev)

```bash
# 1. Clone the repo
git clone https://github.com/salihq/farahna.git
cd farahna

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret

# 4. Start the server
npm start

# 5. Open http://localhost:3000
```

## 🔑 Default Accounts

| Role | Username | Password |
|------|----------|----------|
| Organizer | `admin` | `admin` |
| Vendor | `v1@wedding.com` | `123` |
| Vendor | `v2@wedding.com` | `123` |
| ... | up to `v50+@wedding.com` | `123` |

## 🌐 Deployment (Render.com)

1. Push code to GitHub
2. Sign up at [render.com](https://render.com) (free)
3. Create **New Web Service** → connect GitHub repo
4. Set **Environment Variables**:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = random 64-char string
   - `NODE_ENV` = production
5. Deploy!

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Current user |
| GET | /api/vendors | ✅ | List vendors |
| POST | /api/vendors | 🔒 Org | Create vendor |
| GET | /api/clients | 🔒 Org | List clients |
| POST | /api/plans/reserve | 🔒 Org | Reserve plan |
| GET | /api/bookings/:id | ✅ | Vendor dates |
| GET | /api/notifications | ✅ | My notifications |
| GET | /api/reviews/:id | ✅ | Vendor reviews |
| GET | /api/stats/dashboard | 🔒 Org | Statistics |

## 📄 License

MIT — Made with ❤️ by salihq
