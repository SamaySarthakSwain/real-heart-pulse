import os
import sys
import re
import docx
import numpy as np

def audit_docx(docx_path):
    if not os.path.exists(docx_path):
        print(f"[!] File not found: {docx_path}")
        return None
        
    doc = docx.Document(docx_path)
    full_text = []
    paragraphs = []
    
    for p in doc.paragraphs:
        t = p.text.strip()
        if t:
            full_text.append(t)
            paragraphs.append(t)
            
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                ct = cell.text.strip()
                if ct and ct not in full_text:
                    full_text.append(ct)
                    
    combined_text = "\n".join(full_text)
    words = re.findall(r'\b[A-Za-z0-9\'-]+\b', combined_text)
    total_words = len(words)
    
    # Sentence tokenization
    raw_sentences = re.split(r'(?<=[.!?])\s+', combined_text)
    sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 5 and not s.strip().startswith('Fig.') and not s.strip().startswith('TABLE')]
    total_sentences = len(sentences)
    
    # 1. Em dashes
    em_dashes = len(re.findall(r'—', combined_text))
    double_hyphens = len(re.findall(r'\s--\s', combined_text))
    total_em_dashes = em_dashes + double_hyphens
    
    # 2. Banned AI Vocabulary (Wikipedia WP:AISIGNS)
    banned_vocab = [
        'tapestry', 'testament', 'beacon', 'realm', 'landscape', 'paradigm', 
        'cornerstone', 'crucible', 'linchpin', 'watershed', 'delve', 'delving', 
        'delves', 'delved', 'underscore', 'underscoring', 'underscores', 'underscored', 
        'foster', 'fostering', 'fosters', 'fostered', 'encapsulate', 'encapsulating', 
        'encapsulates', 'navigate', 'navigating', 'navigates', 'harness', 'harnessing', 
        'harnesses', 'demystify', 'showcase', 'showcasing', 'showcases', 'mirror', 
        'illuminate', 'illuminating', 'pivotal', 'crucial', 'intricate', 'groundbreaking', 
        'transformative', 'seamless', 'seamlessly', 'paramount', 'profound', 'vibrant', 
        'nestled', 'unprecedented', 'bespoke', 'tailor-made', 'crucially', 'importantly', 
        'notably', 'furthermore', 'moreover', 'additionally', 'in summary', 'undeniably'
    ]
    
    found_banned = {}
    lower_text = combined_text.lower()
    for w in banned_vocab:
        matches = len(re.findall(rf'\b{w}\b', lower_text))
        if matches > 0:
            found_banned[w] = matches
            
    total_banned_count = sum(found_banned.values())
    
    # 3. Participle tails (, highlighting / , underscoring / , paving the way...)
    participle_tails = re.findall(r',\s*(?:highlighting|underscoring|paving the way|showcasing|demonstrating|reflecting|fostering|ensuring)\b', lower_text)
    
    # 4. Negative parallelism (not only... but also... / not merely... but...)
    neg_parallelism = re.findall(r'\bnot\s+(?:only|just|merely|simply)\b.*?\bbut\s+(?:also)?\b', lower_text)
    
    # 5. Syntactic burstiness (sentence length std dev)
    sent_lengths = [len(re.findall(r'\b\w+\b', s)) for s in sentences]
    mean_length = float(np.mean(sent_lengths)) if sent_lengths else 0.0
    std_length = float(np.std(sent_lengths)) if sent_lengths else 0.0
    
    # AI Marker Density Score (Estimated AI Probability Index)
    # Scaled by density of hallmark patterns per 1,000 words
    pattern_density = ((total_banned_count * 3.5) + (total_em_dashes * 4.0) + (len(participle_tails) * 5.0) + (len(neg_parallelism) * 4.0)) / max(1.0, total_words / 1000.0)
    ai_plagiarism_index = min(100.0, pattern_density * 4.5)
    
    report = {
        "file": os.path.basename(docx_path),
        "total_words": total_words,
        "total_sentences": total_sentences,
        "em_dashes_count": total_em_dashes,
        "banned_vocabulary_count": total_banned_count,
        "banned_words_breakdown": found_banned,
        "participle_tails_count": len(participle_tails),
        "participle_tails_examples": participle_tails[:5],
        "negative_parallelisms_count": len(neg_parallelism),
        "negative_parallelisms_examples": neg_parallelism[:5],
        "sentence_length_mean": round(mean_length, 2),
        "sentence_length_std_burstiness": round(std_length, 2),
        "ai_plagiarism_probability_index": round(ai_plagiarism_index, 2)
    }
    return report

if __name__ == '__main__':
    doc_paths = [
        r'c:\Users\LENOVO\Desktop\Ear to Heart\real-heart-pulse-main\Ear_to_Heart_IEEE_Format.docx',
        r'c:\Users\LENOVO\Desktop\Ear to Heart\real-heart-pulse-main\Ear_to_Heart_SOTA_Journal_Manuscript.docx'
    ]
    for p in doc_paths:
        rep = audit_docx(p)
        if rep:
            import json
            print('='*30, rep['file'], '='*30)
            print(json.dumps(rep, indent=2))
