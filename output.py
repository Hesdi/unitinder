from openai import OpenAI

data = {
  "teacher_id": "tch_kovacs",
  "name": "Ms. Kovács",
  "subject": "Biology",
  "archetype": "The Socratic Guide",
  "persona": {
    "pace": 0.40,
    "structure": 0.60,
    "abstraction": 0.35,
    "interactivity": 0.85,
    "visual_dependency": 0.50,
    "verbal_density": 0.45,
    "repetition_need": 0.70,
    "formality": 0.25,
    "humor_receptivity": 0.75,
    "feedback_style": 0.50,
    "autonomy": 0.65,
    "cognitive_load_tolerance": 0.50,
    "attention_span": 0.45,
    "motivation_type": 0.80,
    "error_tolerance": 0.75,
    "social_preference": 0.70,
    "real_world_need": 0.70,
    "emotional_sensitivity": 0.65,
    "question_comfort": 0.90,
    "note_taking_style": 0.60,
    "challenge_preference": 0.65,
    "context_need": 0.80,
    "storytelling_affinity": 0.75,
    "revision_style": 0.60
  }
}

endpoint = "https://hesdi-mm4zauz8-eastus2.cognitiveservices.azure.com/openai/v1/"
model_name = "gpt-5.2-chat"
deployment_name = "gpt-5.2-chat"

api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(
    base_url=f"{endpoint}",
    api_key=api_key
)

completion = client.chat.completions.create(
    model=deployment_name,
    messages=[
        {
            "role": "user",
            "content": """Based on the given teacher's personality, generate prompts for 3 modalities: audio, video, and text.
            
            Text format:
            Study plan: Given (student, teacher, subject, user prompt), generate a text plan “in that teacher’s style” (template + teacher persona fields). You can use a simple template or call an LLM API.  
            
            Video/audio: Only generate the prompt text (e.g. for a future TTS/video model) and show it in the UI; no actual audio/video generation.
            
            Teacher Data: {data}""",
        }
    ],
)

print(completion.choices[0].message)