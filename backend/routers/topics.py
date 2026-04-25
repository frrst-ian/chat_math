from fastapi import APIRouter
from topics import TOPICS

router = APIRouter(prefix="/api/topics", tags=["topics"])

@router.get("")
def get_topics():
    return TOPICS