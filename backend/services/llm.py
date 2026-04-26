import litellm
import os
from dotenv import load_dotenv
from services.prompts import MANIM_SCRIPT_GENERATION_PROMPT, TOPIC_EXPLANATION_PROMPT, CLASSIFIER_PROMPT, JSON_PLAN_PROMPT
from services import rag
import re
import json

load_dotenv()


def generate_plan(topic: str) -> dict:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL"),
        messages=[
            {"role": "system", "content": JSON_PLAN_PROMPT},
            {"role": "user", "content": topic}
        ],
    )

    raw = response.choices[0].message.content

    # extract JSON safely
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("Invalid JSON plan")

    return json.loads(match.group(0))


def generate_manim_script(topic: str, retries: int = 2) -> str:
    last_error = ValueError("No attempts made")
    for _ in range(retries):
        try:
            plan = generate_plan(topic)
            if not is_valid_plan(plan):
                continue

            response = litellm.completion(
                model=os.getenv("LLM_MODEL"),
                messages=[
                    {"role": "system", "content": MANIM_SCRIPT_GENERATION_PROMPT},
                    {"role": "user", "content": f"PLAN:\n{json.dumps(plan, indent=2)}"}

                ],
            )

            return _strip_fences(response.choices[0].message.content)

        except Exception as e:
            last_error = e
            continue
    raise ValueError(f"Failed to generate valid Manim script: {last_error}")


def generate_explanation(topic: str) -> str:
    context = rag.query(topic)
    prompt = TOPIC_EXPLANATION_PROMPT.format(
        context=context or "No curriculum context available.")
    response = litellm.completion(
        model=os.getenv("LLM_MODEL"),
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Topic: {topic}"}
        ],
    )
    return response.choices[0].message.content


def is_valid_plan(plan: dict) -> bool:
    return (
        "type" in plan and
        "steps" in plan and
        isinstance(plan["steps"], list) and
        1 <= len(plan["steps"]) <= 6
    )


def classify_input(topic: str) -> str:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL"),
        messages=[
            {"role": "system", "content": CLASSIFIER_PROMPT},
            {"role": "user", "content": topic}
        ],
    )
    return response.choices[0].message.content.strip().lower()


def _strip_fences(script: str) -> str:
    """Remove markdown code fences that LLMs sometimes add despite instructions."""
    script = script.strip()
    if script.startswith("```"):
        script = script.split("\n", 1)[-1]
    if script.endswith("```"):
        script = script.rsplit("\n", 1)[0]
    return script.strip()
