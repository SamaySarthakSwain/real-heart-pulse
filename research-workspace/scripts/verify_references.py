#!/usr/bin/env python3
"""
verify_references.py
Reference Integrity & Multi-Registry DOI Validator for Ear to Heart Research Workspace
Resolves DOIs via Crossref, DataCite, and doi.org HTTP content negotiation.
"""

import os
import re
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

def parse_bib_entries(bib_path):
    with open(bib_path, 'r', encoding='utf-8') as f:
        content = f.read()

    entries = []
    pattern = r'@(\w+)\s*\{\s*([^,]+),([^@]*)\}'
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        entry_type = match.group(1).lower()
        key = match.group(2).strip()
        body = match.group(3)
        
        fields = {}
        field_matches = re.finditer(r'(\w+)\s*=\s*[\{"]([^"\}]+)[\}"]', body)
        for fm in field_matches:
            fields[fm.group(1).lower()] = fm.group(2).strip()
        
        entries.append({
            'type': entry_type,
            'key': key,
            'fields': fields
        })
    return entries

def verify_doi(doi):
    clean_doi = doi.strip()
    if clean_doi.startswith('http'):
        clean_doi = clean_doi.split('doi.org/')[-1]
    if clean_doi.startswith('doi:'):
        clean_doi = clean_doi[4:]
        
    # Method 1: Crossref REST API
    crossref_url = f"https://api.crossref.org/works/{clean_doi}"
    headers = {'User-Agent': 'EarToHeartResearchValidator/1.0 (mailto:samaysarthakswain@gmail.com)'}
    req = urllib.request.Request(crossref_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                message = data.get('message', {})
                title = message.get('title', [''])[0] if message.get('title') else 'Verified via Crossref'
                return {'status': 'VERIFIED_CROSSREF', 'title': title, 'doi': clean_doi}
    except Exception:
        pass

    # Method 2: DataCite API (for arXiv and research repositories)
    datacite_url = f"https://api.datacite.org/dois/{clean_doi}"
    req_dc = urllib.request.Request(datacite_url, headers=headers)
    try:
        with urllib.request.urlopen(req_dc, timeout=8) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                attributes = data.get('data', {}).get('attributes', {})
                title = attributes.get('titles', [{}])[0].get('title', 'Verified via DataCite')
                return {'status': 'VERIFIED_DATACITE', 'title': title, 'doi': clean_doi}
    except Exception:
        pass

    # Method 3: DOI Content Negotiation via dx.doi.org
    doi_resolver_url = f"https://doi.org/{clean_doi}"
    req_res = urllib.request.Request(doi_resolver_url, headers={'Accept': 'application/vnd.citationstyles.csl+json', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req_res, timeout=8) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                title = data.get('title', 'Verified via DOI content negotiation')
                return {'status': 'VERIFIED_DOI_ORG', 'title': title, 'doi': clean_doi}
    except Exception:
        pass

    return {'status': 'UNRESOLVED', 'doi': clean_doi}

def main():
    base_dir = Path(__file__).resolve().parent.parent
    bib_path = base_dir / 'literature' / 'references.bib'
    log_dir = base_dir / 'integrity'
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / 'doi_crossref_audit.log'

    print(f"[*] Auditing references from: {bib_path}")
    if not bib_path.exists():
        print(f"[!] Error: {bib_path} not found.")
        sys.exit(1)

    entries = parse_bib_entries(bib_path)
    print(f"[*] Found {len(entries)} bibliographic entries.")
    
    log_lines = []
    log_lines.append("=" * 80)
    log_lines.append("EAR TO HEART - MULTI-REGISTRY BIBLIOGRAPHIC INTEGRITY AUDIT")
    log_lines.append("=" * 80)

    verified_count = 0
    for entry in entries:
        key = entry['key']
        doi = entry['fields'].get('doi')
        title = entry['fields'].get('title', 'Unknown Title')
        
        print(f"\n[-] Validating [{key}]...")
        if not doi:
            res_str = f"[WARNING] No DOI specified for [{key}] - '{title}'"
            print(res_str)
            log_lines.append(res_str)
            continue
            
        result = verify_doi(doi)
        if result['status'].startswith('VERIFIED'):
            verified_count += 1
            res_str = f"[{result['status']}] [{key}] DOI: {doi} -> {result['title'][:70]}..."
            print(f"    -> {res_str}")
            log_lines.append(res_str)
        else:
            res_str = f"[DISCREPANCY] [{key}] DOI: {doi} returned: {result['status']}"
            print(f"    -> {res_str}")
            log_lines.append(res_str)

    log_lines.append("\n" + "=" * 80)
    summary_str = f"Audit Completed. Total: {len(entries)}, Formally Verified: {verified_count}/{len(entries)}"
    log_lines.append(summary_str)
    print(f"\n[*] {summary_str}")

    with open(log_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(log_lines))
    print(f"[*] Integrity log saved to: {log_path}")

if __name__ == '__main__':
    main()
