"""
Unitinder — weighted 24-dimension matching of student persona to teachers.
Load teachers from teachers.json, optional subject filter, output ranked list
with compatibility score and best-3 / worst-2 dimension "why".
"""

import json
from pathlib import Path
from typing import Any

# All 24 dimensions (must match teachers.json and student quiz output)
DIMENSION_KEYS = [
    "pace",
    "structure",
    "abstraction",
    "interactivity",
    "visual_dependency",
    "verbal_density",
    "repetition_need",
    "formality",
    "humor_receptivity",
    "feedback_style",
    "autonomy",
    "cognitive_load_tolerance",
    "attention_span",
    "motivation_type",
    "error_tolerance",
    "social_preference",
    "real_world_need",
    "emotional_sensitivity",
    "question_comfort",
    "note_taking_style",
    "challenge_preference",
    "context_need",
    "storytelling_affinity",
    "revision_style",
]

# Weights: 3x (critical), 2x (important), 1x (nice to have)
WEIGHT_3X = {"pace", "cognitive_load_tolerance", "verbal_density", "structure"}
WEIGHT_2X = {
    "interactivity",
    "abstraction",
    "feedback_style",
    "autonomy",
    "real_world_need",
    "attention_span",
}


def _get_weights() -> dict[str, float]:
    w = {}
    for d in DIMENSION_KEYS:
        if d in WEIGHT_3X:
            w[d] = 3.0
        elif d in WEIGHT_2X:
            w[d] = 2.0
        else:
            w[d] = 1.0
    return w


WEIGHTS = _get_weights()


def weighted_distance(student_persona: dict[str, float], teacher_persona: dict[str, float]) -> float:
    """Weighted Manhattan distance over 24 dimensions."""
    total = 0.0
    for dim in DIMENSION_KEYS:
        s = student_persona.get(dim, 0.5)
        t = teacher_persona.get(dim, 0.5)
        total += WEIGHTS[dim] * abs(s - t)
    return total


def compatibility_score(distance: float) -> float:
    """Convert distance to 0–100 score (higher = better match)."""
    if distance < 0:
        return 100.0
    return round(100.0 / (1.0 + distance), 2)


def dimension_contributions(
    student_persona: dict[str, float], teacher_persona: dict[str, float]
) -> list[tuple[str, float]]:
    """Per-dimension weighted contribution to distance. Returns list of (dimension, contribution) sorted by contribution ascending (best first)."""
    contributions = []
    for dim in DIMENSION_KEYS:
        s = student_persona.get(dim, 0.5)
        t = teacher_persona.get(dim, 0.5)
        contrib = WEIGHTS[dim] * abs(s - t)
        contributions.append((dim, contrib))
    contributions.sort(key=lambda x: x[1])
    return contributions


def why_best_worst(contributions: list[tuple[str, float]]) -> dict[str, list[str]]:
    """Top 3 best-matching (smallest contribution), bottom 2 worst-matching (largest contribution)."""
    best = [dim for dim, _ in contributions[:3]]
    worst = [dim for dim, _ in contributions[-2:][::-1]]  # last 2, then reverse so worst first
    return {"best": best, "worst": worst}


def load_teachers(path: str | Path) -> list[dict[str, Any]]:
    """Load teachers array from teachers.json (or file with same shape)."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data.get("teachers", data) if isinstance(data, dict) else data


def rank_teachers(
    teachers: list[dict[str, Any]],
    student_persona: dict[str, float],
    subject: str | None = None,
) -> list[dict[str, Any]]:
    """
    Filter by subject (if given), compute weighted distance and score for each teacher,
    add best/worst dimension "why", and return list sorted by compatibility (best first).
    """
    if subject is not None:
        subject_clean = subject.strip()
        teachers = [t for t in teachers if (t.get("subject") or "").strip() == subject_clean]

    results = []
    for t in teachers:
        persona = t.get("persona") or {}
        dist = weighted_distance(student_persona, persona)
        score = compatibility_score(dist)
        contributions = dimension_contributions(student_persona, persona)
        why = why_best_worst(contributions)

        results.append(
            {
                "teacher_id": t.get("teacher_id"),
                "name": t.get("name"),
                "subject": t.get("subject"),
                "archetype": t.get("archetype"),
                "tagline": t.get("tagline"),
                "summary": t.get("summary"),
                "compatibility_score": score,
                "why": why,
            }
        )

    results.sort(key=lambda r: r["compatibility_score"], reverse=True)
    return results
