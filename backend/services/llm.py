import litellm
import os
from dotenv import load_dotenv
from services.prompts import MANIM_SCRIPT_GENERATION_PROMPT, TOPIC_EXPLANATION_PROMPT, CLASSIFIER_PROMPT, JSON_PLAN_PROMPT, PROBLEM_EXPLANATION_PROMPT
from services import rag
import re
import json

load_dotenv()


# Stage 1: Generate a structured JSON animation plan from a natural language topic
def generate_plan(topic: str) -> dict:
    response = litellm.completion(
        model=os.getenv("LLM_MODEL"),
        messages=[
            {"role": "system", "content": JSON_PLAN_PROMPT},  # System prompt that instructs Gemini to return a JSON blueprint
            {"role": "user", "content": topic}                # Teacher's raw input (e.g. "explain the pythagorean theorem")
        ],
    )
    raw = response.choices[0].message.content

    # Extract JSON object from the response, ignoring any surrounding text
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("Invalid JSON plan")
    return json.loads(match.group(0))


# Stage 2: Convert the JSON plan into executable Manim Python code
def generate_manim_script(topic: str, retries: int = 2) -> str:
    last_error = ValueError("No attempts made")

    for _ in range(retries):  # Retry up to 2 times on failure
        try:
            plan = generate_plan(topic)  # Run Stage 1 first

            if not is_valid_plan(plan):  # Validate plan structure before proceeding
                continue

            response = litellm.completion(
                model=os.getenv("LLM_MODEL"),
                messages=[
                    {"role": "system", "content": MANIM_SCRIPT_GENERATION_PROMPT},       # Instructs Gemini to write Manim code
                    {"role": "user", "content": f"PLAN:\n{json.dumps(plan, indent=2)}"}  # Passes the JSON plan as input
                ],
            )

            # Strip markdown code fences (e.g. ```python) from the raw response
            return _strip_fences(response.choices[0].message.content)

        except Exception as e:
            last_error = e
            continue  # Retry on any exception

    raise ValueError(f"Failed to generate valid Manim script: {last_error}")


def generate_explanation(topic: str, input_type: str = "topic") -> str:
    context = rag.query(topic)
    if input_type == "problem":
        prompt = PROBLEM_EXPLANATION_PROMPT
    else:
        prompt = TOPIC_EXPLANATION_PROMPT.format(
            context=context or "No curriculum context available.")
    response = litellm.completion(
        model=os.getenv("LLM_MODEL"),
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": topic}
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
