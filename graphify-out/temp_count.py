import json
from pathlib import Path
from collections import Counter

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
scan_root = Path(detect['scan_root'])

counts = Counter()
for cat in ['code', 'document', 'paper', 'image', 'video']:
    for f in detect.get('files', {}).get(cat, []):
        p = Path(f)
        try:
            rel = p.relative_to(scan_root)
            if str(rel).startswith('graphify-out'): continue
            first = rel.parts[0] if len(rel.parts) > 1 else '(root)'
            counts[first] += 1
        except ValueError:
            pass

print("Top 5 subdirectories by file count:")
for d, c in counts.most_common(5):
    print(f"  {d}: {c} files")
