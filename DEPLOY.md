# Deploy UniTinder Backend

The frontend (Vercel) needs a **public API URL**. Deploy the FastAPI backend to Railway or Render, then set `NEXT_PUBLIC_API_URL` in Vercel to that URL.

---

## Option A: Railway

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo** → select your UniTinder repo.
3. Railway will detect the `Procfile` and run:
   - `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
4. In the project, open **Variables** and add:
   - `OPENAI_API_KEY` = your OpenAI or Azure OpenAI key (required for AI summaries and study plans).
   - Optionally: `OPENAI_BASE_URL`, `OPENAI_MODEL` (for Azure).
5. Open **Settings** → **Networking** → **Generate Domain**. Copy the URL (e.g. `https://unitinder-xxx.up.railway.app`).
6. In **Vercel** → your frontend project → **Settings** → **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL` = `https://your-railway-url.up.railway.app` (no trailing slash).
7. Redeploy the frontend on Vercel so it picks up the new env var.

---

## Option B: Render

1. Go to [render.com](https://render.com) and sign in (e.g. with GitHub).
2. **New** → **Blueprint** → connect the UniTinder repo. Render will use the repo’s `render.yaml` to create a Web Service.
3. Or **New** → **Web Service** → connect the repo, set:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root directory:** leave empty (repo root).
4. In the service **Environment** tab, add:
   - `OPENAI_API_KEY` = your key.
   - Optionally: `OPENAI_BASE_URL`, `OPENAI_MODEL`.
5. After deploy, copy the service URL (e.g. `https://unitinder-api.onrender.com`).
6. In **Vercel** → frontend project → **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL` = `https://your-render-url.onrender.com` (no trailing slash).
7. Redeploy the frontend on Vercel.

---

## After deploy

- Open `https://your-frontend.vercel.app` and use the app. Teachers and match should load.
- If you see “No teacher data available”, check that `NEXT_PUBLIC_API_URL` is set in Vercel and that the backend URL opens in the browser (e.g. `https://your-api.railway.app/api/teachers` returns JSON).
