from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from uuid import uuid4
from store import jobs
from services.manim_runner import run_manim, video_exists
from services.llm import generate_manim_script, generate_explanation

router = APIRouter(prefix="/api/chat", tags=["post"])


class ChatRequest(BaseModel):
    topic: str


@router.post("")
async def chat(payload: ChatRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    jobs[job_id] = {"status": "pending",
                    "video_url": None, "explanation": None}
    background_tasks.add_task(run_job, job_id, payload.topic)
    return {"job_id": job_id}


async def run_job(job_id: str, topic: str):
    try:
        jobs[job_id]["status"] = "rendering"

        cached = video_exists(topic)
        if cached:
            video_path = cached
        else:
            script = generate_manim_script(topic)
            video_path = run_manim(script, topic)

        explanation = generate_explanation(topic)

        jobs[job_id].update({
            "status": "done",
            "video_url": f"/{video_path}",
            "explanation": explanation
        })

    except Exception as e:
        jobs[job_id].update({"status": "failed", "error": str(e)})
