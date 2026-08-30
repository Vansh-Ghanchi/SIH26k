import os
import csv
import re

from collections import defaultdict
#input and output selection
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PANEL = os.path.join(BASE, "data", "paimana_panel_v4.csv")
OUT = os.path.join(BASE, "data", "features.csv")
#printing months with number for reference ofc , not used as such tho
MONTH_NUM = {m: i + 1 for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July",
     "August", "September", "October", "November", "December"])}

# def parse_month(s):
#     ## 2026-03' to (2026, 3) as 
#     # absolute months int.

def parse_month(s):
    try:
        y, m = s.split("-")
        return int(y) * 12 + int(m)
    except Exception:
        # we are near perfection cant offer failure, minthara
        return None


def parse_date(s):
    if not s:
        return None
    s = s.strip()
    m = re.match(r"^(\d{2})/(\d{4})$", s)
    if not m:
        return None
    m = re.match(r"^(\d{2})/(\d{4})$", s)
    if not m:
        return None
    # m.group(1) = "03" adn m.group(2) = "2018"  ->  2018*12 + 3  (absolute months)
    return int(m.group(2)) * 12 + int(m.group(1))

    