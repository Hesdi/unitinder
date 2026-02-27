"""
Unitinder — Matching API.
POST /api/match with body { studentPersona, subject? } returns ranked teachers
with compatibility score and best/worst dimension "why".
GET /api/students returns all students; POST /api/students appends one to students.json.
"""

import json
import os
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the directory containing main.py so API key is found when run from any CWD
_BASE_DIR = Path(__file__).resolve().parent
load_dotenv(_BASE_DIR / ".env", override=True)

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI
from pydantic import BaseModel, Field

from matching import load_teachers, rank_teachers

# #region agent log
DEBUG_LOG_PATH = "/home/tiya.kumar/Desktop/hackathon/gde-mit/.cursor/debug-e36989.log"
def _debug_log(message: str, data: dict | None = None, hypothesis_id: str | None = None) -> None:
    import time
    payload = {"sessionId": "e36989", "timestamp": int(time.time() * 1000), "location": "main.py", "message": message, "runId": "debug"}
    if data is not None:
        payload["data"] = data
    if hypothesis_id is not None:
        payload["hypothesisId"] = hypothesis_id
    try:
        with open(DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except Exception:
        pass
# #endregion

# Same Azure OpenAI setup as output.py (env can override)
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://hesdi-mm4zauz8-eastus2.cognitiveservices.azure.com/openai/v1/")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.2-chat")

app = FastAPI(title="Unitinder Match API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths: allow override via env so API works when run from any CWD (e.g. monorepo root)
BASE_DIR = Path(__file__).resolve().parent
TEACHERS_PATH = Path(os.environ["UNITINDER_TEACHERS_PATH"]) if os.environ.get("UNITINDER_TEACHERS_PATH") else BASE_DIR / "teachers.json"
STUDENTS_PATH = Path(os.environ["UNITINDER_STUDENTS_PATH"]) if os.environ.get("UNITINDER_STUDENTS_PATH") else BASE_DIR / "students.json"
_teachers_cache: list | None = None


def _generate_personalized_summary(teacher: dict) -> str:
    """
    For one ranked teacher, return an AI-generated 2–3 sentence summary for this student,
    using best/worst dimension alignment. Falls back to the JSON summary if API key is
    missing, AI is disabled, or the request fails.
    """
    fallback = teacher.get("summary") or "No summary available."
    api_key = os.environ.get("OPENAI_API_KEY")
    disable_flag = os.environ.get("UNITINDER_DISABLE_AI_SUMMARY", "").strip()
    if not api_key or disable_flag == "1":
        return fallback

    name = teacher.get("name", "This teacher")
    subject = teacher.get("subject", "")
    tagline = teacher.get("tagline", "")
    archetype = teacher.get("archetype", "")
    why = teacher.get("why") or {}
    best = why.get("best") or []
    worst = why.get("worst") or []

    prompt = f"""You are helping a student choose a teacher. Given this teacher and how they match this student, write a short 2–3 sentence summary in plain language (no bullet lists) explaining why this teacher might be a great fit or not for this specific student.

Teacher: {name} ({subject})
Archetype: {archetype}
Tagline: {tagline}

Where this student and teacher align well (best matching aspects): {', '.join(best) if best else '—'}
Where they differ (aspects that may not match): {', '.join(worst) if worst else '—'}

Write only the summary, nothing else. Be direct and helpful."""

    try:
        client = OpenAI(base_url=OPENAI_BASE_URL, api_key=api_key)
        completion = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You write brief, clear summaries for students choosing teachers. Output only the summary text, no labels or extra text."},
                {"role": "user", "content": prompt},
            ],
            max_completion_tokens=200,
        )
        text = (completion.choices[0].message.content or "").strip()
        return text if text else fallback
    except Exception:
        return fallback


def _generate_modality_prompts(teacher: dict) -> dict[str, str]:
    """Generate text_prompt, audio_prompt, video_prompt for this teacher (mirror output.py)."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"text_prompt": "", "audio_prompt": "", "video_prompt": ""}
    teacher_data = {
        "teacher_id": teacher.get("teacher_id"),
        "name": teacher.get("name"),
        "subject": teacher.get("subject"),
        "archetype": teacher.get("archetype"),
        "persona": teacher.get("persona") or {},
    }
    prompt_content = f"""Based on the following Teacher Persona, your task is to generate 3 specific system prompts tailored to three different instructional modalities: Text, Audio, and Video.

We are building a system where a student requests a study plan or lesson, and we use these prompts to generate the content in the teacher's exact style.

1. Text Modality Prompt:
Create a system prompt that will instruct an LLM to generate a personalized "Study Plan" or written lesson. It should enforce the teacher's specific pacing, structure, verbosity, and textual pedagogical style (e.g., Socratic questioning, formal vs. casual).

