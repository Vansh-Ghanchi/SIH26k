"""
Extract the 'All Ongoing Projects' (Table 6) from every monthly PAIMANA Flash Report PDF
into per-month CSVs, then merge into one panel dataset.

Output:
  data/monthly/paimana_YYYY_MM.csv   (one file per report)
  data/paimana_panel.csv             (all months stacked, with 'month' column)
"""
import os
import re
import csv
import pymupdf

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../ai_engine/extractor
# In SIH26k the source PDFs live under backend/extractor/flash_reports/all_months.
# Fall back to the waterdeep-style layout (BASE/flash_reports/all_months) if present,
# so this file also runs standalone in that repo unchanged.
_pdf_here = os.path.join(BASE, "flash_reports", "all_months")
_pdf_sih = os.path.join(BASE, "..", "..", "backend", "extractor", "flash_reports", "all_months")
PDF_DIR = _pdf_here if os.path.isdir(_pdf_here) else os.path.abspath(_pdf_sih)
OUT_DIR = os.path.join(BASE, "data", "monthly")
os.makedirs(OUT_DIR, exist_ok=True)

MONTH_NUM = {
    "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5, "JUNE": 6,
    "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12,
}

FIELDS = [
    "sl_no", "project_name", "agency", "project_code", "legacy_code",
    "ministry", "sector", "state",
    "approval_date", "start_date", "target_doc", "revised_doc", "actual_doc",
    "original_cost_cr", "revised_cost_cr", "cumulative_expenditure_cr",
    "physical_progress_pct", "list_type",
]


def parse_paren_field(block: str):
    """Split a cell like 'Project Name\\n(Agency)\\n(706724)\\n(N04000083)' into parts.
    Newer reports put two paren groups on one line, e.g. '(619184)\\n(-) (-)'."""
    if not block:
        return "", "", "", ""
    name, agency, code, legacy = "", "", "", ""
    rest = []
    for raw_ln in block.split("\n"):
        ln = raw_ln.strip()
        if not ln:
            continue
        double = re.match(r"^\(([^)]*)\)\s*\(([^)]*)\)$", ln)
        if double:
            g1, g2 = double.group(1).strip(), double.group(2).strip()
            if g1.isdigit():
                code, legacy = g1, g2
            elif g2.isdigit():
                code, legacy = g2, g1
            elif not legacy:
                legacy = g1
            continue
        m = re.match(r"^\((\d+)\)$", ln)
        if m and not code:
            code = m.group(1)
        elif re.match(r"^\([A-Z]{1,2}\d[A-Z0-9-]*\)$", ln) and not legacy:
            legacy = ln.strip("()")
        elif ln.startswith("(") and ln.endswith(")") and not agency:
            agency = ln.strip("()")
        else:
            rest.append(ln)
    name = " ".join(rest)
    return name, agency, code, legacy


def parse_date_pair(cell: str):
    """'12/2016\\n(03/2018)' -> ('12/2016', '03/2018)'; handles NA/- ."""
    if not cell:
        return "", ""
    lines = [ln.strip() for ln in cell.split("\n") if ln.strip()]
    first = lines[0] if lines else ""
    second = ""
    for ln in lines[1:]:
        if re.match(r"^\((.*)\)$", ln):
            second = ln.strip("()")
            break
    if first in ("NA", "-", "--"):
        first = ""
    if second in ("NA", "-", "--"):
        second = ""
    return first, second


def parse_cost_pair(cell: str):
    """'1712\\n(2520)' -> (1712.0, 2520.0)."""
    first, second = parse_date_pair(cell)  # same shape: value\n(value)

    def num(s):
        s = s.replace(",", "").strip()
        try:
            return float(s)
        except ValueError:
            return None

    return num(first) if first else None, num(second) if second else None


def normalize_table(tab):
    """Drop empty padding columns pymupdf sometimes adds at the edges."""
    data = tab.extract()
    keep = []
    for ci in range(tab.col_count):
        if any((row[ci] if ci < len(row) else None) not in (None, "") for row in data):
            keep.append(ci)
    if len(keep) == tab.col_count:
        return tab
    class _T:
        pass
    t = _T()
    t.col_count = len(keep)
    t.row_count = tab.row_count
    t.extract = lambda d=data, k=keep: [
        [(row[ci] if ci < len(row) else None) for ci in k] for row in d
    ]
    return t


