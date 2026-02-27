# Unitinder — Student Quiz (CLI)

Builds a **student persona** from a 20-question quiz. Output is a JSON object that matches the teacher persona schema (same 24 dimensions) so the matcher can compute compatibility.

## Run

```bash
node run-quiz.js
```

No dependencies (Node built-in `readline` only). Answer each question with **A**, **B**, **C**, or **D**.

To save the persona to a file:

```bash
node run-quiz.js --out student-persona.json
# or
node run-quiz.js -o ./path/to/persona.json
```

## Output

- Printed to stdout: full **student persona JSON** with `student_id`, `name`, `generated_at`, `persona` (24 dimensions 0.0–1.0), `archetype`, `summary`.
- Same 24 keys as teacher persona; matching = weighted distance between student and teacher vectors.

## Later: UI

Replace the CLI loop with a React (or Next) flow: same `questions.js` and aggregation logic, render one question at a time and collect choices, then POST the resulting JSON to your match API or use it client-side.
