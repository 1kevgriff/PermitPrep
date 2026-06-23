#!/usr/bin/env python3
"""Phase 1.2b — Font-aware sign-caption extraction.

The block-based extractor merges vertically-adjacent captions (e.g. "Do Not Pass"
+ "Left Turn Yield on Green") into one record. Sign names are set in a *bold*
10pt font ending with a colon, while meanings are Roman — so we split on bold
name-runs instead of block geometry.

Output: scripts/authoring/_extracted/captions.json
  [{page, printedPage, column, x, y, name, meaning}]
"""
from __future__ import annotations

import json
import pathlib
import re

import fitz

ROOT = pathlib.Path(__file__).resolve().parents[2]
PDF = ROOT / "assets" / "dmv39.pdf"
EXTRACTED = ROOT / "scripts" / "authoring" / "_extracted"

PRINTED_OFFSET = 2
COLUMN_SPLIT = 306.0
NAME_SIZE_RANGE = (8.5, 11.5)  # caption names are ~10pt; headings are larger
LEADING_MAX = 16.0  # max line gap (pt) for spans belonging to one wrapped name


def clean(text: str) -> str:
    text = (text.replace("�", "'").replace("’", "'").replace("‘", "'")
                .replace("“", '"').replace("”", '"').replace(" ", " "))
    return re.sub(r"\s+", " ", text).strip()


def is_bold(span) -> bool:
    return "Bold" in span["font"] or bool(span["flags"] & 16)


_TITLE_RE = re.compile(r"V\s*I\s*R\s*G\s*I\s*N\s*I\s*A\s+D\s*R", re.I)
_PAGENUM_RE = re.compile(r"^[\s|]*\d{1,3}[\s|]*$")


def is_chrome_span(text: str, y: float) -> bool:
    """Running title / page-number footer that must not leak into a meaning."""
    if y > 752:  # footer band
        return True
    return bool(_TITLE_RE.search(text) or _PAGENUM_RE.match(text))


def spans_in_reading_order(page):
    spans = []
    for blk in page.get_text("dict")["blocks"]:
        if "lines" not in blk:
            continue
        for ln in blk["lines"]:
            for sp in ln["spans"]:
                if not sp["text"].strip():
                    continue
                x, y = sp["origin"]
                if is_chrome_span(sp["text"], y):
                    continue
                spans.append({
                    "x": x, "y": y, "text": sp["text"],
                    "bold": is_bold(sp), "size": sp["size"],
                    "col": 0 if x < COLUMN_SPLIT else 1,
                })
    # reading order: column, then top-to-bottom, then left-to-right
    spans.sort(key=lambda s: (s["col"], round(s["y"], 0), s["x"]))
    return spans


def extract_page_captions(page, pno):
    spans = spans_in_reading_order(page)
    cur = None          # active caption dict being built
    name_buf = []        # pending bold-no-colon spans: (y, x, col, text)
    finalized = []

    def finalize():
        nonlocal cur
        if cur is None:
            return
        name = clean(cur["name"]).rstrip(":").strip()
        meaning = clean(" ".join(cur["meaning_parts"]))
        if 2 <= len(name) <= 46 and len(meaning) >= 12 and name[0].isupper():
            finalized.append({
                "page": pno, "printedPage": pno - PRINTED_OFFSET,
                "column": cur["col"], "x": round(cur["x"], 1),
                "y": round(cur["y"], 1), "name": name, "meaning": meaning,
            })
        cur = None

    def name_prefix(colon_y):
        # Keep only buffered bold spans contiguous (normal leading) with the
        # colon span, so a real heading separated by a larger gap is dropped.
        kept, y = [], colon_y
        for entry in reversed(name_buf):
            if 0 <= (y - entry[0]) <= LEADING_MAX:
                kept.append(entry[3])
                y = entry[0]
            else:
                break
        name_buf.clear()
        return " ".join(reversed(kept))

    for sp in spans:
        size_ok = NAME_SIZE_RANGE[0] <= sp["size"] <= NAME_SIZE_RANGE[1]
        if sp["bold"] and size_ok:
            if ":" in sp["text"]:
                finalize()
                pre, _, post = sp["text"].partition(":")
                prefix = name_prefix(sp["y"])
                name = (prefix + " " + pre).strip() if prefix else pre
                cur = {"name": name,
                       "meaning_parts": [clean(post)] if post.strip() else [],
                       "x": sp["x"], "y": sp["y"], "col": sp["col"]}
            else:
                # bold-no-colon: heading boundary OR a wrapped name fragment.
                finalize()
                name_buf.append((sp["y"], sp["x"], sp["col"], sp["text"]))
        elif sp["bold"]:  # out-of-range bold = section heading
            name_buf.clear()
            finalize()
        else:  # roman span = meaning text
            if cur is not None:
                cur["meaning_parts"].append(sp["text"])
            else:
                name_buf.clear()  # buffered bold run was a heading, not a name
    finalize()
    return finalized


def main() -> None:
    EXTRACTED.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF)
    out = []
    for pno in range(7, 14):  # sign + signal + start of markings pages
        out.extend(extract_page_captions(doc[pno - 1], pno))
    (EXTRACTED / "captions.json").write_text(json.dumps(out, indent=2))
    print(f"Extracted {len(out)} sign captions (font-aware) from pp.7-13.")
    print(f"  -> {EXTRACTED / 'captions.json'}")


if __name__ == "__main__":
    main()
