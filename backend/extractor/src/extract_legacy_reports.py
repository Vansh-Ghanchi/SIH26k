
##Legacy OCMS-era MoSPI report extractor 

# MoSPI changed report format in July 2025. Everything before that used the OCMS
# layout below, which has 9 columns in a different order -- so the 8-column check in
# extract_flash_reports.py never matches and that script returns 0 rows for these PDFs.


import os
import re
import csv
from collections import Counter

import pymupdf

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MONTHS = {m: i + 1 for i, m in enumerate(
    ["JAN", "JANUARY", "FEB", "FEBRUARY", "MAR", "MARCH", "APR", "APRIL",
     "MAY", "JUN", "JUNE", "JUL", "JULY", "AUG", "AUGUST", "SEP", "SEPTEMBER",
     "OCT", "OCTOBER", "NOV", "NOVEMBER", "DEC", "DECEMBER"])}



FIELDS = ["month", "list_type", "sl_no", "project_name", "agency", "project_code",
          "ministry", "sector", "state", "approval_date", "start_date",
          "target_doc", "revised_doc", "original_cost_cr", "revised_cost_cr",
          "cumulative_expenditure_cr", "physical_progress_pct"]
# Layout (9 columns):
#   State | Sector | Sl No | Project Name (Agency) (Project Code) | Date of Approval |
#   Date of Commissioning Original (Revised) {Anticipated} |
#   Cost Original (Revised) {Anticipated} | Cumulative Expenditure | Physical Progress




##
##Handles:
##   dates like '8-2020', '08-2020', 'Aug-2024', 'N.A.'
  ##costs like '311.00\n(N.A.)\n{273.78} and blah'  -..>> original, revised, anticipated
  ##- Tables 3/4/5 (Completed / Added / Frozen) captured as separate outcome files
  ##- Table 7 (Ongoing as of ...) -> merged into panel format

def norm_date(s):
    """'8-2020' -> '08/2020'; 'Aug-2024' -> '08/2024'; 'N.A.'/'N.A'/'-' -> ''."""
    s = (s or "").strip()
    if not s or s.upper().startswith("N.A") or s in ("-", "--"):
        return ""
    m = re.match(r"^([A-Za-z]{3,})[-/ ](\d{4})$", s)
    if m:
        key = m.group(1).upper()
        for name, num in MONTHS.items():
            if key.startswith(name) or name.startswith(key):
                return f"{num:02d}/{m.group(2)}"
        return ""
    m = re.match(r"^(\d{1,2})[-/ ](\d{4})$", s)
    if m:
        return f"{int(m.group(1)):02d}/{m.group(2)}"
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", s)
    if m:  # day/month/year -> keep month/year only
        return f"{int(m.group(2)):02d}/{m.group(3)}"
    return s


def num(s):
    if s is None:
        return None
    s = str(s).replace(",", "").replace("N.A", "").replace("N.A.", "").strip()
    try:
        return float(s)
    except ValueError:
        return None


def parse_name_block(cell):
    """'NAME\\n(Agency)\\n(706724)' or 'NAME\\n(Agency )\\n(N24001261 )' -> parts."""
    if not cell:
        return "", "", ""
    name, agency, code = "", "", ""
    rest = []
    for ln in cell.split("\n"):
        ln = ln.strip()
        if not ln:
            continue
        m = re.match(r"^\((?=[A-Z]*\d)([A-Z0-9]+)\s*\)$", ln)  # code contains a digit: '(706724)', '(N24001261 )'
        if m and not code:
            code = m.group(1)
        elif ln.startswith("(") and ln.endswith(")") and not agency:
            agency = ln.strip("()").strip()
        else:
            rest.append(ln)
    return " ".join(rest), agency, code


def parse_triple(cell):
    """'311.00\\n(N.A.)\\n{273.78}' -> (311.0, None, 273.78)"""
    if not cell:
        return None, None, None
    orig = rev = antic = None
    m = re.search(r"^\s*([\d,.]+)", cell)
    if m:
        orig = num(m.group(1))
    m = re.search(r"\(([^)]*)\)", cell)
    if m:
        rev = num(m.group(1))
    m = re.search(r"\{([^}]*)\}", cell)
    if m:
        antic = num(m.group(1))
    return orig, rev, antic


def parse_doc_pair(cell):
    """'4/2023\\n(N.A.)\\n{10/2025}' -> (approved_date_str, orig_doc, rev_doc)"""
    if not cell:
        return "", "", ""
    lines = [l for l in cell.split("\n") if l.strip()]
    if not lines:
        return "", "", ""
    first = norm_date(lines[0].strip())
    orig = rev = ""
    m = re.search(r"\(([^)]*)\)", cell)
    if m:
        orig = norm_date(m.group(1))
    m = re.search(r"\{([^}]*)\}", cell)
    if m:
        rev = norm_date(m.group(1))
    if not orig and rev:
        orig, rev = rev, ""
    return first, orig, rev


