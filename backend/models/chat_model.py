from pydantic import BaseModel, validator

class ChatRequest(BaseModel):
    topic: str

    @validator("topic")
    def validate_topic(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Topic cannot be empty")
        if len(v) > 200:
            raise ValueError("Topic too long")
        return v