from collections import defaultdict
from services.manim_runner import video_exists

THRESHOLD = 1  

competency_users: dict = defaultdict(set)

COMPETENCY_RELATED = {
    "Number Line": [
        "How does a number line work?",
        "Negative numbers on a number line",
        "Adding numbers using a number line",
    ],
    "Fractions & Ratios": [
        "What is a fraction?",
        "Adding fractions with different denominators",
        "Multiplying fractions",
    ],
    "Linear Equations": [
        "Solving linear equations graphically",
        "What is a variable?",
        "Slope intercept form",
    ],
    "Sets": [
        "What is a set?",
        "Union and intersection of sets",
        "Subsets explained",
    ],
}

def _classify_competency(topic: str) -> str:
    topic_lower = topic.lower()
    if any(w in topic_lower for w in ["number line", "number-line"]):
        return "Number Line"
    if any(w in topic_lower for w in ["fraction", "ratio"]):
        return "Fractions & Ratios"
    if any(w in topic_lower for w in ["linear", "equation", "solve"]):
        return "Linear Equations"
    if any(w in topic_lower for w in ["set", "element", "union"]):
        return "Sets"
    return "General Math"

def log_query(topic: str, user_id: str):
    competency = _classify_competency(topic)
    competency_users[competency].add(user_id)

def get_recommendations() -> list[dict]:
    recs = []
    for competency, users in competency_users.items():
        if len(users) >= THRESHOLD:
            related = COMPETENCY_RELATED.get(competency, [])
            for topic in related:
                video_path = video_exists(topic)
                recs.append({
                    "competency": competency,
                    "topic": topic,
                    "ready": video_path is not None,
                    "teacher_count": len(users),
                })
    return recs

def get_insights() -> list[dict]:
    return [
        {"competency": competency, "user_count": len(users)}
        for competency, users in competency_users.items()
    ]