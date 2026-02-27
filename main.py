"""
Unitinder — Matching API.
POST /api/match with body { studentPersona, subject? } returns ranked teachers
with compatibility score and best/worst dimension "why".
GET /api/students returns all students; POST /api/students appends one to students.json.
"""

import json
import os
import random
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from matching import load_teachers, rank_teachers

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


@app.post("/api/match", response_model=MatchResponse)
def match(request: MatchRequest) -> MatchResponse:
    """
    Rank teachers by compatibility with the given student persona.
    Optionally filter by subject.
    """
    try:
        teachers = get_teachers()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    ranked = rank_teachers(teachers, request.studentPersona, subject=request.subject)
    return MatchResponse(ranked=ranked)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