def num1(s):
    if not s:
        return None
    s = str(s).replace(",", "").replace("%", "").strip()
    try:
        return float(s)
    except ValueError:
        return None


def extract_pdf(pdf_path: str):
    doc = pymupdf.open(pdf_path)
    # report month: first line like "MARCH 2026" or "MAY 2026" on cover / data pages
    month_label = None
    for i in range(min(5, len(doc))):
        t = doc[i].get_text()
        m = re.search(r"\b([A-Z]+)\s+(20\d\d)\b", t.upper())
        if m and m.group(1) in MONTH_NUM:
            month_label = f"{m.group(2)}-{MONTH_NUM[m.group(1)]:02d}"
            break
    if not month_label:
        raise RuntimeError(f"could not detect report month for {pdf_path}")

    rows = []
    current_ministry, current_sector = "", ""
    seen_data = False
    # --- pass 1: completed (Table 3, 7 cols) and newly added (Table 4, 6 cols) ---
    for pno in range(len(doc)):
        text = doc[pno].get_text()
        on_completed = "Completed Projects During Month" in text
        on_added = ("Newly Added Projects" in text or ("Added During Month" in text))
        if not (on_completed or on_added):
            continue
        tabs = doc[pno].find_tables()
        tabs.tables = [normalize_table(t) for t in tabs.tables]
        for tab in tabs.tables:
            if on_completed and tab.col_count == 7:
                for raw in tab.extract()[1:]:
                    raw = list(raw) + [None] * (7 - len(raw))
                    sl, nameblock, state, appr, docdates, costpair, expend = raw[:7]
                    if not (str(sl) if sl is not None else "").strip().isdigit():
                        continue
                    name, agency, code, legacy = parse_paren_field(nameblock)
                    a_date, s_date = parse_date_pair(appr)
                    # 'NA | (10/2021) | (08/2025)' -> actual, orig_doc, rev_doc
                    lines = [l.strip() for l in str(docdates or "").split("\n") if l.strip()]
                    actual = lines[0] if lines else ""
                    orig_doc = rev_doc = ""
                    for l in lines[1:]:
                        m = re.match(r"^\((.*)\)$", l)
                        if m:
                            if not orig_doc: orig_doc = m.group(1)
                            elif not rev_doc: rev_doc = m.group(1)
                    o_cost, r_cost = parse_cost_pair(costpair)
                    rows.append({
                        "month": month_label, "sl_no": int(str(sl).strip()),
                        "project_name": name, "agency": agency, "project_code": code,
                        "legacy_code": legacy, "ministry": current_ministry, "sector": current_sector,
                        "state": (state or "").replace("\n", ", ").strip(),
                        "approval_date": a_date, "start_date": s_date,
                        "target_doc": orig_doc, "revised_doc": rev_doc,
                        "actual_doc": actual,
                        "original_cost_cr": o_cost, "revised_cost_cr": r_cost,
                        "cumulative_expenditure_cr": num1(expend), "physical_progress_pct": None,
                        "list_type": "completed" if on_completed else "added",
                    })
            if on_added and tab.col_count == 6:
                for raw in tab.extract()[1:]:
                    raw = list(raw) + [None] * (6 - len(raw))
                    sl, nameblock, state, appr, docpair, costpair = raw[:6]
                    if not (str(sl) if sl is not None else "").strip().isdigit():
                        continue
                    name, agency, code, legacy = parse_paren_field(nameblock)
                    a_date, s_date = parse_date_pair(appr)
                    t_doc, r_doc = parse_date_pair(docpair)
                    o_cost, r_cost = parse_cost_pair(costpair)
                    rows.append({
                        "month": month_label, "sl_no": int(str(sl).strip()),
                        "project_name": name, "agency": agency, "project_code": code,
                        "legacy_code": legacy, "ministry": current_ministry, "sector": current_sector,
                        "state": (state or "").replace("\n", ", ").strip(),
                        "approval_date": a_date, "start_date": s_date,
                        "target_doc": t_doc, "revised_doc": r_doc,
                        "actual_doc": "",
                        "original_cost_cr": o_cost, "revised_cost_cr": r_cost,
                        "cumulative_expenditure_cr": None, "physical_progress_pct": None,
                        "list_type": "added",
                    })
    # --- pass 2: all ongoing (Table 6) ---
    for pno in range(len(doc)):
        text = doc[pno].get_text()
        if "All Ongoing Projects" not in text:
            continue
        # skip the TOC/title page (it has 'Table 6' and no data rows)
        tabs = doc[pno].find_tables()
        tabs.tables = [normalize_table(t) for t in tabs.tables]
        for tab in tabs.tables:
            if tab.col_count != 8:
                continue
            data = tab.extract()
            if not data:
                continue
            header = " ".join(str(c) for c in data[0] if c)
            if "Sl.No" not in header or "Project Name" not in header:
                continue
            for raw in data[1:]:
                # pad to 8
                raw = list(raw) + [None] * (8 - len(raw))
                sl, nameblock, state, appr, docpair, costpair, expend, progress = raw[:8]
                sl = (str(sl) if sl is not None else "").strip()
                if sl and re.match(r"^\d+$", sl):
                    seen_data = True
                    name, agency, code, legacy = parse_paren_field(nameblock)
                    a_date, s_date = parse_date_pair(appr)
                    t_doc, r_doc = parse_date_pair(docpair)
                    orig, rev = parse_cost_pair(costpair)
                    rows.append({
                        "month": month_label,
                        "sl_no": int(sl),
                        "project_name": name,
                        "agency": agency,
                        "project_code": code,
                        "legacy_code": legacy,
                        "ministry": current_ministry,
                        "sector": current_sector,
                        "state": (state or "").replace("\n", ", ").strip(),
                        "approval_date": a_date,
                        "start_date": s_date,
                        "target_doc": t_doc,
                        "revised_doc": r_doc,
                        "original_cost_cr": orig,
                        "revised_cost_cr": rev,
                        "cumulative_expenditure_cr": num1(expend),
                        "physical_progress_pct": num1(progress),
                        "actual_doc": "",
                        "list_type": "ongoing",
                    })
                else:
                    # context rows: ministry/department name or sector name.
                    # In the All Ongoing Projects table the first col holds the
                    # ministry/department header (e.g. 'Ministry of Civil Aviation',
                    # 'Department of Telecommunications'), and the project-name
                    # cell holds the sector header (e.g. 'Aviation & Aviation
                    # Infrastructure', 'Telecommunication').
                    first = " ".join((str(sl) if sl is not None else "").split())
                    second = " ".join((str(nameblock) if nameblock is not None else "").split())
                    txt = first or second
                    if txt and not txt.isdigit():
                        if any(k in txt for k in ("Ministry", "Department", "Commission", "NITI", "Administration", "Affairs")):
                            current_ministry = txt
                        else:
                            current_sector = txt
    doc.close()
    return month_label, rows


