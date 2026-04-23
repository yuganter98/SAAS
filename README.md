# 🎯 Play. Win. Give Back.

A modern SaaS web application that combines **golf performance tracking**, **monthly reward draws**, and **charity contributions** into a single engaging platform.

### 🌐 **[Live Demo → https://saas-sage-chi.vercel.app](https://saas-sage-chi.vercel.app)**

---

# 🚀 Live Overview

This platform allows users to:

* 📊 Track their last 5 golf scores
* 🎲 Participate in monthly draw-based rewards
* 💰 Win prizes based on performance
* ❤️ Contribute a portion of their subscription to charity
* 🧑💼 Admins manage draws, users, and winner verification

---

# 🧠 Why This Project?

Traditional golf platforms are:

* ❌ Boring
* ❌ Data-heavy
* ❌ Not engaging

We built this as a **modern SaaS product** that:

* Feels **interactive and rewarding**
* Combines **gamification + social good**
* Provides a **subscription-based experience**

---

# 💡 Why This is a SaaS Product

This is a **Software-as-a-Service (SaaS)** application because:

* 🔐 Users create accounts and access the platform online
* 💳 It operates on a **subscription model (monthly/yearly)**
* ☁️ Hosted and managed centrally (no installation required)
* 📈 Scalable for multiple users and future expansion
* 🔄 Continuous engagement through monthly draws

---

# 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS

### Backend / Database

* Supabase (PostgreSQL, Auth, Storage)

### Deployment

* Vercel

---

# ⚙️ System Architecture

* **Frontend (Next.js)** → UI + Server Actions
* **Supabase Auth** → Authentication & session handling
* **Supabase DB** → Data storage
* **Supabase Storage** → Proof uploads
* **Server Actions** → Core logic (scores, draw, admin actions)

---

# 🔑 Core Features

## 1. Authentication System

* Secure signup/login using Supabase Auth
* Session persistence
* Protected routes

---

## 2. Subscription System

* Monthly / Yearly plans
* Subscription state stored in database
* Controls access to core features

---

## 3. Charity Integration

* Users select a charity
* Minimum 10% contribution
* Emotional engagement through impact

---

## 4. Score Management System (Core Logic)

### Rules:

* Only **last 5 scores** stored
* Score range: **1–45**
* **One score per date**

### Logic:

* When adding new score:

  * If already 5 → remove oldest
  * Insert new score
* Display latest first

---

## 5. Draw & Reward System (Core Engine)

### Monthly Process:

1. Generate **5 random numbers (1–45)**
2. Compare with user scores
3. Count matches
4. Assign prize tier

### Match Tiers:

* 5 matches → Jackpot (40%)
* 4 matches → 35%
* 3 matches → 25%

### Features:

* Only users with 5 scores participate
* Multiple winners split prize
* Admin-controlled execution

---

## 6. Winner Verification System

### Flow:

1. User wins → result created
2. User uploads proof (screenshot)
3. Admin reviews
4. Status updated:

   * pending → verified → paid

---

## 7. Admin Panel

Admins can:

* Manage users
* Run monthly draw
* View results
* Verify winners
* Mark payouts

---

## 8. Dashboard

User dashboard shows:

* Subscription status
* Selected charity
* Score history
* Draw results
* Winnings

---

# 🎨 UI/UX Design Approach

We focused on:

* 🎯 Emotion-driven design (not traditional golf UI)
* ✨ Modern SaaS aesthetics
* 🎮 Gamification (scores, draws, rewards)
* 📱 Mobile-first responsive layout
* ⚡ Smooth micro-interactions

---

# 🔐 Security & Data Integrity

* Row Level Security (RLS) in Supabase
* Users can access only their own data
* Admin-only protected actions
* Input validation (scores, dates, uploads)

---

# 🧪 Testing Checklist

✔ Authentication flow
✔ Subscription system
✔ Charity selection
✔ Score logic (5-score rolling)
✔ Draw system execution
✔ Prize calculation
✔ Winner verification
✔ Admin controls
✔ Responsive UI

---

# ⚡ Scalability Considerations

Designed to support:

* Multi-country expansion
* Large user base
* Future mobile app
* Advanced analytics
* Campaign-based features

---

# 🧩 Challenges & Solutions

### Challenge 1: Rolling Score Logic

✔ Solved using controlled deletion of oldest records

### Challenge 2: Draw Matching Logic

✔ Used efficient set-based comparison

### Challenge 3: Secure File Uploads

✔ Implemented Supabase Storage with access control

### Challenge 4: Data Consistency

✔ Structured schema + validation + constraints

---

# 🚀 Future Improvements

* Real payment integration (Stripe)
* Jackpot rollover logic
* Advanced analytics dashboard
* Notifications (email / push)
* AI-based draw weighting

---

# 📦 How to Run Locally

```bash
git clone <repo>
cd project
npm install
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

# 🎥 Demo

🌐 **Live Site:** [https://saas-sage-chi.vercel.app](https://saas-sage-chi.vercel.app)

---

# 🧑💻 Author

Built as part of a full-stack assignment demonstrating:

* System design
* Full-stack development
* Product thinking
* UI/UX execution

---

# ⭐ Final Note

This project is not just a feature implementation —
it is designed as a **complete SaaS product** combining:

👉 Engagement
👉 Gamification
👉 Real-world impact

---
