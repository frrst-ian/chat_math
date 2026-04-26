from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from uuid import uuid4
from store import jobs
from services.manim_runner import run_manim, video_exists
from services.llm import generate_explanation
import asyncio

from models.chat_model import ChatRequest


router = APIRouter(prefix="/api/chat", tags=["post"])


@router.post("")
async def chat(payload: ChatRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    jobs[job_id] = {"status": "pending",
                    "video_url": None, "explanation": None}
    # run a background task after returning job_id
    background_tasks.add_task(run_job, job_id, payload.topic)
    return {"job_id": job_id}


async def run_job(job_id: str, topic: str):
    try:
        jobs[job_id]["status"] = "rendering"

        cached = video_exists(topic)
        if cached:
            # already rendered before, wrap in a task
            render_task = asyncio.create_task(
                asyncio.to_thread(lambda: cached))
        else:
            # kick off render in background thread without waiting
            render_task = asyncio.create_task(
                asyncio.to_thread(run_manim, topic))

        # kick off explanation at the same time as render
        explain_task = asyncio.create_task(
            asyncio.to_thread(generate_explanation, topic))

        # save explanation immediately
        explanation = await explain_task
        jobs[job_id]["explanation"] = explanation

        # wait for the slow render to finish
        video_path = await render_task
        jobs[job_id].update({"status": "done", "video_url": f"/{video_path}"})
    except Exception as e:
        jobs[job_id].update({"status": "failed", "error": str(e)})
