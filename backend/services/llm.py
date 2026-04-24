import litellm
import os
from dotenv import load_dotenv
from prompts.py import SYSTEM_PROMPT

load_dotenv()


def generate_manim_script(topic: str) -> str:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL", "gemini/gemini-2.0-flash"),
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",  "content": f("Topic: {topic}")}
        ]
    )
    return response.choices[0].message.content
