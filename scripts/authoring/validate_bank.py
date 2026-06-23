#!/usr/bin/env python3
"""Phase 2 — Validate the question bank + sign/manual data. Exits non-zero on any
violation so it can gate the build. A parallel Vitest test enforces the same
invariants at test time.
"""
from __future__ import annotations

import json
import pathlib
import sys
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = ROOT / "public" / "data"
PUBLIC = ROOT / "public"

MIN_PER_TOPIC = 5
EXAM_MIN_SIGN = 10
EXAM_MIN_GENERAL = 25


def main() -> int:
    errors: list[str] = []

    signs = json.loads((DATA / "signs.v1.json").read_text())
    manual = json.loads((DATA / "manual.v1.json").read_text())
    bank = json.loads((DATA / "questions.v1.json").read_text())
    questions = bank["questions"]

    sign_ids = {s["signId"] for s in signs}
    section_slugs = {s["slug"] for s in manual["sections"]}

    # signs: images exist, ids unique
    if len(sign_ids) != len(signs):
        errors.append("Duplicate signId in signs.v1.json")
    for s in signs:
        if not (PUBLIC / s["image"]).exists():
            errors.append(f"Sign {s['signId']} image missing: {s['image']}")
        if not s["meaning"].strip():
            errors.append(f"Sign {s['signId']} has empty meaning")

    # questions
    ids = [q["id"] for q in questions]
    dupes = [i for i, n in Counter(ids).items() if n > 1]
    if dupes:
        errors.append(f"Duplicate question ids: {dupes}")

    for q in questions:
        ch = q["choices"]
        if len(ch) != 4:
            errors.append(f"{q['id']}: expected 4 choices, got {len(ch)}")
        if len(set(ch)) != len(ch):
            errors.append(f"{q['id']}: duplicate choices")
        if any(not c.strip() for c in ch):
            errors.append(f"{q['id']}: empty choice")
        if not (0 <= q["answerIndex"] < len(ch)):
            errors.append(f"{q['id']}: answerIndex {q['answerIndex']} out of range")
        if not q.get("explanation", "").strip():
            errors.append(f"{q['id']}: missing explanation")
        ref = q.get("manualRef", {}).get("sectionSlug")
        if ref not in section_slugs:
            errors.append(f"{q['id']}: manualRef '{ref}' not a real section")
        if q["type"] == "sign":
            if q.get("signId") not in sign_ids:
                errors.append(f"{q['id']}: signId '{q.get('signId')}' unknown")
            img = q.get("image", "")
            if not (PUBLIC / img).exists():
                errors.append(f"{q['id']}: image missing: {img}")

    # topic coverage
    topics = Counter(q["topic"] for q in questions)
    for t, n in topics.items():
        if n < MIN_PER_TOPIC:
            errors.append(f"Topic '{t}' has only {n} questions (min {MIN_PER_TOPIC})")

    # exam feasibility
    n_sign = sum(1 for q in questions if q["type"] == "sign")
    n_general = sum(1 for q in questions if q["type"] == "general")
    if n_sign < EXAM_MIN_SIGN:
        errors.append(f"Only {n_sign} sign questions (exam needs {EXAM_MIN_SIGN})")
    if n_general < EXAM_MIN_GENERAL:
        errors.append(f"Only {n_general} general questions (exam needs {EXAM_MIN_GENERAL})")

    if errors:
        print(f"VALIDATION FAILED ({len(errors)} issue(s)):")
        for e in errors:
            print("  -", e)
        return 1

    print(f"Validation OK: {len(questions)} questions, {len(signs)} signs, "
          f"{len(section_slugs)} sections, {len(topics)} topics.")
    print(f"  sign={n_sign} general={n_general}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
