"""
Unitinder — Matching API.
POST /api/match with body { studentPersona, subject? } returns ranked teachers
with compatibility score and best/worst dimension "why".
"""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

# Load teachers once at startup; path relative to this file
TEACHERS_PATH = Path(__file__).resolve().parent / "teachers.json"
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
    subject: str | None = Field(None, description="Optional subject filter (e.g. 'Biology')")


class MatchResponse(BaseModel):
    ranked: list[dict]


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
