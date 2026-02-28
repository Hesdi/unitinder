# UniTinder

**Stop guessing which teacher fits you. Swipe, match, learn.**

Picking a teacher used to mean picking a subject and hoping for the best. UniTinder changes that: a short quiz learns *how* you learn, then we show you teachers ranked by real compatibility—with explanations, not just scores. Swipe the ones you like, get study plans in their style, and (if you’re a teacher) see who you’re resonating with—anonymized.

---

## Why UniTinder?

- **Learning style, not just subject.** We match on 24 dimensions—pace, structure, interactivity, need for visuals, feedback style, and more—so you see *why* a teacher fits, not just that they teach the class.
- **No more mismatch.** Get a compatibility score and a short, personalized “why this teacher for you” summary so you know what you’re choosing before you commit.
- **Swipe to save.** Like Tinder, but for your education: swipe right to save teachers to “My teachers,” then dive into study plans and summaries whenever you’re ready.
- **Study plans in *their* voice.** Request a topic and get a study plan generated in that teacher’s style—their pacing, tone, and structure—so it feels like learning from them, not from a generic bot.
- **Teachers get insights too.** See who tends to like you (archetypes, alignment traits)—anonymized, no names—so you understand your “audience” and can improve.

---

## What makes UniTinder different

Other tools match you to courses or subjects. UniTinder matches you to **teaching styles**. We don’t just say “here are Analysis teachers”—we say “here are Analysis teachers ranked by how well their style fits *your* profile,” with clear reasons and the option to learn from them via AI-generated study plans. For teachers, we add anonymized dashboards so you see which kinds of learners you attract. It’s matching built for how people actually learn and teach.

---

## Try it

- **Live app:** [Add your Vercel URL here after deploy] — open in any browser.
- **On your phone:** Scan the QR code (from the live URL) to try UniTinder on mobile—no app install needed.

---

## Deploy on Vercel (frontend only)

1. **Import the repo** in Vercel and set **Root Directory** to `frontend`.
2. **Turn off** “Include source files outside of Root Directory” in Project Settings → General so Vercel doesn’t try to build the Python backend.
3. **Teachers work without a backend:** the app ships with `frontend/public/teachers.json`, so the Teachers list and Learn page (static summary) work with no extra setup.
4. **Optional—Match, likes, study plans:** deploy the backend (see [DEPLOY.md](./DEPLOY.md)) and set `NEXT_PUBLIC_API_URL` in Vercel for the full quiz → match → study plan flow.
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
