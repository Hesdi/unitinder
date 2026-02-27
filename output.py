import os
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
            "role": "system",
            "content": "You are an expert Prompt Engineer for an AI education platform."
        },
        {
            "role": "user",
            "content": f"""Based on the following Teacher Persona, your task is to generate 3 specific system prompts tailored to three different instructional modalities: Text, Audio, and Video.

We are building a system where a student requests a study plan or lesson, and we use these prompts to generate the content in the teacher's exact style.

1. Text Modality Prompt:
Create a system prompt that will instruct an LLM to generate a personalized "Study Plan" or written lesson. It should enforce the teacher's specific pacing, structure, verbosity, and textual pedagogical style (e.g., Socratic questioning, formal vs. casual).

2. Audio Modality Prompt:
Create a system prompt that will instruct an LLM to write a script for a TTS (Text-to-Speech) engine. It should emphasize auditory elements: speech patterns, tone of voice, enthusiasm, pauses, and rhetorical questions, ensuring the script sounds natural and fits the teacher's emotional sensitivity and humor receptivity.

3. Video Modality Prompt:
Create a system prompt that will instruct an LLM to generate a script and visual cues for a Video/Avatar model. It must include instructions for the teacher's body language, facial expressions, visual dependency (e.g., describing props or whiteboard use), and overall on-screen energy.

INPUT DATA (Teacher Persona):
{data}

Please format your response clearly, providing the complete prompt text for each of the 3 modalities."""
        }
    ],
)

print(completion.choices[0].message.content)