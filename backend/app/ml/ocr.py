"""
Receipt Scanner (OCR)
-----------------------
Extracts store name, total amount, and date from an uploaded receipt
image using Tesseract OCR (via pytesseract). Falls back gracefully with
a clear error message if Tesseract isn't installed on the host machine,
since it's a native binary (not just a pip package).

Install Tesseract:
  - macOS:   brew install tesseract
  - Ubuntu:  sudo apt-get install tesseract-ocr
  - Windows: https://github.com/UB-Mannheim/tesseract/wiki

Swap-in options (see README):
  - EasyOCR — no native binary needed, but heavier (downloads a deep
    model on first run); better accuracy on messy/rotated receipts.
  - Google Cloud Vision API — best accuracy, requires a paid API key.
"""
from __future__ import annotations

import re
from datetime import date, datetime
from typing import Optional

try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:  # pragma: no cover
    OCR_AVAILABLE = False

from app.config import settings

if OCR_AVAILABLE and settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

_AMOUNT_RE = re.compile(r"(?:total|amount due|grand total)[^\d]{0,10}([\d,]+\.\d{2})", re.IGNORECASE)
_FALLBACK_AMOUNT_RE = re.compile(r"\$?\s?(\d+\.\d{2})")
_DATE_PATTERNS = [
    r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
    r"(\d{4}-\d{2}-\d{2})",
]


def extract_receipt_data(image_path: str) -> dict:
    """
    Returns: {"store_name": str|None, "amount": float|None,
              "date": date|None, "raw_text": str}
    """
    if not OCR_AVAILABLE:
        return {
            "store_name": None,
            "amount": None,
            "date": None,
            "raw_text": "",
            "error": "OCR dependencies not installed. Run: pip install pytesseract pillow "
                     "and install the Tesseract binary (see app/ml/ocr.py docstring).",
        }

    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
    except Exception as e:  # e.g. tesseract binary missing
        return {"store_name": None, "amount": None, "date": None, "raw_text": "", "error": str(e)}

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    store_name = lines[0] if lines else None

    amount = None
    m = _AMOUNT_RE.search(text)
    if m:
        amount = float(m.group(1).replace(",", ""))
    else:
        candidates = [float(x) for x in _FALLBACK_AMOUNT_RE.findall(text)]
        if candidates:
            amount = max(candidates)  # biggest number on a receipt is usually the total

    parsed_date: Optional[date] = None
    for pattern in _DATE_PATTERNS:
        m = re.search(pattern, text)
        if m:
            raw = m.group(1)
            for fmt in ("%m/%d/%Y", "%m/%d/%y", "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
                try:
                    parsed_date = datetime.strptime(raw, fmt).date()
                    break
                except ValueError:
                    continue
            if parsed_date:
                break

    return {
        "store_name": store_name,
        "amount": amount,
        "date": parsed_date,
        "raw_text": text,
    }
