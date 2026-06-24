#!/usr/bin/env python3
"""Phase 2 — Validate the question bank + sign/manual data for every state listed
in `public/data/states.index.json`. Exits non-zero on any violation so it can
gate the build. A parallel Vitest test enforces the same invariants at test time.

The signs bank is shared (federal MUTCD) unless a state overrides it in its
config's `data.signs`.
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


def validate_state(summary: dict) -> list[str]:
    """Validate one state's data, using its config for file paths + exam rules."""
    sid = summary["id"]
    errors: list[str] = []

    config = json.loads((DATA / summary["config"]).read_text())
    paths = config["data"]
    exam = config["exam"]

    signs = json.loads((DATA / paths["signs"]).read_text())
    manual = json.loads((DATA / paths["manual"]).read_text())
    bank = json.loads((DATA / paths["questions"]).read_text())
    questions = bank["questions"]

    sign_ids = {s["signId"] for s in signs}
    section_slugs = {s["slug"] for s in manual["sections"]}

    def err(msg: str) -> None:
        errors.append(f"[{sid}] {msg}")

    # signs: images exist, ids unique
    if len(sign_ids) != len(signs):
        err("Duplicate signId in signs bank")
    for s in signs:
        if not (PUBLIC / s["image"]).exists():
            err(f"Sign {s['signId']} image missing: {s['image']}")
        if not s["meaning"].strip():
            err(f"Sign {s['signId']} has empty meaning")

    # questions
    ids = [q["id"] for q in questions]
    dupes = [i for i, n in Counter(ids).items() if n > 1]
    if dupes:
        err(f"Duplicate question ids: {dupes}")

    for q in questions:
        ch = q["choices"]
        if len(ch) != 4:
            err(f"{q['id']}: expected 4 choices, got {len(ch)}")
        if len(set(ch)) != len(ch):
            err(f"{q['id']}: duplicate choices")
        if any(not c.strip() for c in ch):
            err(f"{q['id']}: empty choice")
        if not (0 <= q["answerIndex"] < len(ch)):
            err(f"{q['id']}: answerIndex {q['answerIndex']} out of range")
        if not q.get("explanation", "").strip():
            err(f"{q['id']}: missing explanation")
        ref = q.get("manualRef", {}).get("sectionSlug")
        if ref not in section_slugs:
            err(f"{q['id']}: manualRef '{ref}' not a real section")
        if q["type"] == "sign":
            if q.get("signId") not in sign_ids:
                err(f"{q['id']}: signId '{q.get('signId')}' unknown")
            img = q.get("image", "")
            if not (PUBLIC / img).exists():
                err(f"{q['id']}: image missing: {img}")

    # topic coverage
    topics = Counter(q["topic"] for q in questions)
    for t, n in topics.items():
        if n < MIN_PER_TOPIC:
            err(f"Topic '{t}' has only {n} questions (min {MIN_PER_TOPIC})")

    # exam feasibility — thresholds come from the state's own config
    n_sign = sum(1 for q in questions if q["type"] == "sign")
    n_general = sum(1 for q in questions if q["type"] == "general")
    if n_sign < exam["signCount"]:
        err(f"Only {n_sign} sign questions (exam needs {exam['signCount']})")
    if n_general < exam["generalCount"]:
        err(f"Only {n_general} general questions (exam needs {exam['generalCount']})")

    if not errors:
        print(f"  [{sid}] OK: {len(questions)} questions, {len(signs)} signs, "
              f"{len(section_slugs)} sections, {len(topics)} topics "
              f"(sign={n_sign} general={n_general}).")
    return errors


def main() -> int:
    index = json.loads((DATA / "states.index.json").read_text())
    states = index["states"]
    print(f"Validating {len(states)} state(s): {', '.join(s['id'] for s in states)}")

    errors: list[str] = []
    for summary in states:
        errors.extend(validate_state(summary))

    if errors:
        print(f"\nVALIDATION FAILED ({len(errors)} issue(s)):")
        for e in errors:
            print("  -", e)
        return 1

    print("\nValidation OK for all states.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
