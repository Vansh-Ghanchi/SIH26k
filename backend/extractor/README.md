# PAIMANA Report Extractor

Turns monthly MoSPI **PAIMANA Flash Report** PDFs into a tabular panel dataset.

This folder is **self-contained and independent of `backend/ml/`**. It reads PDFs from
its own `flash_reports/`, writes CSVs into its own `data/`, and imports nothing from
outside. The only thing that crosses the boundary is one output file — see
[The contract](#the-contract) below.

---

## Run it

```powershell
cd backend\extractor
pip install -r requirements.txt
python src\extract_flash_reports.py
```

Takes a couple of minutes for all 14 PDFs. Output:

```
data/monthly/paimana_YYYY-MM.csv   one file per report month
data/paimana_panel.csv             all months stacked  <- this is the deliverable
```

Expected result: **19,208 rows** across 13 months (2025-07 … 2026-07).

---

## The contract

`backend/ml/` consumes exactly one file from here: the panel CSV. Nothing else.

**Handoff step** (run after every extraction):

```powershell
copy backend\extractor\data\paimana_panel.csv backend\ml\data\panel.csv
```

Note the rename — the ML side expects `panel.csv`.

### Output schema — 19 columns, one row per project-month

| # | Column | Type | Notes |
|---|---|---|---|
| 1 | `month` | `YYYY-MM` | report month, derived from PDF cover text |
| 2 | `sl_no` | int | serial number *within that report* — **not** a stable project ID |
| 3 | `project_name` | str | |
| 4 | `agency` | str | executing agency |
| 5 | `project_code` | str | numeric PAIMANA code |
| 6 | `legacy_code` | str | old OCMS code, e.g. `N04000083` |
| 7 | `ministry` | str | carried down from table header rows |
| 8 | `sector` | str | carried down from table header rows |
| 9 | `state` | str | comma-joined if multi-state |
| 10 | `approval_date` | `MM/YYYY` | `""` if NA |
| 11 | `start_date` | `MM/YYYY` | `""` if NA |
| 12 | `target_doc` | `MM/YYYY` | original date of commissioning |
| 13 | `revised_doc` | `MM/YYYY` | revised DoC, `""` if never revised |
| 14 | `actual_doc` | `MM/YYYY` | only populated for completed projects |
| 15 | `original_cost_cr` | float | ₹ crore, `""` if unparseable |
| 16 | `revised_cost_cr` | float | ₹ crore |
| 17 | `cumulative_expenditure_cr` | float | ₹ crore |
| 18 | `physical_progress_pct` | float | 0–100 |
| 19 | `list_type` | enum | `ongoing` \| `completed` \| `added` |

### ⚠ Changing this schema is a breaking change

`backend/ml/src/build_features.py` reads these column names directly and builds a
per-project timeline by joining snapshots across months. Specifically it depends on:

- **Column names exactly as above.** Renaming or dropping any of columns 3–18 breaks
  feature construction.
- **`list_type == "ongoing"`** — the ML pipeline filters on this literal string.
  18,213 of the 19,208 rows.
- **`project_name` + `agency` + `state` being stable across months.** There is no
  persistent project ID in the source data, so these three fields are normalised and
  concatenated to form a synthetic key. If the extraction of any of them changes,
  project timelines silently fragment and every momentum feature degrades.
- **`month` sorting lexicographically** — hence zero-padded `YYYY-MM`.

If you need to change any of this, flag it before pushing — it won't fail loudly, it
will just quietly make the model worse.

---

## How it works

1. **Month detection** — regex-scan the first 5 pages for `MARCH 2026`-style text.
   Raises `RuntimeError` if not found.
2. **Table identification by column count** — `find_tables()` on every page, then:
   8 cols = Table 6 *All Ongoing*, 7 cols = Table 3 *Completed*, 6 cols = Table 4
   *Newly Added*. `normalize_table()` first strips the empty padding columns pymupdf
   sometimes adds at the page edges.
3. **Multi-value cell unpacking** — PDF cells cram several fields into one string
   separated by newlines. Dedicated parsers handle each shape:
   - `parse_paren_field` — `"Name\n(Agency)\n(706724)\n(N04000083)"` → 4 fields
   - `parse_date_pair` — `"12/2016\n(03/2018)"` → original, revised
   - `parse_cost_pair` — `"1712\n(2520)"` → `1712.0, 2520.0`
4. **Ministry / sector carry-over** — these are *not* columns. They appear as
   unnumbered header rows between project rows, so the parser keeps running
   `current_ministry` / `current_sector` state and every following project inherits
   it. **This makes page traversal order load-bearing.**

## Known issues

- **`FR_JUNE_2025.pdf` yields 0 rows** from `extract_flash_reports.py`. It predates
  the PAIMANA format and uses the old 9-column OCMS layout, so the 8-column check
  never matches. That's why `extract_legacy_reports.py` exists.
- **`extract_legacy_reports.py` is not wired into anything.** It parses the old
  format into `data/legacy/`, and no downstream code reads its output. Its second
  input (the Q1 2025-26 quarterly, `QPISR_QR_1st_2025-26.pdf`) is **not in this
  repo**, so that job prints `missing (skipped):` and continues. Drop the PDF into
  `flash_reports/quarterly/` if you want it. Kept for reference only — safe to
  delete if you don't need pre-July-2025 history.
- Its output has **17 columns, not the panel's 19** (no `legacy_code`, no
  `actual_doc`), so it cannot be fed to `build_features.py` as-is.
- **Project coverage jumps mid-series** — ~850 projects/month through Nov 2025, then
  ~2,000 from Dec 2025 onward. This is real (MoSPI expanded reporting), not a
  parsing bug, but it means early months have short project histories.
- Reporting coverage of `ministry` / `sector` depends on those header rows being
  detected; the keyword list is at `extract_flash_reports.py:267`.

## Data source

Monthly PAIMANA Flash Reports, Ministry of Statistics & Programme Implementation
(MoSPI), Jun 2025 – Jul 2026. All 14 source PDFs are committed under
`flash_reports/all_months/` (86 MB) so extraction is reproducible without
re-downloading.
