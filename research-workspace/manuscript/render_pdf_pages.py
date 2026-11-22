import fitz # PyMuPDF
import sys
from pathlib import Path

pdf_path = Path('main.pdf')
if not pdf_path.exists():
    print(f"Error: {pdf_path} not found")
    sys.exit(1)

doc = fitz.open(pdf_path)
print(f"Total Pages: {len(doc)}")
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out_path = f"page_{i+1}.png"
    pix.save(out_path)
    print(f"  [✓] Saved {out_path} ({page.rect.width}x{page.rect.height} pt)")
print("Done!")
