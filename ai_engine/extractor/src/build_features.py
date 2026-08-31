"""
Feature engineering for the PAIMANA panel.

Input : data/paimana_panel_v4.csv (14 months of project snapshots)
Output: data/features.csv  — one row per (project, month) with:
         - static features
         - timeline features
         - momentum features (changes across snapshots)
         - state-at-t features
         - forward-looking labels (what happens AFTER month t)

Leakage rules:
  - features use ONLY data from month <= t
  - labels use ONLY data from months  > t (up to horizon)
  - momentum windows are trailing (past only)

--------------------------------------------------------------------
HOW TO READ THIS FILE (notes for Python learners)
  - Every code line has a comment above or beside it explaining WHAT
    it does, WHY the pipeline needs it, and WHAT the Python syntax is.
  - None  = Python's "missing value" (like null in JavaScript).
    Comparing/doing math with None crashes, so this file is obsessed
    with checking for None before every calculation.
  - A dict {"key": value} is like a JS object. Each row-dict we build
    becomes exactly one CSV row; the keys become the column headers.
  - Problem-statement map (SIH PS 26103):
      y_cost_escalation  -> outcome (a) Cost Overrun Prediction Model
      y_deadline_slip    -> outcome (b) Time Overrun Prediction Model
      both labels        -> outcome (d) Early Warning System
      all feature inputs -> dimension (c): only CUF form fields
--------------------------------------------------------------------
"""
import os                      # built-in module: file paths & OS stuff
import csv                     # built-in module: reading/writing CSV files
import math                    # built-in module: math functions (we use log1p)
import re                      # built-in module: regular expressions (text pattern matching)
from collections import defaultdict  # a dict that auto-creates a missing key on first access


# __file__ is a built-in variable = the path of THIS file,
#   e.g. C:\Users\sanis\Redeem\waterdeep\src\build_features.py
# os.path.abspath(x)   -> turn a relative path into a full absolute one
# os.path.dirname(p)   -> strip the last path component (like dirname in JS)
#   dirname once  -> ...\waterdeep\src
#   dirname twice -> ...\waterdeep        (the repo root)
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# os.path.join glues path pieces together with the correct separator
# ("/" on Linux/Mac, "\" on Windows) — always use it instead of string concat.
PANEL = os.path.join(BASE, "data", "paimana_panel_v4.csv")   # input: the master panel
OUT = os.path.join(BASE, "data", "features.csv")             # output: model-ready features

# NOTE: MONTH_NUM is currently UNUSED in this script (parse_month below does its
# own arithmetic). Kept for reference / possible future use.
# Syntax: a "dict comprehension" — builds a dict in one line, like writing
#   {m: i+1} for every (i, m) pair from enumerate([...])  (enumerate = index+item,
#   so "January" gets 1, "February" gets 2, ...)
# Result: {"January": 1, "February": 2, ..., "December": 12}
MONTH_NUM = {m: i + 1 for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July",
     "August", "September", "October", "November", "December"])}


def parse_month(s):
    """'2026-03' -> (2026, 3) as absolute months int."""
    # try/except: run the code inside `try`; if ANY error happens, jump to
    # `except` instead of crashing. Here: malformed month strings -> None.
    try:
        # "2026-03".split("-") -> ["2026", "03"]  (like JS split)
        # tuple unpacking: y = "2026", m = "03" in one line
        y, m = s.split("-")
        # Why *12? We convert a year+month into ONE number: months since year 0.
        #   2026*12 + 3 = 24315  ("March 2026")
        # So date arithmetic becomes plain subtraction:
        #   (24315 - 24313) = 2  -> "2 months apart"
        return int(y) * 12 + int(m)
    except Exception:
        # any failure (empty string, wrong format, None) -> "unknown"
        return None


