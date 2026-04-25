import subprocess
import hashlib
import os
import tempfile
from services.llm import generate_manim_script, fix_manim_script


def topic_hash(topic: str) -> str:
    # generate a unique file name from the topic string
    return hashlib.md5(topic.lower().strip().encode()).hexdigest()[:12]


def video_exists(topic: str) -> str | None:
    path = f"videos/{topic_hash(topic)}.mp4"
    return path if os.path.exists(path) else None


def run_manim(script: str, topic: str) -> str:
    script_path = os.path.join(tempfile.gettempdir(), f"{topic_hash(topic)}.py")
    media_dir = os.path.join(tempfile.gettempdir(), "media")

    def attempt(s: str) -> subprocess.CompletedProcess:
        with open(script_path, "w") as f:
            f.write(s)
            
        # kill after 180s so a broken script doesn't hang on the server
        return subprocess.run(
            ["manim", "-ql", script_path, "ExplainScene", "--media_dir", media_dir],
            capture_output=True, text=True, timeout=180
        )

    result = attempt(script)
    # if the script fails, regenerate the script 
    if result.returncode != 0:
        fixed = fix_manim_script(script, result.stderr)
        result = attempt(fixed)

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    output_path = f"videos/{topic_hash(topic)}.mp4"
    os.rename(
        os.path.join(media_dir, "videos", topic_hash(topic), "480p15", "ExplainScene.mp4"),
        output_path
    )
    return output_path
