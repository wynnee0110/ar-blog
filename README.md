# 🌐 AR Blog - Next.js Social Media Platform

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC)

A modern, full-featured social media application built with **Next.js 16** and **Supabase**. It features real-time interactions, a rich user interface with dark mode, and unique customization options like animated avatar borders.

---

## 📸 Screenshots

*(Place screenshots of your Home Feed and Profile Page here)*

---

## ✨ Features

### 👤 User Experience
* **Authentication:** Secure Sign-up and Login powered by Supabase Auth.
* **Custom Profiles:** Edit bio, website, and upload avatars.
* **✨ Legendary Borders:** Unique feature allowing users to unlock animated avatar borders (Rainbow, Glitch, Galaxy, Neon, etc.).
* **Dark/Light Mode:** Fully responsive theme toggle using Tailwind v4.

### 📝 Content & Interaction
* **Create Posts:** Rich text posts with image attachments.
* **Social Feed:** Infinite scroll-style feed of community posts.
* **Likes & Comments:** Real-time social interactions.
* **Follow System:** Follow/Unfollow users to curate your feed.
* **Search Engine:** Dual-search capability to find **Posts** (by content) and **People** (by username) simultaneously.

### ⚙️ Technical Highlights
* **Real-time Notifications:** Alerts for likes, comments, and follows.
* **Optimistic UI:** Instant feedback on likes and follows before server confirmation.
* **Responsive Design:** Mobile-first layout using Tailwind CSS.

---

## 🛠️ Tech Stack

This project uses the latest web technologies for performance and scalability.

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Core application framework |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety and logic |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Styling and Dark Mode |
| **Icons** | [Lucide React](https://lucide.dev/) | Beautiful, consistent SVG icons |
| **Backend** | [Supabase](https://supabase.com/) | PostgreSQL Database & Auth |
| **Storage** | Supabase Storage | Image hosting for Avatars/Posts |
| **Deployment** | [Vercel](https://vercel.com/) | Hosting and CI/CD |

---

## 🏗️ Architecture

The app follows a modern Serverless architecture.

* **Frontend:** Next.js handles routing and UI rendering. It uses React Server Components (RSC) for data fetching and Client Components for interactivity.
* **Backend:** Supabase acts as the "Backend-as-a-Service," providing:
    * **Postgres DB:** Relational data for users, posts, and follows.
    * **Auth:** Handling JWTs and user sessions.
    * **Storage:** S3-compatible bucket for user uploads.

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Prerequisites
* Node.js 18+ installed.
* A [Supabase](https://supabase.com/) account.

### 2. Clone the Repository
```bash
git clone [https://github.com/your-username/ar-blog.git](https://github.com/your-username/ar-blog.git)
cd ar-blog
3. Install Dependencies
Bash
npm install
4. Configure Environment Variables
Create a .env.local file in the root directory and add your Supabase keys:

Bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
5. Setup Database (SQL)
Go to your Supabase SQL Editor and run the following schema to create the necessary tables:

<details> <summary>Click to view SQL Schema</summary>

SQL
-- 1. Create Profiles Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  border_variant text default 'none',
  updated_at timestamp with time zone
);

-- 2. Create Posts Table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  content text,
  image_url text,
  author_id uuid references public.profiles(id) not null
);

-- 3. Create Follows Table
create table public.follows (
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- 4. Enable Storage (Create 'avatars' and 'posts' buckets in Dashboard)
</details>

6. Run the App
Bash
npm run dev
Open http://localhost:3000 in your browser.

🤝 How to Contribute
Contributions are welcome! If you'd like to improve the project:

Fork the repository.

Create a new Branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

🤖 AI Assistance & Resources
This project was built with the assistance of AI Thought Partners (Gemini/ChatGPT) to accelerate development.

Mock Data: AI was used to generate SQL scripts for populating the feed with realistic mock posts.

Debugging: AI assisted in resolving Vercel build errors and Next.js hydration issues.

CSS Animations: The complex keyframe animations for the "Galaxy" and "Glitch" borders were generated using AI CSS tools.

📜 License
Distributed under the MIT License. See LICENSE for more information.
