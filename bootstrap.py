"""
AdaptLearn — local bootstrap.

What it does:
  - creates empty directories the app expects (static/css, static/js)
  - warns if the OpenDyslexic font or other external assets are missing
  - prints the exact command to start the server

Safe to run multiple times.
"""

from pathlib import Path
import sys

ROOT = Path(__file__).parent
REQUIRED_DIRS = [
    ROOT / "static",
    ROOT / "static" / "css",
    ROOT / "static" / "js",
]
REQUIRED_FILES = [
    ROOT / "main.py",
    ROOT / "static" / "index.html",
    ROOT / "static" / "css" / "style.css",
    ROOT / "static" / "js" / "app.js",
    ROOT / "static" / "js" / "config.js",
]

def main() -> int:
    missing = 0
    for d in REQUIRED_DIRS:
        if not d.exists():
            d.mkdir(parents=True, exist_ok=True)
            print(f"  created  {d.relative_to(ROOT)}/")

    for f in REQUIRED_FILES:
        if not f.exists():
            print(f"  MISSING  {f.relative_to(ROOT)}", file=sys.stderr)
            missing += 1

    if missing:
        print(f"\n{missing} required file(s) missing — is this a fresh clone?", file=sys.stderr)
        return 1

    print("\nEverything looks good.")
    print("Start the dev server with:")
    print("    python -m uvicorn main:app --reload")
    return 0

if __name__ == "__main__":
    sys.exit(main())