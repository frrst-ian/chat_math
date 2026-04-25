import litellm
import os
from dotenv import load_dotenv
from services.prompts import MANIM_SCRIPT_GENERATION_PROMPT, TOPIC_EXPLANATION_PROMPT, CLASSIFIER_PROMPT

load_dotenv()


def generate_manim_script(topic: str) -> str:
    # TODO: classify input, inject RAG context for topics
    response = litellm.completion(
        model=os.getenv("LLM_MODEL",  "groq/llama-3.3-70b-versatile"),
        messages=[
            {"role": "system", "content": MANIM_SCRIPT_GENERATION_PROMPT},
            {"role": "user",  "content": f"Topic: {topic}"}
        ]
    )
    return response.choices[0].message.content


def generate_explanation(topic: str) -> str:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL",  "groq/llama-3.3-70b-versatile"),
        messages=[
            {"role": "system", "content": TOPIC_EXPLANATION_PROMPT},
            {"role": "user", "content": f"Topic {topic}"}
        ]
    )

    return response.choices[0].message.content


def fix_manim_script(script: str, error: str) -> str:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL", "groq/llama-3.3-70b-versatile"),
        messages=[
            {"role": "system", "content": MANIM_SCRIPT_GENERATION_PROMPT},
            {"role": "user", "content": f"This script failed with error:\n{error}\n\nFix it:\n{script}"}
        ]
    )
    return response.choices[0].message.content


def classify_input(topic: str) -> str:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL", "groq/llama-3.3-70b-versatile"),
        messages=[
            {"role": "system", "content": CLASSIFIER_PROMPT},
            {"role": "user", "content": topic}
        ]
    )
    return response.choices[0].message.content.strip().lower()