def parse_date(s):
    """'03/2018' -> absolute months int, else None."""
    # `if not s` — "falsy" check: True when s is None or "" (empty string).
    # Python treats None, "", 0, [] as falsy (like JS falsy values).
    if not s:
        return None
    s = s.strip()  # remove surrounding whitespace: " 03/2018 " -> "03/2018"
    # re.match checks the string against a REGEX pattern from the START:
    #   ^        = start of string
    #   (\d{2})  = group 1: exactly 2 digits (the month, e.g. "03")
    #   /        = a literal slash
    #   (\d{4})  = group 2: exactly 4 digits (the year, e.g. "2018")
    #   $        = end of string
    # Returns a "match object" if it fits, else None (which is falsy).
    m = re.match(r"^(\d{2})/(\d{4})$", s)
    if not m:
        return None
    # m.group(1) = "03", m.group(2) = "2018"  ->  2018*12 + 3  (absolute months)
    return int(m.group(2)) * 12 + int(m.group(1))


def f(x):
    """Safely convert anything to a float, or None if impossible.

    Used EVERYWHERE below because PDF extraction produces messy cells
    ("2,437 (8.4%)", empty strings, etc.). One safe wrapper instead of
    crashing on every bad cell.
    """
    try:
        # None or empty string -> None (missing), not 0!
        # This distinction matters: 0 = "measured zero", None = "we don't know".
        if x is None or x == "":
            return None
        return float(x)  # "2437.63" -> 2437.63
    except Exception:
        return None  # unparseable junk -> missing


def stable_id(r):
    """Build a unique project key from name + agency + state.

    The government renumbered all project codes mid-year (portal migration),
    so we can't trust the official ID. Instead we fingerprint a project by
    the concatenation of three text fields.
    """
    # "|".join([...])  -> glue list items with "|", e.g. "a|b|c"
    # " ".join(s.split())  -> normalize whitespace: collapse runs of
    #   spaces/tabs/newlines into single spaces AND strip the ends.
    #   ("Gangtok   highway " -> "Gangtok highway") so tiny PDF
    #   spacing differences don't create duplicate projects.
    # .lower()  -> case-insensitive matching.
    # [:60], [:30]  -> slicing: keep only the first 60 / 30 characters
    #   (like JS slice(0, 60)).
    return "|".join([
        " ".join(r["project_name"].lower().split())[:60],
        " ".join(r["agency"].lower().split()),
        " ".join(r["state"].lower().split())[:30],
    ])


