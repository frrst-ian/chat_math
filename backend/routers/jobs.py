from fastapi import APIRouter, HTTPException
from store import jobs

router = APIRouter(prefix="/api/jobs", tags=["post"])


@router.get("/{job_id}")
def get_job(job_id: str) -> dict:
    if job_id in jobs:
        return jobs[job_id]
    raise HTTPException(status_code=404, detail="Job not found")
