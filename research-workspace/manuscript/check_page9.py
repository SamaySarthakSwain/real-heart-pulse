import pymupdf

doc = pymupdf.open('main.pdf')
print("=== PAGE 9 TEXT ===")
print(doc[8].get_text())
