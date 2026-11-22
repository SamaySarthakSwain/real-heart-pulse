import pymupdf

doc = pymupdf.open('main.pdf')
print(f"Total Pages: {len(doc)}")
for i, page in enumerate(doc):
    text = page.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    first_few = " | ".join(lines[:3]) if lines else "EMPTY PAGE"
    print(f"Page {i+1}: {len(lines)} lines, {len(text)} chars | Preview: {first_few[:80]}")
