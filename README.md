# UniTinder

**Find teachers that match how you learn.** Take a short quiz to build your learning profile, then see your best-matched teachers by subject—and swipe to save your favorites.

---

## Inspiration

We wanted matching students to teachers to be more than “pick a subject.” Students have different learning styles (pace, structure, interactivity, need for visuals), and teachers have distinct teaching styles. We took inspiration from **Tinder-style matching**: a short quiz builds a learning profile, then students see teachers ranked by fit and swipe to like or pass—so they get “this teacher matches how you learn,” not just “this teacher teaches Analysis.”

---

## What it does

- **Student flow:** Take a **20-question quiz** to build a **24-dimension learning persona** (pace, structure, abstraction, interactivity, visual dependency, and more). Pick a subject and get **ranked teacher matches** with a compatibility score and an AI-generated **personalized summary** explaining why each teacher fits.
- **Swipe experience:** Swipe right to like, left to pass. Liked teachers are saved to **“My teachers.”**
- **Learn with a teacher:** Request a **study plan** for any topic; it’s generated in that teacher’s style. See a **personalized summary** for that teacher–student pair.
- **Teacher dashboard:** Teachers get **anonymized insights**—who tends to like them (archetype distribution, alignment traits)—with no student names or IDs.

---

## How we built it

- **Backend (Python):** FastAPI with weighted 24-dimension matching (Manhattan distance, 3×/2×/1× weights), compatibility scores, and “best/worst” dimensions. REST APIs for match, students, teachers, likes, study plans, and teacher insights. Data in JSON files; optional Azure OpenAI–compatible API for summaries and study plans.
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion for the swipe stack. Quiz builds the persona; Match and Learn use the backend API.

---

## Built with

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui, Radix UI, Lucide React
- **Backend:** FastAPI, Python, Pydantic, Uvicorn
- **AI:** OpenAI-compatible API (e.g. Azure OpenAI) for personalized summaries and study plans
- **Data:** JSON file storage (teachers, students, likes)

---

## Run locally

### 1. Backend (API)

From the repo root:

```bash
.venv/bin/uvicorn main:app --reload --port 8765
```

Or: `source .venv/bin/activate` then `uvicorn main:app --reload --port 8765`.

Optional: copy `.env.example` to `.env` and set `OPENAI_API_KEY` for AI summaries and study plans.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app expects the API at `http://localhost:8765` by default (override with `NEXT_PUBLIC_API_URL`).

---

## Deploy on Vercel (and test with a QR code)

The **frontend** is deployed on [Vercel](https://vercel.com):

1. Push the repo to GitHub and import the project in Vercel (use the `frontend` directory as the root, or deploy the monorepo with root directory set to `frontend`).
2. Set **Environment variables** in Vercel:
   - `NEXT_PUBLIC_API_URL` = your backend API URL (e.g. `https://your-api.railway.app` or wherever you host the FastAPI app).
3. Deploy. Vercel will give you a URL like `https://unitinder-xxx.vercel.app`.

**Backend:** Host the FastAPI app elsewhere (e.g. [Railway](https://railway.app), [Render](https://render.com), or a small VM), then use that URL as `NEXT_PUBLIC_API_URL` in Vercel.

### Test with a QR code

Once the frontend is live on Vercel:

- Use your **Vercel deployment URL** (e.g. `https://unitinder-xxx.vercel.app`) in any QR code generator (e.g. [qr-code-generator.com](https://www.qr-code-generator.com/) or [goqr.me](https://goqr.me/)).
- Share the QR code so testers can **scan it on their phone** and open UniTinder in the browser—no app install needed.

---

## Project structure

- `main.py` — FastAPI app, match/students/teachers/likes/learn APIs
- `matching.py` — 24-dimension ranking and compatibility scoring
- `teachers.json`, `students.json`, `likes.json` — data (override paths via env if needed)
- `frontend/` — Next.js app (quiz, match, saved, learn, teacher dashboard)
