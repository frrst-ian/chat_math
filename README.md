# ChatMath
An AI-powered platform where students and teachers type plain language prompts and instantly receive animated mathematical visualizations and explanations.

---

## Tech Stack
- **Frontend** — React + Vite
- **Backend** — FastAPI
- **Animation** — Manim Community Edition
- **LLM** — LiteLLM (model-agnostic)
- **Auth** — Supabase
- **Vector DB** — ChromaDB

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Manim Community Edition — [install guide](https://docs.manim.community/en/stable/installation.html)
- Supabase project — [supabase.com](https://supabase.com)

### Backend
```bash
cd backend
python -m venv venv

# Mac/Linux
source venv/bin/activate
cp .env.example .env

# Windows
venv\Scripts\activate
copy .env.example .env

pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install

# Mac/Linux
cp .env.example .env

# Windows
copy .env.example .env

npm run dev
```

---

## Environment Variables

`backend/.env`
```
LLM_MODEL=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
```

`frontend/.env`
```
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Choosing a Model

ChatMath uses [LiteLLM](https://docs.litellm.ai/docs/) — set `LLM_MODEL` to any supported model string.

| Model | `LLM_MODEL` value | Notes |
|-------|------------------|-------|
| Gemini 2.0 Flash | `gemini/gemini-2.0-flash` | Free tier |
| Gemini 3 Flash Preview | `gemini/gemini-3-flash-preview` | Free tier, quota runs out fast |
| GPT-4o Mini | `gpt-4o-mini` | Paid |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | Paid |

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey).

---

## Curriculum Data (RAG)

ChatMath uses RAG to ground explanations in real curriculum content. Download the PDF data from [Google Drive](YOUR_LINK_HERE), create a `math_data/` folder inside `backend/`, and place the PDFs there.

```bash
mkdir backend/math_data
```

Then run the ingestion script to chunk and embed the PDFs into ChromaDB:

```bash
cd backend
python ingest.py
```

---

## Deploy

- **Backend** → Render — connect repo, `render.yaml` is at root, add env vars in dashboard
- **Frontend** → Netlify — connect repo, `netlify.toml` is at root, add env vars in dashboard

> First Render build takes ~15 mins due to Manim's system dependencies.

---

## Team
**Phive Minds** — Bicol University 