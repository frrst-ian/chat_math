import litellm
import os
from dotenv import load_dotenv
from prompts import MANIM_SCRIPT_GENERATION_PROMPT, TOPIC_EXPLANATION_PROMPT

load_dotenv()


script_ai_model: str = "gemini/gemini-2.0-flash"
explanation_ai_model: str = "gemini/gemini-2.0-flash"


def generate_manim_script(topic: str) -> str:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL", script_ai_model),
        messages=[
            {"role": "system", "content": MANIM_SCRIPT_GENERATION_PROMPT},
            {"role": "user",  "content": f"Topic: {topic}"}
        ]
    )
    return response.choices[0].message.content


def generate_explanation(topic: str) -> str:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL", explanation_ai_model),
        messages=[
            {"role": "system", "content": TOPIC_EXPLANATION_PROMPT},
            {"role": "user", "content": f"Topic {topic}"}
        ]
    )

    return response.choices[0].message.content
