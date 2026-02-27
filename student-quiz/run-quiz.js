#!/usr/bin/env node
/**
 * Unitinder — Student quiz CLI.
 * Asks 20 questions, aggregates dimension scores, outputs student persona JSON.
 * Run: node run-quiz.js
 */

const readline = require('readline');
const { DIMENSION_KEYS, QUESTIONS } = require('./questions.js');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// For piped/file stdin, question() often only works once; use a line queue.
const lineQueue = [];
if (!process.stdin.isTTY) {
  rl.on('line', (line) => lineQueue.push(line));
  rl.on('close', () => lineQueue.push(null)); // EOF
}

function ask(question) {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      rl.question(question, resolve);
      return;
    }
    process.stdout.write(question);
    const take = () => {
      if (lineQueue.length > 0) {
        const line = lineQueue.shift();
        resolve(line === null ? '' : line);
      } else {
        setImmediate(take);
      }
    };
    take();
  });
}

function parseChoice(input) {
  const trimmed = (input || '').trim().toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(trimmed)) return trimmed;
  return null;
}

/**
 * Aggregate: for each dimension, average all values from answers.
 * Dimensions never touched get 0.5 (neutral).
 */
function aggregatePersona(accumulator) {
  const persona = {};
  for (const key of DIMENSION_KEYS) {
    const values = accumulator[key];
    if (!values || values.length === 0) {
      persona[key] = 0.5;
    } else {
      const sum = values.reduce((a, b) => a + b, 0);
      persona[key] = Math.round((sum / values.length) * 100) / 100;
    }
  }
  return persona;
}

/**
 * Simple archetype/summary from persona (stub — can be replaced by LLM later).
 */
function deriveArchetypeAndSummary(persona) {
  const entries = Object.entries(persona).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 3).map(([k]) => k);
  const low = entries.slice(-2).map(([k]) => k);
  const archetype = 'Learner profile'; // placeholder; could map top dims to names
  const summary = `Strong on: ${top.join(', ')}. Lower on: ${low.join(', ')}. Profile generated from 20-question quiz — use for teacher matching.`;
  return { archetype, summary };
}

function generateStudentId() {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  return 'stu_' + Array.from({ length: 8 }, hex).join('');
}

async function runQuiz() {
  console.log('\n  Unitinder — Student Learning Profile Quiz\n  ~20 questions, 3–4 minutes. Answer with A, B, C, or D.\n');

  const name = await ask('Your name (or press Enter for "Student"): ');
  const studentName = (name || 'Student').trim() || 'Student';

  const accumulator = {};
  DIMENSION_KEYS.forEach((k) => { accumulator[k] = []; });

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    console.log(`\n  [${q.id}/20] ${q.text}\n`);
    q.options.forEach((opt) => {
      console.log(`    ${opt.label}) ${opt.text}`);
    });

    let choice = null;
    while (choice === null) {
      const input = await ask('\n  Your answer (A/B/C/D): ');
      choice = parseChoice(input);
      if (choice === null) console.log('  Please enter A, B, C, or D.');
    }

    const selected = q.options.find((o) => o.label === choice);
    if (selected && selected.dimensions) {
      for (const [dim, value] of Object.entries(selected.dimensions)) {
        if (accumulator[dim]) accumulator[dim].push(value);
      }
    }
  }

  if (Object.values(accumulator).every((arr) => arr.length === 0)) {
    console.error('\n  No answers recorded (invalid input?). Exiting.');
    rl.close();
    process.exit(1);
  }

  const persona = aggregatePersona(accumulator);
  const { archetype, summary } = deriveArchetypeAndSummary(persona);

  const output = {
    student_id: generateStudentId(),
    name: studentName,
    generated_at: new Date().toISOString(),
    persona,
    archetype,
    summary,
  };

  console.log('\n  Done! Your student persona (use this for matching):\n');
  const json = JSON.stringify(output, null, 2);
  console.log(json);

  const writeToFile = process.argv.includes('--out') || process.argv.includes('-o');
  if (writeToFile) {
    const fs = require('fs');
    const path = require('path');
    const outPath = process.argv[process.argv.indexOf('--out') + 1] || process.argv[process.argv.indexOf('-o') + 1]
      || path.join(__dirname, 'student-persona.json');
    fs.writeFileSync(outPath, json, 'utf8');
    console.log('\n  Written to:', outPath);
  }

  const appendToStudents = process.argv.includes('--save') || process.argv.includes('--append');
  if (appendToStudents) {
    const fs = require('fs');
    const path = require('path');
    const studentsPath = path.join(__dirname, '..', 'students.json');
    let data = { _schema_notes: '', students: [] };
    if (fs.existsSync(studentsPath)) {
      data = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
    }
    if (!Array.isArray(data.students)) data.students = [];
    data.students.push(output);
    fs.writeFileSync(studentsPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('\n  Appended to:', studentsPath);
  }

  rl.close();
}

runQuiz().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
