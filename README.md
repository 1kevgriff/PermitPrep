# Permit Prep

A free, offline-capable study app for the **learner's permit knowledge exam**.
It ships official driver's-manual content and large, curated question banks as
static JSON — no backend, no accounts, no API costs.

It's **multi-state**: every piece of state-specific content and copy is
data-driven, so adding a state is "drop a `public/data/{state}/` folder + a
`states.index.json` entry" — no code changes. **Virginia** ships as state #1.

- **Real Exam** — mirrors each state's test. For Virginia: Part 1 is 10
  traffic-sign questions (must get **all 10** correct to advance), Part 2 is 25
  general-knowledge questions (pass at **≥ 80%**). Counts/thresholds live in each
  state's config.
- **Practice** — pick a topic and length, with instant feedback + explanations
  that link back to the manual.
- **Flash Cards** — Signs and Rules/Facts decks with spaced-repetition-lite
  (Leitner boxes).
- **Review Missed** — replays the exact questions you've gotten wrong.
- **Manual** — all sections, searchable, with the sign images inline.
- **State picker** — switch states from the app bar; the choice is remembered.
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
public/data/states.index.json     Index of available states (id, name, abbr, config)
public/data/signs.v1.json         Shared federal (MUTCD) sign bank
public/data/{state}/              Per-state content: config + manual + questions (versioned)
public/images/{signs,markings}/   Sign + marking images cropped from the PDF
src/lib/                  Pure, fully-tested logic (selection, scoring, srs, shuffle)
src/stores/               Pinia stores (states, content, progress, session) + persist plugin
src/types/state.ts        Multi-state config types (StatesIndex, StateConfig)
src/views/  src/components/   UI
scripts/authoring/        One-off PDF extraction + question authoring (NOT bundled)
tests/                    Vitest suites
```

### Adding a state

1. Create `public/data/{id}/` with `config.v1.json`, `manual.v1.json`, and
   `questions.v1.json` (signs default to the shared federal bank; override via
   the config's `data.signs` if needed).
2. Add an entry to `public/data/states.index.json`.

`config.v1.json` carries everything the UI shows for a state — name/abbr,
branding + hero copy, exam counts/pass %, manual source, and the data file
paths. No code changes are required.

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

A study aid only. It does not supersede any state's code or official DMV
materials. Exam counts and pass thresholds are configurable per state in that
state's `public/data/{state}/config.v1.json` (`exam`).