def extract_doc(path, month_label):
    doc = pymupdf.open(path)
    rows = []
    state = sector = ""
    for pno in range(len(doc)):
        txt = doc[pno].get_text()
        if "Table:-" not in txt and "Project List" not in txt:
            continue
        tabs = doc[pno].find_tables()
        for tab in tabs.tables:
            if tab.col_count == 6 and ("Completed during" in txt or "Added during" in txt or "Frozen" in txt):
                # 6-col layout: Sector | Sl.No | Name(Agency)(Code) | Orig Cost | Doc dates | Expenditure
                data = tab.extract()
                if not data:
                    continue
                sector6 = ""
                for raw in data:
                    raw = list(raw) + [None] * (6 - len(raw))
                    sec_c, sl_c, name_c, cost_c, dates_c, exp_c = raw[:6]
                    sec_txt = " ".join((sec_c or "").split())
                    if sec_txt and not sec_txt.isdigit():
                        sector6 = sec_txt
                    sl = (str(sl_c) if sl_c is not None else "").strip()
                    if not re.match(r"^\d+$", sl) or not name_c:
                        continue
                    if "Completed during" in txt:
                        lt = "completed"
                    elif "Added during" in txt:
                        lt = "added"
                    else:
                        lt = "frozen"
                    name, agency, code = parse_name_block(name_c)
                    rows.append({
                        "month": month_label, "list_type": lt, "sl_no": int(sl),
                        "project_name": name, "agency": agency, "project_code": code,
                        "ministry": "", "sector": sector6,
                        "state": "",
                        "approval_date": "", "start_date": "",
                        "target_doc": norm_date(str(dates_c or "").split("\n")[0]),
                        "revised_doc": "",
                        "original_cost_cr": num(cost_c),
                        "revised_cost_cr": None,
                        "cumulative_expenditure_cr": num(exp_c),
                        "physical_progress_pct": None,
                    })
                continue
            if tab.col_count != 9:
                continue
            data = tab.extract()
            if not data:
                continue
            for raw in data:
                raw = list(raw) + [None] * (9 - len(raw))
                state_c, sector_c, sl_c, name_c, appr_c, doc_c, cost_c, exp_c, prog_c = raw[:9]
                # rolling context (old format has State/Sector as separate cols)
                s_txt = " ".join((state_c or "").split())
                sec_txt = " ".join((sector_c or "").split())
                if s_txt:
                    state = s_txt
                if sec_txt and sec_txt.lower() != "state" and not sec_txt.isdigit():
                    sector = sec_txt
                sl = (str(sl_c) if sl_c is not None else "").strip()
                if not re.match(r"^\d+$", sl) or not name_c:
                    continue
                # detect list type from page text
                if "Completed during" in txt:
                    list_type = "completed"
                elif "Added during" in txt:
                    list_type = "added"
                elif "Frozen" in txt or "Deleted" in txt:
                    list_type = "frozen"
                else:
                    list_type = "ongoing"
                name, agency, code = parse_name_block(name_c)
                appr, orig_doc, rev_doc = parse_doc_pair(appr_c)
                commissioning, orig_doc2, rev_doc2 = parse_doc_pair(doc_c)
                o_cost, r_cost, a_cost = parse_triple(cost_c)
                if not r_cost and a_cost:
                    r_cost = a_cost
                if orig_doc2:
                    orig_doc = orig_doc2
                if rev_doc2:
                    rev_doc = rev_doc2
                rows.append({
                    "month": month_label, "list_type": list_type, "sl_no": int(sl),
                    "project_name": name, "agency": agency, "project_code": code,
                    "ministry": "", "sector": sector,
                    "state": " ".join((state_c or state).split()),
                    "approval_date": appr, "start_date": commissioning,
                    "target_doc": orig_doc, "revised_doc": rev_doc,
                    "original_cost_cr": o_cost, "revised_cost_cr": r_cost,
                    "cumulative_expenditure_cr": num(exp_c),
                    "physical_progress_pct": num(prog_c),
                })
    doc.close()
    return rows


def main():
    # (path components relative to BASE, month label). Path parts are kept as tuples
    # rather than a literal string so this runs on Windows and Linux alike.
    #
    # The Q1 2025-26 quarterly PDF is NOT committed to this repo -- that job will
    # print "missing:" and be skipped, which is expected. To include pre-July-2025
    # history, download QPISR_QR_1st_2025-26.pdf from MoSPI and drop it into
    # flash_reports/quarterly/.
    jobs = [
        (("flash_reports", "all_months", "FR_JUNE_2025.pdf"), "2025-06"),
        (("flash_reports", "quarterly", "QPISR_QR_1st_2025-26.pdf"), "2025-06-Q"),
    ]
    outdir = os.path.join(BASE, "data", "legacy")
    os.makedirs(outdir, exist_ok=True)
    all_rows = []
    for parts, label in jobs:
        rel = os.path.join(*parts)
        path = os.path.join(BASE, *parts)
        if not os.path.exists(path):
            print(f"missing (skipped): {rel}")
            continue
        rows = extract_doc(path, label)
        out = os.path.join(outdir, f"legacy_{label}.csv")
        with open(out, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=FIELDS)
            w.writeheader()
            w.writerows(rows)
        print(f"{rel}  -> {label}: {len(rows)} rows  {dict(Counter(r['list_type'] for r in rows))}")
        all_rows.extend(rows)
    comb = os.path.join(outdir, "legacy_all.csv")
    with open(comb, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(all_rows)
    print("combined:", comb, len(all_rows), "rows")


if __name__ == "__main__":
    main()
