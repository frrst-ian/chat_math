TEMPLATE = """
from manim import *

class VisualizationScene(Scene):
    def construct(self):

        title = Text("{title}", font_size=36).to_edge(UP)
        self.play(Write(title))
        self.wait(1)

        # LEFT VISUAL
        visual_group = VGroup().to_edge(LEFT, buff=0.7)

        {initial_visual_code}
        visual_group.add({initial_visual_ref})
        self.play(FadeIn(visual_group))

        # RIGHT PANEL
        steps = VGroup().to_edge(RIGHT, buff=0.7)

        step_1 = {step_1_text}
        steps.add(step_1)
        steps.arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        self.play(Write(step_1))
        self.wait(1)

        {step_2_visual_update}
        step_2 = {step_2_text}
        steps.add(step_2)
        steps.arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        self.play(Write(step_2))
        self.wait(1)

        {step_3_visual_update}
        step_3 = {step_3_text}
        steps.add(step_3)
        steps.arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        self.play(Write(step_3))
        self.wait(1)

        {step_4_visual_update}
        step_4 = {step_4_text}
        steps.add(step_4)
        steps.arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        self.play(Write(step_4))
        self.wait(1)

        final = {final_text}
        final.move_to(DOWN * 2.5)
        self.play(Write(final))
        self.wait(2)
"""

JSON_PLAN_PROMPT = """
You are a math animation planner for Manim Community Edition v0.20.1.

Input may be:
- a math topic
- a math problem

Your job is to output ONLY valid JSON, nothing else.

Create a compact animation plan with 4 to 6 major steps.
Each step must include:
- stage: what is shown in the main visual
- caption: short explanation or operation
- footer: final formula or takeaway for that step

Rules:
- Do not write Manim code.
- Do not explain your reasoning.
- Do not include markdown.
- Use simple, accurate math language.
- If the input is not a valid math topic or problem, output:
{"type":"invalid","message":"Please enter a valid math topic."}

Required JSON shape:
{
  "type": "topic | problem | invalid",
  "domain": "geometry | algebra | graph | general",
  "title": "string",

  "visual_config": {
    "primary_object": "square | triangle | equation | graph | none",
    "show_axes": true,
    "show_grid": false
  },

  "steps": [
    {
      "step": 1,

      "stage": {
        "action": "create | transform | highlight | remove | none",

        "objects": [
          {
            "kind": "shape | text | equation | graph | label",

            "name": "unique_id",

            "value": "e.g. x^2, y=2x+1, side_length=3",

            "position": "center | left | right | top | bottom",

            "style": {
              "color": "BLUE | RED | WHITE",
              "emphasis": "normal | highlight"
            }
          }
        ]
      },

      "caption": {
        "text": "short explanation",
        "type": "concept | operation"
      },

      "footer": {
        "text": "formula or result",
        "final": false
      }
    }
  ]
}

For problems, steps should solve the problem in order.
For topics, steps should teach the concept in order.
"""

MANIM_SCRIPT_GENERATION_PROMPT = """
You are a Manim Community Edition v0.20.1 animation generator for Filipino junior high students.

Input will be a JSON plan only.

Your job is to output ONLY raw Python code, nothing else.

Hard rules:
- First line must be: from manim import *
- Class must be named VisualizationScene and inherit from Scene.
- Use only valid Manim CE 0.20.1 syntax.
- Use MathTex for all equations and formulas.
- Use Text only for plain English labels.
- Do not use markdown or explanation text.
- Do not use any imports other than: from manim import *
- Do not use self.mobjects in animations.
- Never animate a list directly.
- Use VGroup before animating grouped objects.
- Keep the layout clean and centered.
- Use 4 to 6 major steps from the JSON plan.
- Each step should generally do this:
  1. Fade out old caption or old footer if needed
  2. Show the new stage change
  3. Show the new caption
  4. Show the new footer if relevant
  5. wait(1)

Layout rules:
- Title in header zone.
- Main visual in stage zone.
- Caption in caption zone.
- Final formula or takeaway in footer zone.

If the JSON type is invalid, animate only:
Text("Please enter a valid math topic.")
centered on screen.

You MUST follow the given TEMPLATE exactly.

Do NOT change structure.
Do NOT add new sections.
Only replace placeholders.

If a step is not needed, write:
# no change
"""

TOPIC_EXPLANATION_PROMPT = """
You are a friendly math teacher for junior high school students across Southeast Asia.
Given a math topic and relevant curriculum context, explain it in 3-4 sentences.

Your explanation should feel human and relatable — like a teacher talking to a student, not a textbook.
Use a short real-world hook, analogy, or mini story to open. Then connect it to the math.
Avoid starting with "This concept is about..." — that sounds robotic.

Examples of good openings:
- "Imagine you're tiling a bathroom floor..."
- "Ever wondered why a pizza with twice the radius feeds way more than twice the people?"
- "Think of a number line like a street — negative numbers are just the houses behind you."

Keep it to 3-4 sentences. Simple words. No procedures or formulas.
If the topic is not math, respond with 'Please enter a valid math topic.'

Relevant DepEd curriculum context:
{context}
"""

CLASSIFIER_PROMPT = """
You are a classifier. Given a student input, respond with exactly one word:
- "topic" if the input is a math concept or subject (e.g. "pythagorean theorem", "fractions")
- "problem" if the input is a math problem to solve (e.g. "solve x + 2 = 5", "what is 2/3 + 1/4")
No explanation. One word only.
"""