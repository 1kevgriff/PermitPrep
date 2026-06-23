#!/usr/bin/env python3
"""Run the full authoring pipeline end to end.

Regenerates the extracted images, signs, manual, and question bank from the
source PDF + curated inputs, then validates the result. Run with the project
venv:  scripts/authoring/.venv/bin/python scripts/authoring/build_all.py
(or `npm run authoring`).

Curated inputs that are NOT regenerated (hand-authored, reviewed by Claude):
  - sign_glosses.json       concise answer text per sign
  - general_questions.json  the general-knowledge question bank
"""
from __future__ import annotations

import sys

import extract_images
import extract_captions
import build_signs
import finalize_signs
import build_manual
import build_questions
import validate_bank

STEPS = [
    ("Extract images", extract_images.main),
    ("Extract sign captions", extract_captions.main),
    ("Pair signs (first guess)", build_signs.main),
    ("Finalize signs.v1.json", finalize_signs.main),
    ("Build manual.v1.json", build_manual.main),
    ("Build questions.v1.json", build_questions.main),
]


def main() -> int:
    for i, (label, fn) in enumerate(STEPS, 1):
        print(f"\n[{i}/{len(STEPS)}] {label}")
        fn()
    print("\n[validate] Checking data integrity")
    code = validate_bank.main()
    print("\nDone." if code == 0 else "\nValidation failed.")
    return code


if __name__ == "__main__":
    sys.exit(main())
