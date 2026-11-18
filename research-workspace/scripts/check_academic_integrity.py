#!/usr/bin/env python3
"""
check_academic_integrity.py
Academic Integrity, Tone Normalization, and AI Cliché Linter for Ear to Heart Manuscript.
Ensures objective, empirical scientific prose without synthetic clichés or unsupported claims.
"""

import os
import re
import sys
from pathlib import Path

# AI Clichés & Inflated Marketing Buzzwords to flag
INFLATED_BUZZWORDS = [
    "delve", "testament", "tapestry", "game-changer", "groundbreaking",
    "revolutionary", "paradigm shift", "panacea", "unparalleled", "beacon",
    "marvel", "nexus", "linchpin", "undoubtedly", "flawless", "magic bullet"
]

# Weak or imprecise hedge phrases
WEAK_HEDGES = [
    "it is interesting to note", "needless to say", "clearly evident",
    "speaks for itself", "obviously", "as everyone knows"
]

def audit_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    lines = text.split('\n')
    word_count = len(re.findall(r'\b\w+\b', text))
    
    findings = []
    
    # Check for inflated buzzwords
    for word in INFLATED_BUZZWORDS:
        matches = list(re.finditer(rf'\b{re.escape(word)}\b', text, re.IGNORECASE))
        if matches:
            findings.append({
                'type': 'INFLATED_BUZZWORD',
                'term': word,
                'count': len(matches),
                'advice': f"Replace '{word}' with objective, measured scientific terminology."
            })

    # Check for weak hedges
    for hedge in WEAK_HEDGES:
        matches = list(re.finditer(rf'\b{re.escape(hedge)}\b', text, re.IGNORECASE))
        if matches:
            findings.append({
                'type': 'WEAK_HEDGE',
                'term': hedge,
                'count': len(matches),
                'advice': f"Remove conversational filler phrase '{hedge}'."
            })

    # Check citation format: ensure citations use [AuthorYear] or standard bracketed numbers
    citations = re.findall(r'\[[A-Z][a-zA-Z]+[0-9]{4}\]|\[[0-9]+\]', text)
    
    return {
        'file': file_path.name,
        'word_count': word_count,
        'citation_count': len(citations),
        'findings': findings
    }

def main():
    base_dir = Path(__file__).resolve().parent.parent
    reports_dir = base_dir / 'reports'
    
    report_files = list(reports_dir.glob('*.md'))
    print(f"[*] Auditing academic integrity across {len(report_files)} foundation reports...")
    
    total_findings = 0
    for rf in sorted(report_files):
        res = audit_file(rf)
        status = "PASSED" if not res['findings'] else f"WARNINGS ({len(res['findings'])})"
        print(f"\n[REPORT] {res['file']} | Words: {res['word_count']} | Citations: {res['citation_count']} | Status: {status}")
        for find in res['findings']:
            total_findings += 1
            print(f"    - [{find['type']}] '{find['term']}' (x{find['count']}): {find['advice']}")

    print("\n" + "=" * 80)
    print(f"[*] Academic Integrity Audit Complete. Total Files: {len(report_files)}, Issues Flagged: {total_findings}")
    print("=" * 80)

if __name__ == '__main__':
    main()
