from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routers import chat, jobs, topics, recommendations

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(jobs.router)
app.include_router(topics.router)
app.include_router(recommendations.router)

app.mount("/videos", StaticFiles(directory="videos"), name="videos")

@app.get("/")
async def index():
    return {"message": "Welcome to Chat Math API", "documentation": "/docs"}