2. Audio Modality Prompt:
Create a system prompt that will instruct an LLM to write a script for a TTS (Text-to-Speech) engine. It should emphasize auditory elements: speech patterns, tone of voice, enthusiasm, pauses, and rhetorical questions, ensuring the script sounds natural and fits the teacher's emotional sensitivity and humor receptivity.

3. Video Modality Prompt:
Create a system prompt that will instruct an LLM to generate a script and visual cues for a Video/Avatar model. It must include instructions for the teacher's body language, facial expressions, visual dependency (e.g., describing props or whiteboard use), and overall on-screen energy.

INPUT DATA (Teacher Persona):
{json.dumps(teacher_data, indent=2)}

OUTPUT FORMAT:
Return exactly a JSON object with the following keys:
"text_prompt": <the complete prompt for text modality>,
"audio_prompt": <the complete prompt for audio modality>,
"video_prompt": <the complete prompt for video modality>"""
    try:
        client = OpenAI(base_url=OPENAI_BASE_URL, api_key=api_key)
        completion = client.chat.completions.create(
            model=OPENAI_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are an expert Prompt Engineer for an AI education platform. Output your response as a valid JSON object."},
                {"role": "user", "content": prompt_content},
            ],
            max_completion_tokens=1500,
        )
        raw = completion.choices[0].message.content or "{}"
        out = json.loads(raw)
        return {
            "text_prompt": out.get("text_prompt", ""),
            "audio_prompt": out.get("audio_prompt", ""),
            "video_prompt": out.get("video_prompt", ""),
        }
    except Exception:
        return {"text_prompt": "", "audio_prompt": "", "video_prompt": ""}


def _generate_study_plan(teacher: dict, student_persona: dict, topic: str, text_prompt: str) -> str:
    """Generate study plan for the student's topic in the teacher's style. Uses text_prompt if available, else a fallback so we still generate when modality prompts fail."""
    api_key = os.environ.get("OPENAI_API_KEY")
    # #region agent log
    _debug_log("_generate_study_plan_entry", {"has_api_key": bool(api_key), "topic_len": len(topic or ""), "text_prompt_len": len(text_prompt or "")}, "H2")
    # #endregion
    if not api_key:
        return ""
    # If modality prompts failed or were skipped, use a fallback system prompt so we still generate a plan for the topic
    teacher_name = teacher.get("name", "This teacher")
    teacher_subject = teacher.get("subject", "")
    fallback_system = f"""You are {teacher_name}, teaching {teacher_subject}. Your task is to generate a study plan in YOUR teaching style only. The plan must be for the topic the student requests. Use your own pacing, structure, tone, and pedagogical approach—do not match or adapt to the student's learning style; the output must reflect how you teach. Output only the study plan text, no meta-commentary."""
    system_content = (text_prompt.strip() or fallback_system)
    # Explicit: plan for this topic, in the teacher's teaching style (not the student's learning style)
    user_content = f"""The student has requested a study plan for this topic. Generate the plan only for this topic, in YOUR teaching style. The plan must reflect how you teach—your pace, structure, tone, and methods—not the student's preferred learning style. Student context is provided only for reference.

Topic requested: {topic}

Student context (for reference only; do not match your style to theirs):
{json.dumps(student_persona, indent=2)}

Generate the study plan now. Ensure it is specifically about "{topic}" and is written in the teacher's teaching style."""
    try:
        client = OpenAI(base_url=OPENAI_BASE_URL, api_key=api_key)
        completion = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content},
            ],
            max_completion_tokens=1500,
        )
        return (completion.choices[0].message.content or "").strip()
    except Exception as e:
        # #region agent log
        _debug_log("_generate_study_plan_exception", {"error_type": type(e).__name__, "error_msg": str(e)[:200]}, "H4")
        # #endregion
        return ""


def get_teachers() -> list:
    global _teachers_cache
    if _teachers_cache is None:
        if not TEACHERS_PATH.exists():
            raise FileNotFoundError(f"Teachers file not found: {TEACHERS_PATH}")
        _teachers_cache = load_teachers(TEACHERS_PATH)
    return _teachers_cache


class MatchRequest(BaseModel):
    studentPersona: dict[str, float] = Field(..., description="Student persona with 24 dimensions (0–1)")
    subject: str | None = Field(None, description="Optional subject filter (e.g. 'Analysis')")


class MatchResponse(BaseModel):
    ranked: list[dict]


class CreateStudentRequest(BaseModel):
    name: str = Field("Student", description="Student display name")
    persona: dict[str, float] = Field(..., description="24 dimensions (0–1)")
    archetype: str | None = Field(None, description="Optional archetype label")
    summary: str | None = Field(None, description="Optional summary")


