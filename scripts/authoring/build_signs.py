#!/usr/bin/env python3
"""Phase 1.3/1.4 — Pair sign images with their captions (first guess) and emit
a visual-review gallery for Claude-in-the-loop correction.

Inputs:  _extracted/images.json, _extracted/blocks.json
Outputs:
  _extracted/signs_firstguess.json  [{signId,name,meaning,file,allFiles,page,column}]
  _extracted/signs-review.html       gallery (image + proposed name/meaning)

Pairing rule (per page, per column band): an image belongs to the caption with
the greatest y0 at or above the image's vertical center. This naturally handles
captions that show multiple signs and images that have no caption.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
EXTRACTED = ROOT / "scripts" / "authoring" / "_extracted"
COLUMN_SPLIT = 306.0

# Captions that are signal/legend prose, not a named sign chart entry.
SKIP_NAMES = {"Note"}

# Only pages that are genuine sign charts (regulatory/warning/work-zone).
SIGN_CHART_PAGES = range(8, 13)  # PDF 8-12 (shapes + regulatory + warning + work zone)


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[–—]", "-", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def ycenter(bbox):
    return (bbox[1] + bbox[3]) / 2.0


def xcenter(bbox):
    return (bbox[0] + bbox[2]) / 2.0


def main() -> None:
    images = json.loads((EXTRACTED / "images.json").read_text())
    captions = json.loads((EXTRACTED / "captions.json").read_text())

    sign_imgs = [im for im in images if im["kind"] == "sign"]
    captions = [c for c in captions
                if c["page"] in SIGN_CHART_PAGES and c["name"] not in SKIP_NAMES]

    # caption -> list of image files, by spatial rule (image's nearest caption above
    # within the same column). caption top == bold name-span origin y.
    cap_key = lambda c: (c["page"], c["column"], round(c["y"], 1))
    assigned: dict[tuple, list[dict]] = {cap_key(c): [] for c in captions}

    for im in sign_imgs:
        if im["page"] not in SIGN_CHART_PAGES:
            continue
        col = 0 if xcenter(im["bbox"]) < COLUMN_SPLIT else 1
        yc = ycenter(im["bbox"])
        # captions on same page+column at or above this image
        cands = [c for c in captions
                 if c["page"] == im["page"] and c["column"] == col
                 and c["y"] <= yc + 6]
        if not cands:
            continue
        best = max(cands, key=lambda c: c["y"])
        assigned[cap_key(best)].append(im)

    signs = []
    used_slugs: dict[str, int] = {}
    for c in captions:
        imgs = sorted(assigned[cap_key(c)], key=lambda im: ycenter(im["bbox"]))
        if not imgs:
            continue  # caption with no paired image -> not a quizzable sign
        slug = slugify(c["name"])
        if slug in used_slugs:
            used_slugs[slug] += 1
            slug = f"{slug}-{used_slugs[slug]}"
        else:
            used_slugs[slug] = 1
        signs.append({
            "signId": slug,
            "name": c["name"],
            "meaning": c["meaning"],
            "file": imgs[0]["file"],
            "allFiles": [im["file"] for im in imgs],
            "page": c["page"],
            "printedPage": c["printedPage"],
            "column": c["column"],
        })

    (EXTRACTED / "signs_firstguess.json").write_text(json.dumps(signs, indent=2))

    # Review gallery -------------------------------------------------------
    rows = []
    for i, s in enumerate(signs):
        imgs_html = "".join(
            f'<img src="../../public/{f}" style="height:80px;margin:2px;'
            f'border:1px solid #ccc;background:#fff">' for f in s["allFiles"])
        rows.append(f"""
        <tr id="row-{i}">
          <td>{i}</td>
          <td>{imgs_html}</td>
          <td><b>{s['name']}</b><br><small>{s['signId']}</small></td>
          <td>{s['meaning']}</td>
          <td>p{s['page']} c{s['column']} ({len(s['allFiles'])} img)</td>
        </tr>""")
    html = f"""<!doctype html><meta charset="utf-8">
    <title>Sign review ({len(signs)})</title>
    <style>body{{font:14px system-ui;margin:20px}}table{{border-collapse:collapse}}
    td{{border:1px solid #ddd;padding:6px;vertical-align:top}}
    td:nth-child(4){{max-width:380px}}</style>
    <h1>Sign first-guess review — {len(signs)} signs</h1>
    <table><tr><th>#</th><th>image(s)</th><th>name / id</th><th>meaning</th><th>src</th></tr>
    {''.join(rows)}</table>"""
    (EXTRACTED / "signs-review.html").write_text(html)

    print(f"Paired {len(signs)} signs (from {len(captions)} chart captions, "
          f"{len(sign_imgs)} sign images).")
    multi = [s for s in signs if len(s["allFiles"]) > 1]
    print(f"  {len(multi)} captions have multiple images: "
          + ", ".join(s["signId"] for s in multi))
    print(f"  -> {EXTRACTED/'signs_firstguess.json'} and signs-review.html")


if __name__ == "__main__":
    main()
