#!/usr/bin/env python3
"""Phase 2 — Assemble public/data/questions.v1.json.

Sign questions: one per sign ("What does this sign mean?") with the sign's gloss
as the answer and 3 distractors drawn from OTHER signs' glosses (same category
preferred for plausibility). Choices are deterministically shuffled per question.

General questions: promoted from the curated general_questions.json with ids and
manualRef attached.
"""
from __future__ import annotations

import json
import pathlib
import random

ROOT = pathlib.Path(__file__).resolve().parents[2]
AUTHOR = ROOT / "scripts" / "authoring"
OUT = ROOT / "public" / "data" / "questions.v1.json"
SIGNS_SECTION = "signals-signs-and-pavement-markings"


def build_sign_questions(signs, glosses):
    by_cat: dict[str, list[dict]] = {}
    for s in signs:
        by_cat.setdefault(s["category"], []).append(s)

    questions = []
    for s in signs:
        gloss = glosses.get(s["signId"])
        if not gloss:
            raise SystemExit(f"Missing gloss for sign {s['signId']}")
        rng = random.Random(f"sign:{s['signId']}")

        # distractor pool: other signs, same category first, then the rest
        same = [o for o in by_cat[s["category"]] if o["signId"] != s["signId"]]
        other = [o for o in signs
                 if o["category"] != s["category"] and o["signId"] != s["signId"]]
        rng.shuffle(same)
        rng.shuffle(other)
        pool, seen = [], {gloss}
        for o in same + other:
            g = glosses.get(o["signId"])
            if g and g not in seen:
                pool.append(g)
                seen.add(g)
            if len(pool) == 3:
                break

        choices = [gloss] + pool
        rng.shuffle(choices)
        questions.append({
            "id": f"sign-{s['signId']}",
            "type": "sign",
            "topic": "signs",
            "signId": s["signId"],
            "image": s["image"],
            "prompt": "What does this sign mean?",
            "choices": choices,
            "answerIndex": choices.index(gloss),
            "explanation": s["meaning"],
            "manualRef": {"sectionSlug": SIGNS_SECTION},
        })
    return questions


def build_general_questions(general):
    questions = []
    for i, q in enumerate(general, 1):
        slug = q["prompt"].lower()
        qid = f"gen-{q['topic']}-{i:03d}"
        questions.append({
            "id": qid,
            "type": "general",
            "topic": q["topic"],
            "prompt": q["prompt"],
            "choices": q["choices"],
            "answerIndex": q["answerIndex"],
            "explanation": q["explanation"],
            "manualRef": {"sectionSlug": q["section"]},
        })
    return questions


def main() -> None:
    signs = json.loads((ROOT / "public/data/signs.v1.json").read_text())
    glosses = json.loads((AUTHOR / "sign_glosses.json").read_text())
    general = json.loads((AUTHOR / "general_questions.json").read_text())

    sign_qs = build_sign_questions(signs, glosses)
    gen_qs = build_general_questions(general)
    bank = {"version": 1, "questions": sign_qs + gen_qs}
    OUT.write_text(json.dumps(bank, indent=2))

    from collections import Counter
    topics = Counter(q["topic"] for q in bank["questions"])
    print(f"Wrote {len(bank['questions'])} questions "
          f"({len(sign_qs)} sign, {len(gen_qs)} general) -> {OUT}")
    for t, n in sorted(topics.items(), key=lambda kv: -kv[1]):
        print(f"  {t:32s} {n}")


if __name__ == "__main__":
    main()
