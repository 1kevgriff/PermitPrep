#!/usr/bin/env python3
"""Phase 1.3 — Assemble public/data/manual.v1.json from extracted blocks, signs,
and marking images.

Each of the 8 sections (delimited by the size-24 "Section N:" headings) gets an
ordered list of content blocks:
  {type:'heading'|'paragraph', text}
  {type:'sign', signId}            (section 2 only — references signs.v1.json)
  {type:'image', src, caption}     (pavement-marking diagrams)

Reading order = (page, column, y). Sign-caption prose on pages 8-12 is dropped
from the prose stream because those entries are represented as `sign` blocks.
"""
from __future__ import annotations

import json
import pathlib
import re

import fitz

ROOT = pathlib.Path(__file__).resolve().parents[2]
PDF = ROOT / "assets" / "dmv39.pdf"
EXTRACTED = ROOT / "scripts" / "authoring" / "_extracted"
# Virginia is state #1; its content is namespaced under public/data/va/.
STATE = "va"
OUT = ROOT / "public" / "data" / STATE / "manual.v1.json"
COLUMN_SPLIT = 306.0

SECTIONS = [
    (1, "testing", "Testing", 5),
    (2, "signals-signs-and-pavement-markings", "Signals, Signs and Pavement Markings", 7),
    (3, "safe-driving", "Safe Driving", 16),
    (4, "seat-belts-airbags-and-child-safety-seats", "Seat Belts, Airbags, and Child Safety Seats", 28),
    (5, "penalties", "Penalties", 30),
    (6, "license-types", "License Types", 33),
    (7, "other-important-information", "Other Important Information", 35),
    (8, "sample-knowledge-exam", "Sample Knowledge Exam", 37),
]
SIGN_PAGES = range(8, 13)


def clean(text: str) -> str:
    text = (text.replace("�", "'").replace("’", "'").replace("‘", "'")
                .replace("“", '"').replace("”", '"').replace(" ", " "))
    text = re.sub(r"\s+", " ", text).strip()
    return text


_TITLE_RE = re.compile(r"V\s*I\s*R\s*G\s*I\s*N\s*I\s*A\s+D\s*R", re.I)
_PAGENUM_RE = re.compile(r"^[\s|]*\d{1,3}[\s|]*$")
_SECTION_RE = re.compile(r"^Section\s+\d+\s*:")


def is_chrome(text: str, y: float) -> bool:
    if not text or y > 752:
        return True
    return bool(_TITLE_RE.search(text) or _PAGENUM_RE.match(text)
                or text == "Table of Contents")


def section_for_page(page: int) -> int:
    sect = 1
    for num, _slug, _title, start in SECTIONS:
        if page >= start:
            sect = num
    return sect


def main() -> None:
    doc = fitz.open(PDF)
    signs = json.loads((ROOT / "public/data/signs.v1.json").read_text())
    images = json.loads((EXTRACTED / "images.json").read_text())

    # sign-name prefixes to strip caption prose from pages 8-12
    sign_prefixes = sorted({s["name"].lower() for s in signs}, key=len, reverse=True)
    sign_by_pos = {}  # (page, slug) lookup for inline placement
    for s in signs:
        sign_by_pos.setdefault(s["page"], []).append(s)

    marking_imgs = [im for im in images if im["kind"] == "marking"]

    # Gather positioned items: (page, column, y, item)
    items: list[tuple] = []

    for pno in range(5, doc.page_count + 1):
        page = doc[pno - 1]
        for b in page.get_text("blocks"):
            x0, y0, x1, y1, raw, *_ = b
            text = clean(raw)
            if is_chrome(text, y0) or _SECTION_RE.match(text):
                continue
            col = 0 if x0 < COLUMN_SPLIT else 1
            low = text.lower()
            if pno in SIGN_PAGES and any(low.startswith(p + ":") or low.startswith(p + " ")
                                         for p in sign_prefixes):
                continue  # represented as a sign block
            kind = ("heading" if len(text) <= 42 and not text.endswith((".", ",", ":"))
                    and text[:1].isupper() else "paragraph")
            items.append((pno, col, y0, {"type": kind, "text": text}))

    # signs as positioned blocks (need their y; reuse caption y from captions.json)
    captions = {(c["page"], c["name"]): c
                for c in json.loads((EXTRACTED / "captions.json").read_text())}
    for s in signs:
        cap = captions.get((s["page"], s["name"]))
        col = cap["column"] if cap else 0
        y = cap["y"] if cap else 0
        items.append((s["page"], col, y, {"type": "sign", "signId": s["signId"]}))

    # marking images as positioned image blocks
    for im in marking_imgs:
        x0, y0, x1, y1 = im["bbox"]
        col = 0 if (x0 + x1) / 2 < COLUMN_SPLIT else 1
        items.append((im["page"], col, y0,
                      {"type": "image", "src": im["file"], "caption": ""}))

    items.sort(key=lambda t: (t[0], t[1], t[2]))

    sections = []
    for num, slug, title, _start in SECTIONS:
        blocks = [it[3] for it in items if section_for_page(it[0]) == num]
        # collapse consecutive duplicate paragraphs (rare wrap artifacts)
        deduped = []
        for blk in blocks:
            if deduped and deduped[-1] == blk:
                continue
            deduped.append(blk)
        sections.append({"id": f"section-{num}", "slug": slug, "number": num,
                         "title": title, "blocks": deduped})

    manual = {"version": 1, "source": "Virginia Driver's Manual (DMV39)",
              "sections": sections}
    OUT.write_text(json.dumps(manual, indent=2))

    print(f"Wrote {OUT}")
    for s in sections:
        kinds = {}
        for b in s["blocks"]:
            kinds[b["type"]] = kinds.get(b["type"], 0) + 1
        print(f"  S{s['number']} {s['title'][:34]:34s} {kinds}")


if __name__ == "__main__":
    main()