class LearnPromptsRequest(BaseModel):
    teacherId: str = Field(..., description="Teacher ID from teachers.json")


class LearnStudyPlanRequest(BaseModel):
    teacherId: str = Field(..., description="Teacher ID")
    studentPersona: dict[str, float] = Field(..., description="24 dimensions (0–1)")
    topic: str = Field(..., description="Topic for the study plan")


def _load_students_data() -> dict:
    """Load students.json; return { students: [] } if missing or on read error."""
    if not STUDENTS_PATH.exists():
        return {"_schema_notes": "", "students": []}
    try:
        with open(STUDENTS_PATH, encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {"students": data}
    except (OSError, json.JSONDecodeError):
        return {"_schema_notes": "", "students": []}


def _save_students_data(data: dict) -> None:
    """Write students.json preserving structure. Creates parent dirs if needed."""
    STUDENTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(STUDENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


@app.get("/api/students")
def get_students() -> dict:
    """Return all students from students.json."""
    data = _load_students_data()
    return {"students": data.get("students", [])}


@app.post("/api/students")
def create_student(request: CreateStudentRequest) -> JSONResponse:
    """Append a new student to students.json; return created student (201)."""
    student_id = "stu_" + "".join(random.choices("0123456789abcdef", k=8))
    from datetime import datetime
    generated_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")
    student = {
        "student_id": student_id,
        "name": (request.name or "Student").strip() or "Student",
        "generated_at": generated_at,
        "persona": request.persona,
        "archetype": request.archetype or "Learner profile",
        "summary": request.summary or "Profile from quiz — use for teacher matching.",
    }
    data = _load_students_data()
    if "students" not in data:
        data["students"] = []
    data["students"].append(student)
    _save_students_data(data)
    return JSONResponse(content=student, status_code=status.HTTP_201_CREATED)


@app.get("/api/teachers/{teacher_id}")
def get_teacher(teacher_id: str) -> dict:
    """Return a single teacher by teacher_id. 404 if not found."""
    teachers = get_teachers()
    for t in teachers:
        if (t.get("teacher_id") or "").strip() == teacher_id.strip():
            return t
    raise HTTPException(status_code=404, detail="Teacher not found")


@app.post("/api/learn/prompts")
def learn_prompts(request: LearnPromptsRequest) -> dict:
    """Generate text, audio, and video modality prompts for the given teacher."""
    teachers = get_teachers()
    teacher = next((t for t in teachers if (t.get("teacher_id") or "").strip() == request.teacherId.strip()), None)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return _generate_modality_prompts(teacher)


@app.post("/api/learn/study-plan")
def learn_study_plan(request: LearnStudyPlanRequest) -> dict:
    """Generate a study plan for the topic in this teacher's style, tailored to the student persona."""
    # #region agent log
    _debug_log("study_plan_request", {"teacherId": request.teacherId, "topic_len": len(request.topic or ""), "topic_preview": (request.topic or "")[:40], "persona_keys": len(request.studentPersona or {})}, "H1")
    # #endregion
    teachers = get_teachers()
    teacher = next((t for t in teachers if (t.get("teacher_id") or "").strip() == request.teacherId.strip()), None)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    prompts = _generate_modality_prompts(teacher)
    text_prompt = prompts.get("text_prompt", "")
    # #region agent log
    _debug_log("after_prompts", {"text_prompt_len": len(text_prompt)}, "H4")
    # #endregion
    plan = _generate_study_plan(teacher, request.studentPersona, request.topic, text_prompt)
    # #region agent log
    _debug_log("study_plan_result", {"plan_len": len(plan)}, "H5")
    # #endregion
    return {"study_plan": plan, "text_prompt": text_prompt}


@app.post("/api/match", response_model=MatchResponse)
def match(request: MatchRequest) -> MatchResponse:
    """
    Rank teachers by compatibility with the given student persona.
    Optionally filter by subject. Each teacher's summary is replaced with an
    AI-generated, student-specific summary when OPENAI_API_KEY is set.
    """
    try:
        teachers = get_teachers()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    ranked = rank_teachers(teachers, request.studentPersona, subject=request.subject)

    # Generate personalized summaries in parallel (or use JSON summary if AI disabled)
    with ThreadPoolExecutor(max_workers=min(10, max(1, len(ranked)))) as executor:
        futures = {executor.submit(_generate_personalized_summary, t): i for i, t in enumerate(ranked)}
        for future in as_completed(futures):
            idx = futures[future]
            try:
                ranked[idx]["summary"] = future.result()
            except Exception:
                pass  # keep original summary on error

    return MatchResponse(ranked=ranked)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
