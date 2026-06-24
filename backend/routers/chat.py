from fastapi import APIRouter, BackgroundTasks, Depends
from uuid import uuid4
from store import jobs
from services.manim_runner import run_manim, video_exists
from services.llm import generate_explanation, classify_input
from services.curriculum_alert import log_query
from middleware.auth import verify_token
from models.chat_model import ChatRequest
from topics import TOPICS
import asyncio

router = APIRouter(prefix="/api/chat", tags=["post"])

class ChatRequest(ChatRequest):
    has_video: bool = False

@router.post("")
async def chat(payload: ChatRequest, background_tasks: BackgroundTasks, user=Depends(verify_token)):
    job_id = str(uuid4())
    jobs[job_id] = {"status": "pending", "video_url": None, "explanation": None}
    query = TOPICS.get(payload.topic, payload.topic)
    background_tasks.add_task(run_job, job_id, query, user["sub"], payload.has_video)
    return {"job_id": job_id}

@router.get("")
def get_topics(user=Depends(verify_token)):
    return list(TOPICS.keys())

async def run_job(job_id: str, topic: str, user_id: str, has_video: bool):
    try:
        jobs[job_id]["status"] = "rendering"
        log_query(topic, user_id)

        if has_video:
            explain_task = asyncio.create_task(
                asyncio.to_thread(generate_explanation, topic, classify_input(topic))
            )
            explanation = await explain_task
            jobs[job_id].update({"status": "done", "explanation": explanation})
            return

        cached = video_exists(topic)
        if cached:
            render_task = asyncio.create_task(asyncio.to_thread(lambda: cached))
        else:
            render_task = asyncio.create_task(asyncio.to_thread(run_manim, topic))

        input_type = classify_input(topic)
        explain_task = asyncio.create_task(
            asyncio.to_thread(generate_explanation, topic, input_type)
        )

        explanation = await explain_task
        jobs[job_id]["explanation"] = explanation

        video_path = await render_task
        jobs[job_id].update({"status": "done", "video_url": f"/{video_path}"})
    except Exception as e:
        jobs[job_id].update({"status": "failed", "error": str(e)})