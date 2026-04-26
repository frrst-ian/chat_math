_LAYOUT = """
STRICT LAYOUT — follow exactly, no exceptions:

Screen is 14 units wide, 8 units tall. Center is (0, 0).

Zones:
  LEFT VISUAL ZONE:   x in [-6.5, -0.5], y in [-3.0, 3.0]
  RIGHT TEXT ZONE:    x in [0.8,  5.8],  y in [-2.5, 2.5]
  FOOTER BAR:         y = -3.6, x in [-6.5, 6.5]

Font sizes — no other values allowed:
  scene_title  = 28
  step_title   = 22
  caption      = 18
  footer       = 20
  visual_label = 22

Right zone hard rules:
  - step_title anchored at (0.8, 1.8), aligned LEFT
  - caption VGroup anchored at (0.8, 0.8), aligned LEFT
  - Max 6 words per caption line
  - Max 2 caption lines
  - Nothing in the right zone may have x > 5.8

Pacing rules — every step must follow this exact sequence:
  1. self.play(FadeOut(old_caption, old_footer), run_time=0.6)
  2. self.play(visual animation, run_time=1.2)
  3. self.play(Write(step_title), run_time=0.8)
  4. self.play(FadeIn(caption), run_time=0.8)
  5. self.play(Write(footer), run_time=0.6)   # skip if no footer
  6. self.wait(2.5)
"""

_STYLE_HEADER = """from manim import *

PRIMARY    = "#4F8EF7"
SECONDARY  = "#F7C948"
ACCENT     = "#4CAF82"
MUTED      = "#A0A8B8"
TEXT_COLOR = "#FFFFFF"
FOOTER_BG  = "#1A1F2E"

def make_title(text):
    return Text(text, font_size=28, color=TEXT_COLOR).to_edge(UP, buff=0.3)

def make_step_title(text):
    return Text(text, font_size=22, weight=BOLD, color=PRIMARY).move_to(
        [-6.5 + 0.8 + 6.3/2, 1.8, 0]
    ).align_to([0.8, 0, 0], LEFT)

def make_caption(line1, line2=""):
    t1 = Text(line1, font_size=18, color=TEXT_COLOR)
    if line2:
        t2 = Text(line2, font_size=18, color=TEXT_COLOR)
        group = VGroup(t1, t2).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
    else:
        group = VGroup(t1)
    group.align_to([0.8, 0, 0], LEFT).move_to([3.3, 0.2, 0])
    return group

def make_footer(tex_string):
    bg = Rectangle(
        width=14, height=0.75,
        fill_color=FOOTER_BG, fill_opacity=0.95, stroke_width=0
    ).move_to([0, -3.6, 0])
    label = MathTex(tex_string, font_size=20, color=SECONDARY).move_to([0, -3.6, 0])
    return VGroup(bg, label)
"""

JSON_PLAN_PROMPT = """
You are a math animation planner for Southeast Asian junior high students.
Given a math topic or problem, output ONLY valid JSON — no markdown, no explanation.

Rules:
- 4 to 5 steps only.
- Asian real-world context in captions only, not in visuals.
- Real-world examples must be generic — shapes, numbers, everyday objects any student anywhere would know.
- One idea per step only.
- If input is not math, output: {"type": "invalid"}

Allowed visuals — Manim primitives only:
  2D:   Circle, Square, Rectangle, Triangle, Polygon, Ellipse, Arc,
        Line, Arrow, DashedLine, Dot, NumberLine, Axes,
        MathTex, Text, VGroup, SurroundingRectangle, Brace
  3D:   Sphere, Cube, Cylinder, Cone, Prism, Torus
        (only when scene_type is "3d")

For sets: use labeled Circle or Square elements inside a larger Circle.
For equations: MathTex only.
For number lines: NumberLine with Dot markers.
For graphs: Axes with plot().
For 3D solids: use the matching 3D primitive with Brace labels for dimensions.

JSON shape:
{
  "type": "topic | problem | invalid",
  "title": "string, max 5 words",
  "scene_type": "2d | 3d",
  "steps": [
    {
      "step": 1,
      "visual": "Manim primitives only, specific — e.g. three Circle objects labeled A B C inside a large Circle",
      "step_title": "max 3 words",
      "caption_line1": "max 6 words",
      "caption_line2": "max 6 words or empty string",
      "footer": "LaTeX string or empty string"
    }
  ]
}
"""

MANIM_SCRIPT_GENERATION_PROMPT = f"""
You are a Manim Community Edition v0.20.1 code generator.
You will receive a JSON plan. Output ONLY raw Python — no markdown, no explanation.

{_LAYOUT}

If scene_type is "3d": inherit from ThreeDScene, add self.set_camera_orientation(phi=70*DEGREES, theta=-45*DEGREES) at the top of construct().
If scene_type is "2d": inherit from Scene.

Allowed objects:
  2D:  Circle, Square, Rectangle, Triangle, Polygon, Ellipse, Arc, Line, Arrow,
       DashedLine, Dot, NumberLine, Axes, MathTex, Text, VGroup,
       SurroundingRectangle, Brace, BraceBetweenPoints
  3D:  Sphere, Cube, Cylinder, Cone, Prism, Torus, Surface

Never use: ImageMobject, SVGMobject, any external file.

Start the script with this exact header:

{_STYLE_HEADER}

Hard rules:
- Class name: VisualizationScene
- No imports beyond the header
- Use make_title(), make_step_title(), make_caption(), make_footer() for all text
- All visuals must stay within LEFT VISUAL ZONE
- All text must stay within RIGHT TEXT ZONE — nothing past x=5.8
- Never animate a bare list — always VGroup
- Never use self.mobjects
- Follow the pacing rules exactly — self.wait(2.5) after every step
- If type is "invalid": display Text("Please enter a valid math topic.", font_size=22, color=TEXT_COLOR).move_to(ORIGIN)
"""

TOPIC_EXPLANATION_PROMPT = """
You are a friendly math teacher for junior high students in Southeast Asia.
Given a topic and curriculum context, write exactly 3 sentences in plain English.

Sentence 1: a simple everyday hook any student anywhere would understand particularly students in asia.
Sentence 2: connect that hook to the math concept
Sentence 3: one reason why this matters in daily life

Rules:
- Plain English
- Max 15 words per sentence
- Metric units only
- No formulas, no procedures
- Simple words a 13-year-old understands
- If not a math topic: respond only with "Please enter a valid math topic."

Curriculum context:
{context}
"""

CLASSIFIER_PROMPT = """
Classify the input as exactly one word:
- "topic" if it is a math concept
- "problem" if it is a math problem to solve
No explanation. One word only.
"""