def main():
    # ---------- load the panel, keep ongoing projects only ----------
    # csv.DictReader opens the CSV and, for every line, yields a dict
    #   {column_name: value}, e.g. {"month": "2026-03", "cost_orig": "1200", ...}
    # The list comprehension = build a list in one line (JS equivalent:
    #   rows = allRows.filter(r => r.list_type === "ongoing"))
    # Why only "ongoing"? Completed projects can't slip further and newly
    # added ones have no history — the early-warning question only makes
    # sense for projects still running (Table 6 of the flash report).
    rows = [r for r in csv.DictReader(open(PANEL, encoding="utf-8"))
            if r["list_type"] == "ongoing"]

    # ---------- group snapshots per project, sorted by month ----------
    # defaultdict(list): a normal dict, but projects[key] on a MISSING key
    #   auto-creates an empty list instead of raising KeyError. So we can
    #   just .append without checking "does this project exist yet?".
    # Result: {project_id: [snapshot_jul, snapshot_aug, ...]}
    projects = defaultdict(list)
    for r in rows:
        projects[stable_id(r)].append(r)
    # .items() lets us loop over (key, value) pairs; `pid, snaps` is tuple
    # unpacking (two loop variables for the two parts of the pair).++++++++++++++++++++++++++++++++++++++++++++
    for pid, snaps in projects.items():
        # .sort reorders the list IN PLACE. key=... says "compare items by
        # this function's result". A lambda is a tiny anonymous function
        # (like an arrow function in JS: r => r["month"]). Sorting the
        # string "2025-07" < "2025-08" < ... works because zero-padded
        # ISO-style strings sort chronologically.
        snaps.sort(key=lambda r: r["month"])
    # ---------- frequency encodings ----------
    # A model can't read text like "NHAI" directly. So we convert each
    # category to a NUMBER: how many rows mention it? This is a proxy for
    # size/track-record (an agency running 1,264 projects is a different
    # beast from one running 3).
    # defaultdict(int): missing keys auto-start at 0, so `+= 1` just works.
    agency_count = defaultdict(int)
    sector_count = defaultdict(int)
    ministry_count = defaultdict(int)

    for r in rows:
        # r["agency"] is the value in the "agency" column of this row.
        agency_count[r["agency"]] += 1   # same as: agency_count[x] = agency_count[x] + 1
        sector_count[r["sector"]] += 1
        ministry_count[r["ministry"]] += 1

    out_rows = []  # will collect every finished feature-row-dict
    # Outer loop: each project's timeline. Inner loop: each month in it.
    for pid, snaps in projects.items():
        # (len() = number of snapshots this project has; currently unused,
        #  kept for debugging)
        n = len(snaps)
        # enumerate(snaps) yields (index, item): i = 0,1,2..., r = the row.
        # We need `i` because the momentum/label logic below looks at
        # NEIGHBOURING snapshots (i-2 ... i+2) in the list.
        for i, r in enumerate(snaps):
            t = parse_month(r["month"])  # this row's month as absolute months
            if t is None:
                # `continue` = skip to the next loop iteration (like JS continue).
                # A row with an unparseable month can't support date math.
                continue

            # ---- static ----
            # Read this month's raw numbers ONCE, cleaned:
            # `f(x) or 0.0`  — the `or` idiom: if f(x) returns None (or 0.0,
            #   both falsy), use the right-hand default instead.
            o_cost = f(r["original_cost_cr"]) or 0.0          # original approved cost (₹cr)
            # revised cost this month; if missing, fall back to original
            # (an un-revised project's "current cost" IS its original cost)
            r_cost_t = f(r["revised_cost_cr"]) or o_cost
            exp_t = f(r["cumulative_expenditure_cr"]) or 0.0  # money spent so far (₹cr)
            prog_t = f(r["physical_progress_pct"])            # % built; may be None (unknown)
            # dates parsed to absolute months (or None if absent/unparseable)
            appr = parse_date(r["approval_date"])
            start = parse_date(r["start_date"])
            tdoc = parse_date(r["target_doc"])    # original (target) completion date
            rdoc = parse_date(r["revised_doc"])   # revised completion date (may not exist)

            # The `feat` dict IS the output row. Every key here becomes a
            # column in features.csv. A "ternary" is: A if CONDITION else B
            # (like `CONDITION ? A : B` in JS — Python spells it differently).
            feat = {
                # identifier + context columns (not features the model learns
                # from, but needed later for joining/scoring/reporting)
                "stable_id": pid,
                "month": r["month"],
                "project_name": r["project_name"][:80],  # truncate long names
                "ministry": r["ministry"],
                "sector": r["sector"],
                "agency": r["agency"][:60],
                "state": r["state"][:40],
                # CUF FIELD: original cost. Costs range from ₹150cr to ₹1,00,000+cr —
                # a tree model splits on thresholds, and raw rupees force it to
                # waste splits on scale. log1p(x) = ln(1+x) compresses the range
                # while preserving order (and handles 0 safely). Our size proxy.
                "log_original_cost": math.log1p(o_cost) if o_cost else None,
                # `in` = membership test (JS .includes). Some projects span
                # several states ("multi-state" or a comma-separated list).
                "multi_state": 1 if ("multi" in r["state"].lower() or "," in r["state"]) else 0,
                # the frequency encodings computed above
                "agency_freq": agency_count[r["agency"]],
                "sector_freq": sector_count[r["sector"]],
                "ministry_freq": ministry_count[r["ministry"]],
            }

            # ---- timeline ----
            # All four values are absolute months, so duration = subtraction.
            # `(a - b) if (a and b) else None` = only compute when BOTH dates
            # exist; otherwise the honest answer is None (unknown), not 0.
            # Sanctioned-but-never-started projects have a huge gap here — a
            # classic trouble sign.
            feat["approval_to_start_months"] = (start - appr) if (appr and start) else None
            # `//` = floor division (integer division, rounds DOWN).
            # 12 months = 1 year, so months // 12 = calendar year.
            feat["approval_year"] = appr // 12 if appr else None
            # Planned duration, with a fallback chain (nested ternary):
            #   prefer start->target duration, but if start is unknown use
            #   approval->target instead; if neither, None.
            feat["planned_duration_months"] = (tdoc - start) if (start and tdoc) else (
                (tdoc - appr) if (appr and tdoc) else None)
            # Project age at this snapshot (negative = officially not started yet).
            feat["age_at_t_months"] = (t - start) if start else None

            # ---- state at t ----
            # How far costs have already risen: (revised/original - 1) * 100 = %.
            # Guarded by `if o_cost` to avoid dividing by zero (None is falsy,
            # and o_cost 0.0 would crash too).
            feat["cost_overrun_so_far_pct"] = (r_cost_t / o_cost - 1) * 100 if o_cost else None
            # Has cost ALREADY been revised upward? The 1.001 factor is a
            # 0.1% tolerance so float rounding noise (2437.6300001) doesn't
            # count as a revision.
            feat["cost_already_revised"] = 1 if (o_cost and r_cost_t > o_cost * 1.001) else 0
            # Share of the (current) budget actually spent: 0.85 = 85% spent.
            feat["expenditure_vs_revised"] = exp_t / r_cost_t if r_cost_t else None
            feat["progress_pct"] = prog_t  # raw physical progress, pass-through
            # Expected progress if work were perfectly linear in time:
            #   elapsed months / planned months * 100, CLAMPED into [0, 100].
            #   max(0.0, min(100.0, x)) is the standard Python clamp pattern:
            #   min caps the top, max lifts the bottom.
            exp_progress = None
            if feat["planned_duration_months"] and start:
                elapsed = t - start
                exp_progress = max(0.0, min(100.0, 100.0 * elapsed / feat["planned_duration_months"]))
            # Signed gap: negative = behind schedule, positive = ahead.
            # Only computed when BOTH numbers exist — otherwise None.
            feat["progress_vs_expected"] = (prog_t - exp_progress) if (prog_t is not None and exp_progress is not None) else None
            # Months PAST the (original) deadline right now; 0 if not late yet.
            feat["time_overrun_months"] = (t - tdoc) if (tdoc and t > tdoc) else 0
            # Truthiness: an empty string means "never revised" -> 0.
            feat["deadline_revised_so_far"] = 1 if r["revised_doc"] else 0
            # Total months the deadline has been pushed across the project's
            # life. Unknown (no revised date) is treated as 0 push, because
            # "never revised" genuinely means zero delay of this type.
            if rdoc and tdoc:
                feat["total_doc_push_months"] = rdoc - tdoc
            else:
                feat["total_doc_push_months"] = 0
            # Months until the revised deadline (NEGATIVE = already overdue).
            # Unlike the line above, None here: without a revised date there is
            # no deadline to count down to — genuinely unknown.
            if rdoc:
                feat["months_to_revised_doc"] = rdoc - t
            else:
                feat["months_to_revised_doc"] = None
            # ₹cr spent per % built — catches "money is going in, bricks are
            # not coming out". Guard `prog_t > 1` avoids dividing by tiny
            # numbers (at 0.5% progress every project looks infinitely slow).
            feat["spend_vs_progress"] = (exp_t / prog_t) if (prog_t and prog_t > 1) else None
            # Same ratio NORMALIZED by project size (original cost per 1% of
            # work) so a ₹10,000cr highway and a ₹200cr road can be compared.
            feat["exp_per_pct"] = (exp_t / prog_t) / (o_cost / 100) if (prog_t and prog_t > 1 and o_cost) else None

            # ---- momentum (trailing, last up to 3 snapshots incl. t) ----
            # SLICING: snaps[max(0, i - 2): i + 1] takes a sublist.
            #   stop index is EXCLUSIVE (like JS slice), so for i=5 we get
            #   items 3, 4, 5 -> the current snapshot + up to 2 earlier ones.
            # max(0, ...) protects the first two months (i-2 would be
            # negative, and negative indexes mean "from the end" in Python —
            # not what we want).
            window = snaps[max(0, i - 2): i + 1]
            # Build parallel mini-series (one value per snapshot in window).
            # List comprehensions again: like window.map(s => f(s[...])).
            prog_series = [f(s["physical_progress_pct"]) for s in window]
            exp_series = [f(s["cumulative_expenditure_cr"]) for s in window]
            # revised cost if present, else fall back to original (`or` chain)
            cost_series = [f(s["revised_cost_cr"]) or f(s["original_cost_cr"]) for s in window]
            months_series = [parse_month(s["month"]) for s in window]

            # Time span covered by the window (months between first and last
            # snapshot). For a mid-history row: 2. For the first month(s) of
            # a project there's only one snapshot -> None -> rates undefined.
            span = (months_series[-1] - months_series[0]) if len(months_series) > 1 else None
            if span and span > 0:
                # index -1 = LAST element, index 0 = first (Python negative
                # indexing). So each rate = (newest - oldest) / months elapsed.
                # progress % gained per month
                feat["progress_rate_3m"] = (prog_series[-1] - prog_series[0]) / span
                # ₹cr spent per month
                feat["spend_rate_3m"] = (exp_series[-1] - exp_series[0]) / span
                # ₹cr of cost change over the window. `(x or 0)` converts a
                # None endpoint to 0 so the subtraction can't crash.
                feat["cost_change_3m"] = (cost_series[-1] or 0) - (cost_series[0] or 0)
            else:
                feat["progress_rate_3m"] = None
                feat["spend_rate_3m"] = None
                feat["cost_change_3m"] = None
            # stall: no progress movement across >= 2 consecutive snapshots.
            # abs() = absolute value. Threshold 0.5 percentage points because
            # reported progress only moves in 0.1-1% steps — anything smaller
            # is reporting jitter, not real work.
            if len(prog_series) >= 2 and prog_series[-1] is not None and prog_series[-2] is not None:
                feat["progress_stall"] = 1 if abs(prog_series[-1] - prog_series[-2]) < 0.5 else 0
            else:
                feat["progress_stall"] = None
            # recent deadline push (within window):
            # rdocs = list of revised-date STRINGS across the window.
            # `rdocs[-1]` (truthiness) ensures a revised date exists NOW, and
            # `(not rdocs[0] or rdocs[-1] != rdocs[0])` means: it was missing
            # at the window's start OR the date string CHANGED -> pushed recently.
            rdocs = [s["revised_doc"] for s in window]
            feat["doc_push_recent"] = 1 if (rdocs[-1] and (not rdocs[0] or rdocs[-1] != rdocs[0])) else 0

            # revisions count so far — walk ALL snapshots up to and including
            # now (snaps[: i + 1]; stop-exclusive again) and count upward cost
            # jumps > 0.1%. `seen_cost` remembers the previous snapshot's cost.
            revs = 0
            seen_cost = None
            for s in snaps[: i + 1]:
                c = f(s["revised_cost_cr"]) or f(s["original_cost_cr"])
                # count only real increases (same 1.001 tolerance as before)
                if seen_cost is not None and c is not None and c > seen_cost * 1.001:
                    revs += 1
                seen_cost = c
            feat["cost_revisions_so_far"] = revs

            # ---- LABELS: what happens strictly AFTER t (next 1-2 snapshots) ----
            # THE core idea: a row from month t is labeled by what ACTUALLY
            # happened in the next 1-2 snapshots. During training the future
            # already happened and got recorded — that's how the model later
            # "predicts the future". Features may only use data from <= t;
            # labels only from > t. Mixing them = leakage = fake accuracy.
            # snaps[i + 1: i + 3] = the next 1-2 snapshots (stop-exclusive).
            future = snaps[i + 1: i + 3]
            if future:
                # future costs (revised, falling back to original) and
                # future revised-deadline strings
                fut_cost = [f(s["revised_cost_cr"]) or f(s["original_cost_cr"]) for s in future]
                fut_rdoc = [s["revised_doc"] for s in future]
                y_cost = 0  # start assuming "no new escalation"
                # Only predict the TRANSITION into escalation: if cost has
                # already risen above original, the event already happened,
                # so the label stays 0 (not a NEW escalation in the future).
                if o_cost and r_cost_t <= o_cost * 1.001:
                    for fc in fut_cost:
                        # `break` = exit the loop early once triggered
                        # (like JS break) — one future month rising above
                        # original + 0.1% is enough.
                        if fc and fc > o_cost * 1.001:
                            y_cost = 1
                            break
                feat["y_cost_escalation"] = y_cost
                y_doc = 0
                # The project's CURRENT completion date: revised if it has
                # one, else the original target (`or` fallback again).
                cur_rdoc = r["revised_doc"] or r["target_doc"]
                for fd in fut_rdoc:
                    # any future snapshot showing a DIFFERENT date string
                    # = the deadline got pushed = label 1
                    if fd and fd != cur_rdoc:
                        y_doc = 1
                        break
                feat["y_deadline_slip"] = y_doc
                # combined "any bad thing happens" flag (OR of both)
                feat["y_high_risk"] = 1 if (y_cost or y_doc) else 0
                # how many future snapshots we actually had — train_model.py
                # uses this to keep only rows where the answer was knowable
                feat["n_future"] = len(future)
            else:
                # no future snapshots yet (latest month) -> label unknown, used at inference only
                # These rows are the ones explain_and_score.py later scores
                # for real: for CURRENT projects we have features but no
                # answer — exactly the deployment situation.
                feat["y_cost_escalation"] = None
                feat["y_deadline_slip"] = None
                feat["y_high_risk"] = None
                feat["n_future"] = 0

            out_rows.append(feat)  # .append = JS array.push

    # ---------- write features.csv ----------
    # Every feat dict has identical keys, so take the column order from the
    # first row. dict.keys() -> list of key names.
    fields = list(out_rows[0].keys())
    # `with open(...) as fh:` opens the file and GUARANTEES it gets closed
    # afterwards, even if an error happens inside the block.
    # newline="" is the csv-module's required setting on Windows (otherwise
    # you get blank rows between every data row).
    with open(OUT, "w", newline="", encoding="utf-8") as fh:
        # DictWriter maps dict -> CSV row using `fields` as column order
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()   # first line: the column names
        w.writerows(out_rows)  # then every row dict in order
    # f-strings: f"..." embeds {variables} directly in text (JS template literals)
    print(f"features written: {OUT}")
    print(f"rows: {len(out_rows)}  (labeled: {sum(1 for r in out_rows if r['y_high_risk'] is not None)})")

    # quick label stats
    # keep only rows that HAVE a label (y_high_risk is not None)
    lab = [r for r in out_rows if r['y_high_risk'] is not None]
    # sum(generator expression) adds 1.0-ish y values; / len(lab) * 100 = %;
    # `:.1f` formats the number to 1 decimal place (like toFixed(1) in JS)
    print(f"y_cost_escalation rate: {sum(r['y_cost_escalation'] for r in lab)/len(lab)*100:.1f}%")
    print(f"y_deadline_slip   rate: {sum(r['y_deadline_slip'] for r in lab)/len(lab)*100:.1f}%")


# When Python runs a file it sets the special name __name__ to "__main__":
# True here = "you ran this file directly (python src/build_features.py)"
# False = "this file was imported by another file" -> don't auto-run.
# So `python run_all.py` can safely import helpers from here without
# triggering a full feature build.
if __name__ == "__main__":
    main()