def main():
    pdfs = sorted(f for f in os.listdir(PDF_DIR) if f.lower().endswith(".pdf"))
    all_rows = []
    for f in pdfs:
        path = os.path.join(PDF_DIR, f)
        try:
            label, rows = extract_pdf(path)
        except Exception as e:
            print(f"FAIL {f}: {e}")
            continue
        out_csv = os.path.join(OUT_DIR, f"paimana_{label}.csv")
        with open(out_csv, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=["month"] + FIELDS)
            w.writeheader()
            w.writerows(rows)
        print(f"{f:35s} -> {label}  ({len(rows):5d} projects)")
        all_rows.extend(rows)

    panel = os.path.join(BASE, "data", "paimana_panel.csv")
    with open(panel, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["month"] + FIELDS)
        w.writeheader()
        w.writerows(all_rows)
    print(f"\nPANEL: {panel}  ({len(all_rows)} project-months)")

    # build_features.py reads paimana_panel_v4.csv. The v4 file is the v3 panel
    # plus 'completed' and 'added' snapshots (see waterdeep docs). Here we cannot
    # re-derive those flags from PDFs alone, so we only copy when v4 is absent,
    # to avoid silently overwriting the corrected panel with a partial one.
    v4 = os.path.join(BASE, "data", "paimana_panel_v4.csv")
    if not os.path.exists(v4):
        import shutil
        shutil.copyfile(panel, v4)
        print(f"copied -> {v4}  (seed copy; regenerate v4 flags if needed)")
    else:
        print(f"kept existing {v4} (not overwritten by the raw panel)")


if __name__ == "__main__":
    main()
