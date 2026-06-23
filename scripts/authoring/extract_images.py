#!/usr/bin/env python3
"""Phase 1.1 — Extract raster images (signs + pavement markings) from the
Virginia Driver's Manual PDF.

Output:
  public/images/signs/sign-<page>-<n>.png     (sign-chart pages)
  public/images/markings/marking-<page>-<n>.png
  scripts/authoring/_extracted/images.json    [{id,file,kind,page,printedPage,bbox,w,h}]

Run once on the dev machine; the PNGs + images.json are committed.

Page model: the PDF's printed page number == PDF page index - 2.
Sign charts live on printed pp. 7-10 (PDF 9-12); pavement markings/curbs on
printed pp. 11-13 (PDF 13-15). We also keep the signal images on printed pp. 5-6
(PDF 7-8) since a few are quiz-worthy. Tiny/very-wide images (rules, banners)
are skipped via a size filter.
"""
from __future__ import annotations

import json
import pathlib

import fitz  # PyMuPDF

ROOT = pathlib.Path(__file__).resolve().parents[2]
PDF = ROOT / "assets" / "dmv39.pdf"
OUT_SIGNS = ROOT / "public" / "images" / "signs"
OUT_MARKINGS = ROOT / "public" / "images" / "markings"
EXTRACTED = ROOT / "scripts" / "authoring" / "_extracted"

PRINTED_OFFSET = 2  # PDF page index = printed page + 2

# PDF page index (1-based) ranges to harvest, and how to classify their images.
SIGN_PAGES = range(7, 13)      # PDF 7-12  -> signals + regulatory + warning + work-zone signs
MARKING_PAGES = range(13, 16)  # PDF 13-15 -> pavement markings + painted curbs

# Filter out non-sign rasters: signs are roughly square icons ~40-120pt.
MIN_SIDE = 24.0
MAX_SIDE = 200.0
MAX_ASPECT = 3.2  # drop long thin banners / rules


def pixmap_for(doc: fitz.Document, xref: int) -> fitz.Pixmap | None:
    """Return an RGB(A) pixmap for an image xref, flattening CMYK/odd spaces."""
    try:
        pix = fitz.Pixmap(doc, xref)
    except Exception:
        return None
    if pix.colorspace is None:
        return None
    # Normalize to RGB (keep alpha if present) so saved PNGs look correct.
    if pix.colorspace.n not in (1, 3) or pix.colorspace.name == "CMYK":
        pix = fitz.Pixmap(fitz.csRGB, pix)
    return pix


def main() -> None:
    OUT_SIGNS.mkdir(parents=True, exist_ok=True)
    OUT_MARKINGS.mkdir(parents=True, exist_ok=True)
    EXTRACTED.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(PDF)
    records: list[dict] = []
    seen_xref_file: dict[int, str] = {}  # de-dupe identical xrefs across placements

    for kind, pages, outdir, prefix in (
        ("sign", SIGN_PAGES, OUT_SIGNS, "sign"),
        ("marking", MARKING_PAGES, OUT_MARKINGS, "marking"),
    ):
        for pno in pages:
            if pno > doc.page_count:
                continue
            page = doc[pno - 1]
            n = 0
            for img in page.get_images(full=True):
                xref = img[0]
                rects = page.get_image_rects(xref)
                if not rects:
                    continue
                # Use the largest placement rect for sizing/pairing.
                rect = max(rects, key=lambda r: r.width * r.height)
                w, h = rect.width, rect.height
                if w < MIN_SIDE or h < MIN_SIDE or w > MAX_SIDE or h > MAX_SIDE:
                    continue
                aspect = max(w, h) / max(1.0, min(w, h))
                if aspect > MAX_ASPECT:
                    continue

                n += 1
                fname = f"{prefix}-{pno}-{n}.png"
                relpath = f"images/{'signs' if kind == 'sign' else 'markings'}/{fname}"

                if xref in seen_xref_file:
                    # Identical raster reused — reference the first export, no rewrite.
                    relpath = seen_xref_file[xref]
                else:
                    pix = pixmap_for(doc, xref)
                    if pix is None:
                        n -= 1
                        continue
                    pix.save(str(outdir / fname))
                    seen_xref_file[xref] = relpath

                records.append(
                    {
                        "id": f"{prefix}-{pno}-{n}",
                        "file": relpath,
                        "kind": kind,
                        "xref": xref,
                        "page": pno,
                        "printedPage": pno - PRINTED_OFFSET,
                        "bbox": [round(rect.x0, 1), round(rect.y0, 1),
                                 round(rect.x1, 1), round(rect.y1, 1)],
                        "w": round(w, 1),
                        "h": round(h, 1),
                    }
                )

    (EXTRACTED / "images.json").write_text(json.dumps(records, indent=2))
    n_signs = sum(1 for r in records if r["kind"] == "sign")
    n_mark = sum(1 for r in records if r["kind"] == "marking")
    print(f"Extracted {len(records)} image placements "
          f"({n_signs} sign, {n_mark} marking); "
          f"{len(seen_xref_file)} unique rasters written.")
    print(f"  -> {EXTRACTED / 'images.json'}")


if __name__ == "__main__":
    main()
