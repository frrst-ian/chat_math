import subprocess
import hashlib
import os
import tempfile
from services.llm import generate_manim_script


def topic_hash(topic: str) -> str:
    # generate a unique file name from the topic string
    return hashlib.md5(topic.lower().strip().encode()).hexdigest()[:12]


def video_exists(topic: str) -> str | None:
    path = f"videos/{topic_hash(topic)}.mp4"
    return path if os.path.exists(path) else None


def run_manim(topic: str) -> str:
    script_path = os.path.join(tempfile.gettempdir(), f"{topic_hash(topic)}.py")
    media_dir = os.path.join(tempfile.gettempdir(), f"media_{topic_hash(topic)}")

    os.makedirs(media_dir, exist_ok=True)

    def attempt(s: str) -> subprocess.CompletedProcess:
        s = _strip_fences(s)

        with open(script_path, "w") as f:
            f.write(s)

        # kill after 180s so a broken script doesn't hang on the server
        return subprocess.run(
            ["manim", "-ql", script_path, "VisualizationScene",
                "--media_dir", media_dir],
            capture_output=True,
            text=True,
            timeout=180
        )

    last_error = None

    # retry generation instead of trying to fix broken code
    for _ in range(3):
        script = generate_manim_script(topic)
        result = attempt(script)

        if result.returncode == 0:
            output_path = f"videos/{topic_hash(topic)}.mp4"

            src = os.path.join(
                media_dir,
                "videos",
                topic_hash(topic),
                "480p15",
                "VisualizationScene.mp4"
            )

            if not os.path.exists(src):
                raise RuntimeError("Manim finished but output video not found")

            os.rename(src, output_path)
            return output_path

        last_error = result.stderr

    raise RuntimeError(last_error)


def _strip_fences(script: str) -> str:
    """Remove markdown code fences that LLMs sometimes add despite instructions."""
    script = script.strip()
    if script.startswith("```"):
        script = script.split("\n", 1)[-1]
    if script.endswith("```"):
        script = script.rsplit("\n", 1)[0]
    return script.strip()
