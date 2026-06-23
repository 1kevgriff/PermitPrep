# Virginia Permit Prep

A free, offline-capable study app for the **Virginia learner's permit knowledge
exam**. It ships the official driver's manual content and a large, curated
question bank as static JSON — no backend, no accounts, no API costs.

- **Real Exam** — mirrors the VA test: Part 1 is 10 traffic-sign questions (must
  get **all 10** correct to advance), Part 2 is 25 general-knowledge questions
  (pass at **≥ 80%**).
- **Practice** — pick a topic and length, with instant feedback + explanations
  that link back to the manual.
- **Flash Cards** — Signs and Rules/Facts decks with spaced-repetition-lite
  (Leitner boxes).
- **Review Missed** — replays the exact questions you've gotten wrong.
- **Manual** — all 8 sections, searchable, with the sign images inline.
- **Progress** — exam history, pass rate, and weak topics saved in `localStorage`.

Built with **Vue 3 + TypeScript + Vite**. Content is extracted from the official
manual PDF (`assets/dmv39.pdf`, 40 pages, 8 sections) — **64 signs** and
**145 questions** across 13 topics.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/PermitPrep/
npm run test       # unit + component + integration tests (Vitest)
npm run typecheck  # vue-tsc
npm run lint       # eslint
npm run build      # type-check + production build to dist/
npm run preview    # serve the built dist/
```

## Project layout

```
assets/dmv39.pdf          Source: Virginia Driver's Manual (DMV39)
public/data/*.v1.json     Shipped content: signs, manual, question bank (versioned)
public/images/{signs,markings}/   Sign + marking images cropped from the PDF
src/lib/                  Pure, fully-tested logic (selection, scoring, srs, shuffle)
src/stores/               Pinia stores (content, progress, session) + persist plugin
src/views/  src/components/   UI
scripts/authoring/        One-off PDF extraction + question authoring (NOT bundled)
tests/                    Vitest suites
```

## Regenerating the content (authoring)

The data in `public/data` and `public/images` is generated from the PDF plus two
curated, human-reviewed inputs (`scripts/authoring/sign_glosses.json` and
`general_questions.json`). To rebuild everything:

```bash
python3 -m venv scripts/authoring/.venv
scripts/authoring/.venv/bin/pip install pymupdf
npm run authoring     # runs scripts/authoring/build_all.py + validates
```

The pipeline: extract images → extract sign captions (font-aware) → pair signs →
finalize `signs.v1.json` → build `manual.v1.json` → build `questions.v1.json` →
`validate_bank.py`. Sign image/meaning pairings were verified page-by-page
against the rendered PDF.

## Deploy (GitHub Pages)

Pushing to `main`/`master` runs `.github/workflows/deploy.yml`, which type-checks,
tests, builds, and publishes `dist/` to GitHub Pages.

The app uses **hash routing** and Vite `base: '/PermitPrep/'`, so it expects
to be served from a repo named **`PermitPrep`**
(`https://<user>.github.io/PermitPrep/`). If you use a different repo name,
update `base` in `vite.config.ts` — the router derives its base from
`import.meta.env.BASE_URL`, so no other change is needed.

## Disclaimer

A study aid only. It does not supersede the Code of Virginia or official DMV
materials. Question counts for Part 2 follow the standard VA format (25 questions)
and are configurable in `src/types/exam.ts` (`VA_EXAM_CONFIG`).
