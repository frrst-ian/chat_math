from fastapi import APIRouter, Depends, BackgroundTasks
from middleware.auth import verify_token
from services.curriculum_alert import get_recommendations, get_insights
from services.manim_runner import run_manim, video_exists
from store import jobs
from uuid import uuid4

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("")
def list_recommendations(user=Depends(verify_token)):
    return get_recommendations()

@router.get("/insights")
def list_insights(user=Depends(verify_token)):
    return get_insights()

@router.post("/generate")
async def generate_recommendation(
    payload: dict,
    background_tasks: BackgroundTasks,
    user=Depends(verify_token)
):
    topic = payload["topic"]
    job_id = str(uuid4())
    jobs[job_id] = {"status": "pending", "video_url": None}
    background_tasks.add_task(_render_and_track, job_id, topic)
    return {"job_id": job_id}

def _render_and_track(job_id: str, topic: str):
    try:
        video_path = run_manim(topic)
        jobs[job_id].update({"status": "done", "video_url": f"/{video_path}"})
    except Exception as e:
        jobs[job_id].update({"status": "failed", "error": str(e)})