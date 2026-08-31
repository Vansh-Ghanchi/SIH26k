#execute this script to run the extractor pipeline (PDFs then panel then features then models)
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))          # .../ai_engine/extractor whtever shits
SRC = os.path.join(HERE, "src")
ENGINE = os.path.dirname(HERE)                             # .../ai_engine
PANEL = os.path.join(HERE, "data", "paimana_panel_v4.csv")
FEATURES = os.path.join(HERE, "data", "features.csv")
TRAIN = os.path.join(ENGINE, "src", "train.py")


def run(step, desc):
    print(f"\n{'=' * 64}\n>>> {step}: {desc}\n{'=' * 64}")
    r = subprocess.run([sys.executable, os.path.join(SRC, f"{step}.py")], cwd=HERE)
    if r.returncode != 0:
        print(f"!! {step} FAILED (exit {r.returncode})")
        sys.exit(1)


def main():
    
    force = "--force" in sys.argv
    steps = []
    if force or not os.path.exists(PANEL):
        steps.append(("extract_flash_reports", "PDFs -> monthly CSVs + panel"))
    else:
        print(f"panel exists ({PANEL}), skipping extraction (--force to redo)")
    steps.append(("build_features", "panel -> features.csv"))

    for step, desc in steps:
        run(step, desc)

    # #features - engine retrain (writes into ai_engine/models)
    print(f"\n{'=' * 64}\n>>> train: features -> models (time-aware split)\n{'=' * 64}")
    r = subprocess.run([sys.executable, TRAIN, "--features", FEATURES], cwd=ENGINE)
    if r.returncode != 0:
        print(f"!! train FAILED (exit {r.returncode})")
        sys.exit(1)
    print("\nDone. Models: ai_engine/models/  |  features: ai_engine/extractor/data/features.csv")


if __name__ == "__main__":
    main()
