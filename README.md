# 💸 MobiKudi — Smarter Mobile Finance for Everyone

**MobiKudi** is an AI-powered financial management platform that helps individuals and small business owners easily track expenses, set savings goals, and gain smart financial insights — all within one simple, responsive interface.

---

## 🌍 Live Demo

🔗 **Landing Page:** [https://mobikudi-landing-page.vercel.app/](https://mobikudi-landing-page.vercel.app/)  
🔗 **Web App:** Accessible directly through the landing page (click **"Try Mobikudi"**) also accessible via this link
[https://mobikudi.vercel.app](https://mobikudi.vercel.app)

👤 **Test Credentials:**  
Email: rasheedahdada@gmail.com 
Password: vminkook07

---

## 🚀 Project Overview

Many people struggle with tracking their daily expenses, understanding spending habits, and building financial discipline. **MobiKudi** bridges this gap with an intuitive platform that automates expense tracking, provides clear visual analytics, and uses AI to suggest better money management practices.

Our focus is to help users — especially young adults and small entrepreneurs — achieve financial clarity without needing complex accounting tools.

---

## 🧩 Features

- ✅ AI-powered insights on spending and saving patterns  
- 💰 Expense tracking and category-based visualization  
- 📊 Monthly financial summaries and charts  
- 🔐 Secure login with Supabase authentication and JWT  
- 🌐 Responsive, mobile-friendly design  
- 💬 Easy onboarding and intuitive navigation  
- 📅 Goal-setting and reminders  

---

## 👣 User Flow

1. **Landing Page:**  
   Users land on the MobiKudi homepage to learn about the product, view its core features, and click **“Get Started”** to access the app.

2. **Sign Up / Login:**  
   Authentication is powered by **Supabase**. Users can sign up or log in securely using their email and password.

3. **Dashboard:**  
   After logging in, users are redirected to the dashboard where they can:  
   - Add new income or expense transactions  
   - View categorized charts and summaries  
   - See total income vs expenses for the month  
   - Receive AI-driven financial insights  

4. **Goals & Analytics:**  
   Users can set saving goals, track progress, and view personalized spending analytics powered by the integrated AI model.

5. **Profile & Logout:**  
   Users can manage their profile or securely log out. The session is authenticated using JWT and ends when the user signs out.

---

## 🧠 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React (Vite), TypeScript, Tailwind CSS |
| **Backend** | Supabase (Database + Auth) |
| **State Management** | Zustand |
| **AI** | OpenAI API (for financial insight suggestions) |
| **Hosting** | Vercel |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/DoctorRash/MobiKudi.git
cd MobiKudi
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Create an .env file in the root directory and add:
ini
Copy code
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
4️⃣ Run the development server
bash
Copy code
npm run dev
5️⃣ Open in browser
arduino
Copy code
http://localhost:5173
