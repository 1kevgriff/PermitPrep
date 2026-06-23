#!/usr/bin/env python3
"""Phase 1.2 — Extract cleaned, reading-order text blocks from the manual PDF.

Output: scripts/authoring/_extracted/blocks.json
  [{page, printedPage, column, bbox, text, kind, signName?, signMeaning?}]

- Two-column letter pages: reading order is left column (x0<306) top-to-bottom,
  then right column.
- Running headers/footers (letter-spaced title, page numbers, section running
  head, "Table of Contents") are dropped.
- Caption blocks matching "<Name>: <meaning>" on sign pages are flagged with
  parsed signName/signMeaning for later image pairing.
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
COLUMN_SPLIT = 306.0  # letter page midline

# Lines/blocks that are page chrome, not content.
_TITLE_RE = re.compile(r"V\s*I\s*R\s*G\s*I\s*N\s*I\s*A", re.I)
_PAGENUM_RE = re.compile(r"^\s*\d{1,3}\s*$")
_RUNHEAD_RE = re.compile(r"^(Table of Contents|Section \d+:.*)$")

# "Name: meaning" — name is a short Title-ish phrase before the first colon.
_CAPTION_RE = re.compile(r"^([A-Z][A-Za-z0-9 /,'\-–&()]{1,46}?):\s+(.*\S)", re.S)


def clean(text: str) -> str:
    """Join wrapped lines, fix mojibake/curly punctuation, squeeze whitespace."""
    text = (text.replace("�", "'")   # � replacement char -> apostrophe
                .replace("’", "'").replace("‘", "'")
                .replace("“", '"').replace("”", '"')
                .replace(" ", " "))
    text = text.replace("\n", " ")
    return re.sub(r"\s+", " ", text).strip()


def is_chrome(text: str, bbox) -> bool:
    if not text:
        return True
    if _TITLE_RE.search(text) and len(text) < 60:
        return True
    if _PAGENUM_RE.match(text):
        return True
    if _RUNHEAD_RE.match(text):
        return True
    # Footer band near bottom of the page.
    if bbox[1] > 752 and len(text) < 60:
        return True
    return False


def classify(text: str) -> tuple[str, str | None, str | None]:
    """Return (kind, signName, signMeaning)."""
    m = _CAPTION_RE.match(text)
    if m:
        name = m.group(1).strip()
        meaning = m.group(2).strip()
        # A real caption: short name, meaningful body, not a sentence fragment.
        if 2 <= len(name) <= 46 and len(meaning) >= 12 and name[0].isupper():
            return "caption", name, meaning
    # Headings: short, no terminal punctuation.
    if len(text) <= 42 and not text.endswith((".", ",", ":")) and text[0].isupper():
        return "heading", None, None
    return "paragraph", None, None


def main() -> None:
    EXTRACTED.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF)
    out: list[dict] = []

    for pno in range(1, doc.page_count + 1):
        page = doc[pno - 1]
        blocks = []
        for b in page.get_text("blocks"):
            x0, y0, x1, y1, raw, *_ = b
            text = clean(raw)
            if is_chrome(text, (x0, y0, x1, y1)):
                continue
            blocks.append((x0, y0, x1, y1, text))

        # Reading order: column, then vertical.
        blocks.sort(key=lambda b: (0 if b[0] < COLUMN_SPLIT else 1, round(b[1], 0)))

        for x0, y0, x1, y1, text in blocks:
            kind, name, meaning = classify(text)
            rec = {
                "page": pno,
                "printedPage": pno - PRINTED_OFFSET,
                "column": 0 if x0 < COLUMN_SPLIT else 1,
                "bbox": [round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)],
                "text": text,
                "kind": kind,
            }
            if kind == "caption":
                rec["signName"] = name
                rec["signMeaning"] = meaning
            out.append(rec)

    (EXTRACTED / "blocks.json").write_text(json.dumps(out, indent=2))
    n_cap = sum(1 for r in out if r["kind"] == "caption")
    print(f"Extracted {len(out)} blocks across {doc.page_count} pages "
          f"({n_cap} caption candidates).")
    print(f"  -> {EXTRACTED / 'blocks.json'}")


if __name__ == "__main__":
    main()
