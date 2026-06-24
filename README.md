# ChatMath

An AI-powered platform where students and teachers type plain language prompts and instantly receive animated mathematical visualizations and explanations.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Choosing a Model](#choosing-a-model)
- [Curriculum Data (RAG)](#curriculum-data-rag)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Team](#team)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Animation | Manim Community Edition |
| LLM | LiteLLM (model-agnostic) |
| Auth | Supabase |
| Vector DB | ChromaDB |

---

## Prerequisites

Before you begin, make sure you have the following installed:

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Manim Community Edition](https://docs.manim.community/en/stable/installation.html)
- A [Supabase](https://supabase.com) project (for auth and chat history)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd chatmath
```

### 2. Backend

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

cp .env.example .env   # then fill in your values (see Environment Variables)

pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install

cp .env.example .env   # then fill in your values (see Environment Variables)

npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### `backend/.env`

```env
LLM_MODEL=                   # e.g. gemini/gemini-2.0-flash (see Choosing a Model)
OPENAI_API_KEY=              # required if using an OpenAI model
ANTHROPIC_API_KEY=           # required if using a Claude model
GEMINI_API_KEY=              # required if using a Gemini model
SUPABASE_URL=                # your Supabase project URL
SUPABASE_JWT_SECRET=         # found in Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=   # found in Supabase → Settings → API
SUPABASE_ANON_KEY=           # found in Supabase → Settings → API
```

### `frontend/.env`

```env
VITE_API_URL=                # backend URL, e.g. http://localhost:8000
VITE_SUPABASE_URL=           # your Supabase project URL
VITE_SUPABASE_ANON_KEY=      # your Supabase anon key
```

---

## Choosing a Model

ChatMath uses [LiteLLM](https://docs.litellm.ai/docs/) — set `LLM_MODEL` to any supported model string.

| Model | `LLM_MODEL` value | Notes |
|---|---|---|
| Gemini 2.0 Flash | `gemini/gemini-2.0-flash` | Free tier, recommended for getting started |
| Gemini 3 Flash Preview | `gemini/gemini-3-flash-preview` | Free tier, quota runs out fast |
| GPT-4o Mini | `gpt-4o-mini` | Paid |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | Paid |

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey).

---

## Curriculum Data (RAG)

ChatMath uses RAG to ground explanations in real curriculum content.

### 1. Download the PDF data

Download the curriculum PDFs from [Google Drive](https://drive.google.com/drive/u/3/folders/1MNZCbw3Nq-afqrK9Mm3KhiQR7OeoF_CS) and place them in a `math_data/` folder inside `backend/`:

```bash
mkdir backend/math_data
# place downloaded PDFs here
```

### 2. Run the ingestion script

This chunks and embeds the PDFs into ChromaDB:

```bash
cd backend
python ingest.py
```

The script processes up to 20 pages per PDF and saves embeddings to `backend/chroma_db/`. Re-run this any time you add or update PDFs.

---

## Running Tests

```bash
cd backend
pytest
```

Tests are located in `backend/tests/`. They cover the RAG pipeline and LLM service layer using mocks so no API keys are required to run them.

---

## Deployment

### Backend → [Render](https://render.com)

1. Connect your repository in the Render dashboard
2. `render.yaml` is already configured at the project root
3. Add your environment variables under **Environment** in the Render dashboard
4. Deploy — note that the first build takes ~15 minutes due to Manim's system dependencies

### Frontend → [Netlify](https://netlify.com)

1. Connect your repository in the Netlify dashboard
2. `netlify.toml` is already configured at the project root
3. Add your environment variables under **Site settings → Environment variables**
4. Deploy

---

## Project Structure

```
chatmath/
├── backend/
│   ├── middleware/         # JWT auth
│   ├── models/             # Pydantic request models
│   ├── routers/            # API route handlers (chat, jobs, topics, recommendations)
│   ├── services/
│   │   ├── llm.py          # LiteLLM wrappers (plan, script, explanation, title)
│   │   ├── manim_runner.py # Manim script execution and video caching
│   │   ├── rag.py          # ChromaDB query
│   │   ├── prompts.py      # All LLM prompt templates
│   │   └── curriculum_alert.py  # In-memory topic tracking for recommendations
│   ├── ingest.py           # PDF ingestion script
│   ├── main.py             # FastAPI app entry point
│   ├── store.py            # In-memory job store
│   └── topics.py           # Preset topic shortcuts
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── helpers/        # API client, Supabase client, chat storage
│   │   ├── hooks/          # useChat hook
│   │   └── pages/          # Route-level page components
│   └── vite.config.js
├── render.yaml
└── netlify.toml
```

---

## Team

**Phive Minds** — Bicol University