#!/usr/bin/env python3
"""Phase 1.4 (final) — Promote the visually-verified first-guess pairings to the
authoritative public/data/signs.v1.json, adding a category tag.

The first-guess pairing was reviewed page-by-page against the rendered PDF and
confirmed correct, so this is a deterministic promotion + categorization step.
"""
from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
EXTRACTED = ROOT / "scripts" / "authoring" / "_extracted"
OUT = ROOT / "public" / "data" / "signs.v1.json"

SHAPE_IDS = {
    "octagon-stop", "triangle-yield", "rectangle-regulatory-or-guide",
    "diamond-warning", "pentagon-school-zone-school-crossing",
}
# page-8 entries that are traffic-signal indications rather than posted signs
SIGNAL_IDS = {
    "green-light-or-arrow", "out-of-service-signals",
    "yellow-x-or-yellow-diagonal-downward-arrow", "green-arrow",
    "left-turn-arrow", "pedestrian-hybrid-beacons-phbs",
}


def categorize(sign: dict) -> str:
    sid = sign["signId"]
    if sid in SHAPE_IDS:
        return "shape"
    if sid in SIGNAL_IDS:
        return "signal"
    page = sign["page"]
    if page == 9:
        return "regulatory"
    if page == 12:
        return "workzone"
    return "warning"  # pages 10-11


def main() -> None:
    src = json.loads((EXTRACTED / "signs_firstguess.json").read_text())
    signs = []
    for s in src:
        signs.append({
            "signId": s["signId"],
            "name": s["name"],
            "meaning": s["meaning"],
            "category": categorize(s),
            "image": s["file"],
            "page": s["page"],
            "printedPage": s["printedPage"],
        })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(signs, indent=2))

    from collections import Counter
    cats = Counter(s["category"] for s in signs)
    print(f"Wrote {len(signs)} signs -> {OUT}")
    print("  by category:", dict(cats))


if __name__ == "__main__":
    main()
