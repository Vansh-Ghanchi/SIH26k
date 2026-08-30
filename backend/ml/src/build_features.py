import os
import csv
import re

from collections import defaultdict
#input and output selection
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PANEL = os.path.join(BASE, "data", "paimana_panel_v4.csv")
OUT = os.path.join(BASE, "data", "features.csv")

