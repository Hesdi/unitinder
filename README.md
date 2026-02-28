# UniTinder

**Find teachers that match how you learn.** Take a short quiz to build your learning profile, then see your best-matched teachers by subject—and swipe to save your favorites.

---

## Try it

- **Live app:** [Add your Vercel URL here after deploy] — open in any browser.
- **On your phone:** Scan the QR code (generated from the live URL) to try UniTinder on mobile—no app install needed.

---

## What you can do

- **Take the quiz** — Answer ~20 questions to build your learning profile (pace, structure, interactivity, and more).
- **Match with teachers** — Pick a subject and see teachers ranked by fit. Each card shows a compatibility score and a short explanation of why they match (or don’t).
- **Swipe** — Swipe right to like, left to pass. Liked teachers are saved under **My teachers**.
- **Learn** — Open a teacher and request a **study plan** for any topic; it’s generated in that teacher’s style. You’ll also see a personalized summary for you and that teacher.
- **Teacher view** — Use **“I’m a teacher”** to open the teacher list and a dashboard with anonymized insights (who tends to like you, which traits align).

---

## Deploy on Vercel (frontend only)

1. **Import the repo** in Vercel and set **Root Directory** to `frontend` (not the repo root).
2. **Turn off “Include source files outside of Root Directory”**  
   Project Settings → General → Root Directory → **uncheck** “Include source files outside of Root Directory”.  
   If this is on, Vercel sees the Python backend and tries to build it, which causes errors like “no FastAPI entry point found”. The frontend does not need the backend files.
3. **Teachers work without a backend:** the app ships with `frontend/public/teachers.json`, so the Teachers list and Learn page (static summary) work on Vercel with no extra setup.
4. **Optional – Match, likes, study plans:** for the quiz → match flow, saved likes, and AI study plans, deploy the backend (see [DEPLOY.md](./DEPLOY.md)) and set `NEXT_PUBLIC_API_URL` in Vercel. Without this, the deployed app will show “No teacher data available” because it tries to call `localhost:8765` from the user’s browser.
5. Deploy. Your app will be at e.g. `https://unitinder-xxx.vercel.app`.

---

## Run it yourself

**Backend (API)** — from the repo root:

```bash
.venv/bin/uvicorn main:app --reload --port 8765
```

Optional: copy `.env.example` to `.env` and set `OPENAI_API_KEY` for AI summaries and study plans.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app talks to the API at `http://localhost:8765` by default.

---

## Built with

Next.js, React, TypeScript, Tailwind, Framer Motion, FastAPI, Python, OpenAI-compatible API (e.g. Azure OpenAI).
