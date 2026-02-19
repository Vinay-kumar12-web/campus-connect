# 🏫 CampusConnect — Complete Setup Guide

A college-exclusive rental & event platform. Students rent items from each other, discover events, chat in real-time, and book everything in one place.

---

## 📁 Project Structure

```
campusconnect/
├── backend/                  ← Node.js + Express API
│   ├── models/
│   │   ├── User.js           ← User schema
│   │   ├── Listing.js        ← Rental item schema
│   │   ├── Booking.js        ← Booking schema
│   │   ├── Event.js          ← Event schema
│   │   └── Message.js        ← Message + Review schema
│   ├── routes/
│   │   ├── auth.js           ← Register / Login
│   │   ├── listings.js       ← Item CRUD
│   │   ├── bookings.js       ← Booking logic
│   │   ├── events.js         ← Event CRUD + interest
│   │   ├── messages.js       ← Chat messages
│   │   ├── reviews.js        ← Ratings & reviews
│   │   └── admin.js          ← Admin panel APIs
│   ├── middleware/
│   │   └── auth.js           ← JWT verification
│   ├── server.js             ← Main entry point + Socket.io
│   ├── .env.example          ← Copy this to .env
│   └── package.json
│
└── frontend/                 ← React app
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js  ← Global auth state
        ├── components/
        │   ├── Navbar.js
        │   └── Navbar.css
        ├── pages/
        │   ├── Login.js + Auth.css
        │   ├── Register.js
        │   ├── Home.js + Home.css
        │   ├── Listings.js + Listings.css
        │   ├── ListingDetail.js + ListingDetail.css
        │   ├── CreateListing.js
        │   ├── Events.js
        │   ├── Bookings.js
        │   ├── Messages.js + Messages.css
        │   ├── Profile.js
        │   └── Admin.js
        ├── App.js             ← Routes
        ├── index.js           ← Entry point
        └── index.css          ← Global styles
```

---

## ⚙️ Setup Instructions

### Step 1 — Install Required Tools
- Install **Node.js** from https://nodejs.org (download LTS version)
- Install **VS Code** from https://code.visualstudio.com
- Create a free **MongoDB Atlas** account at https://mongodb.com/atlas

### Step 2 — Set up MongoDB Atlas
1. Create a new free cluster (M0 tier)
2. Create a database user (username + password)
3. Click "Connect" → "Connect your application"
4. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campusconnect`

### Step 3 — Set up the Backend

```bash
# Open terminal, go to backend folder
cd campusconnect/backend

# Install all packages
npm install

# Create your .env file
cp .env.example .env
```

Now open `.env` in VS Code and fill in:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=make_up_any_random_string_like_abc123xyz
COLLEGE_DOMAIN=yourcollege.edu
CLIENT_URL=http://localhost:3000
```

> ⚠️ Change `yourcollege.edu` to your actual college email domain!
> Example: if your email is `rahul@nitk.edu.in`, use `COLLEGE_DOMAIN=nitk.edu.in`

```bash
# Start the backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### Step 4 — Set up the Frontend

```bash
# Open a NEW terminal, go to frontend folder
cd campusconnect/frontend

# Install all packages
npm install

# Start the React app
npm start
```

The app will open at http://localhost:3000

---

## 🚀 Running the Full App

You need **two terminals** running at the same time:

| Terminal 1 | Terminal 2 |
|------------|------------|
| `cd backend && npm run dev` | `cd frontend && npm start` |
| Runs on port 5000 | Runs on port 3000 |

---

## 👤 Creating Admin Account

1. Register normally with your college email
2. Open MongoDB Atlas → Browse Collections → `users`
3. Find your user → click Edit → change `role` from `"student"` to `"admin"`
4. Save → Now you can access `/admin`

---

## 📸 Image Upload Setup (Optional)

For real image uploads, create a free account at **Cloudinary** (cloudinary.com):
1. Get your Cloud Name, API Key, API Secret from dashboard
2. Add them to your `.env` file

For now, you can paste image URLs directly (upload to imgur.com first).

---

## 🌐 Deploying to Production (Free)

### Deploy Backend to Render.com
1. Push your code to GitHub
2. Go to render.com → New → Web Service
3. Connect your GitHub repo → select `backend` folder
4. Set environment variables (same as .env)
5. Deploy! You'll get a URL like `https://campusconnect-api.onrender.com`

### Deploy Frontend to Vercel
1. Go to vercel.com → New Project → Import from GitHub
2. Set root directory to `frontend`
3. Add env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com`
4. Deploy! You'll get a URL like `https://campusconnect.vercel.app`

---

## 🔑 API Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/listings | All listings |
| POST | /api/listings | Create listing |
| POST | /api/bookings | Book an item |
| GET | /api/bookings/my | My bookings |
| GET | /api/events | All events |
| POST | /api/events | Post event |

---

## 💡 Tips for Development

- Use **Postman** (postman.com) to test API endpoints before connecting the frontend
- If you see CORS errors, make sure `CLIENT_URL` in `.env` matches your React app URL
- Use `console.log()` everywhere while learning — it's your best debugging tool
- The `nodemon` package auto-restarts the server when you change files

---

## 📚 Learning Resources

- **React**: https://react.dev (official docs)
- **Node.js + Express**: https://expressjs.com
- **MongoDB**: https://www.mongodb.com/docs/atlas
- **YouTube**: Traversy Media, Fireship, CodeWithHarry (Hindi)
- **freeCodeCamp**: https://freecodecamp.org

Good luck with your project! 🚀
