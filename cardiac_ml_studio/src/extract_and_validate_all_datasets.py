import os
import sys
import time
import urllib.request
import pandas as pd
import numpy as np

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def download_file_chunked(url, dest_path, chunk_size=1024*64, max_retries=5):
    for attempt in range(1, max_retries + 1):
        try:
            print(f"    [-->] Attempt {attempt}/{max_retries} connecting to {url[:60]}...")
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=25) as response:
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
                with open(dest_path, 'wb') as f:
                    while True:
                        chunk = response.read(chunk_size)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded += len(chunk)
                if total_size > 0 and downloaded < total_size:
                    raise IOError(f"Truncated download: {downloaded}/{total_size} bytes")
                print(f"    [OK] Downloaded {downloaded:,} bytes successfully.")
                return True
        except Exception as e:
            print(f"    [WARN] Attempt {attempt} failed: {e}")
            time.sleep(2 * attempt)
    return False

def extract_all_datasets():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    print("=================================================================")
    print("  EXTRACTING ADVANCED REAL-WORLD CARDIAC CLINICAL DATASETS       ")
    print("=================================================================")
    
    # 1. 70,000-Patient European Cardiovascular Disease Dataset
    print("\n[+] 1. Ingesting 70,000-Patient Cardiovascular Disease Dataset...")
    cardio_dir = os.path.join(data_dir, 'cardio_70k')
    os.makedirs(cardio_dir, exist_ok=True)
    cardio_path = os.path.join(cardio_dir, 'cardio_train.csv')
    cardio_url = "https://raw.githubusercontent.com/caravanuden/cardio/master/cardio_train.csv"
    
    if not os.path.exists(cardio_path) or os.path.getsize(cardio_path) < 1000000:
        succ = download_file_chunked(cardio_url, cardio_path)
        if not succ:
            raise RuntimeError("Failed to download cardio_train.csv")
            
    df_cardio = pd.read_csv(cardio_path, sep=';' if ';' in open(cardio_path, encoding='utf-8', errors='ignore').readline() else ',')
    # Clean abnormal outliers (e.g. negative BP or typing errors in clinical logs)
    df_cardio = df_cardio[(df_cardio['ap_hi'] >= 60) & (df_cardio['ap_hi'] <= 250)]
    df_cardio = df_cardio[(df_cardio['ap_lo'] >= 40) & (df_cardio['ap_lo'] <= 160)]
    df_cardio = df_cardio[df_cardio['ap_hi'] > df_cardio['ap_lo']]
    df_cardio['age_years'] = (df_cardio['age'] / 365.25).round(1)
    df_cardio['bmi'] = (df_cardio['weight'] / ((df_cardio['height']/100.0) ** 2)).round(2)
    df_cardio = df_cardio[(df_cardio['bmi'] >= 12) & (df_cardio['bmi'] <= 60)]
    clean_cardio_path = os.path.join(cardio_dir, 'cardio_clean.csv')
    df_cardio.to_csv(clean_cardio_path, index=False)
    print(f"    [V] Ingested & Clinically Cleaned: {len(df_cardio):,} patients")
    print(f"    Cardiovascular Prevalence: {df_cardio['cardio'].mean()*100:.2f}% ({df_cardio['cardio'].sum():,} positives)")
    
    # 2. Framingham Heart Study 10-Year Hard CHD Dataset
    print("\n[+] 2. Ingesting Framingham Heart Study 10-Year CHD Cohort...")
    fram_dir = os.path.join(data_dir, 'framingham')
    os.makedirs(fram_dir, exist_ok=True)
    fram_path = os.path.join(fram_dir, 'framingham.csv')
    fram_url = "https://raw.githubusercontent.com/GauravPadawe/Framingham-Heart-Study/master/framingham.csv"
    
    if not os.path.exists(fram_path) or os.path.getsize(fram_path) < 100000:
        succ = download_file_chunked(fram_url, fram_path)
        if not succ:
            raise RuntimeError("Failed to download framingham.csv")
            
    df_fram = pd.read_csv(fram_path)
    # Clinical median imputation for biomarkers
    for col in df_fram.columns:
        if df_fram[col].isnull().sum() > 0:
            df_fram[col] = df_fram[col].fillna(df_fram[col].median())
    clean_fram_path = os.path.join(fram_dir, 'framingham_clean.csv')
    df_fram.to_csv(clean_fram_path, index=False)
    print(f"    [V] Ingested & Imputed: {len(df_fram):,} patients")
    print(f"    10-Year Hard CHD Event Rate: {df_fram['TenYearCHD'].mean()*100:.2f}% ({df_fram['TenYearCHD'].sum():,} cases)")
    
    # 3. Cerebrovascular Stroke Clinical Dataset
    print("\n[+] 3. Ingesting Cerebrovascular Stroke Prediction Dataset...")
    stroke_dir = os.path.join(data_dir, 'stroke')
    os.makedirs(stroke_dir, exist_ok=True)
    stroke_path = os.path.join(stroke_dir, 'stroke_data.csv')
    stroke_url = "https://raw.githubusercontent.com/chandanverma07/DataSets/master/healthcare-dataset-stroke-data.csv"
    
    if not os.path.exists(stroke_path) or os.path.getsize(stroke_path) < 100000:
        succ = download_file_chunked(stroke_url, stroke_path)
        if not succ:
            raise RuntimeError("Failed to download stroke dataset")
            
    df_stroke = pd.read_csv(stroke_path)
    # Clean and impute BMI
    if 'id' in df_stroke.columns:
        df_stroke = df_stroke.drop(columns=['id'])
    df_stroke['bmi'] = pd.to_numeric(df_stroke['bmi'], errors='coerce')
    df_stroke['bmi'] = df_stroke['bmi'].fillna(df_stroke['bmi'].median())
    clean_stroke_path = os.path.join(stroke_dir, 'stroke_clean.csv')
    df_stroke.to_csv(clean_stroke_path, index=False)
    print(f"    [V] Ingested & Imputed: {len(df_stroke):,} patients")
    print(f"    Stroke Incidence Rate: {df_stroke['stroke'].mean()*100:.2f}% ({df_stroke['stroke'].sum():,} cases)")
    
    # 4. Extract Real Modified Lead II Beats from PhysioNet MIT-BIH
    print("\n[+] 4. Extracting PhysioNet MIT-BIH Authentic Lead-II Arrhythmia Beats...")
    mit_dir = os.path.join(data_dir, 'mitbih')
    os.makedirs(mit_dir, exist_ok=True)
    npz_path = os.path.join(mit_dir, 'mitbih_lead2_beats.npz')
    
    if not os.path.exists(npz_path):
        import wfdb
        # Record cohort covering normal rhythm, PVCs, PACs, and conduction aberrancies
        record_list = ['100', '101', '103', '105', '106', '116', '119', '200', '201', '203', '205', '208', '210', '213', '215', '221']
        
        # AAMI mapping:
        # N: Normal ('N', 'L', 'R', 'e', 'j') -> Class 0
        # S: Supraventricular ectopic / PAC ('A', 'a', 'J', 'S') -> Class 1
        # V: Ventricular ectopic / PVC ('V', 'E') -> Class 2
        # F: Fusion ('F') -> Class 3
        aami_map = {
            'N': 0, 'L': 0, 'R': 0, 'e': 0, 'j': 0,
            'A': 1, 'a': 1, 'J': 1, 'S': 1,
            'V': 2, 'E': 2,
            'F': 3
        }
        
        all_beats = []
        all_labels = []
        window_size = 180 # 180 samples centered at R peak (90 before, 90 after at 360Hz ~ 0.5s beat)
        
        for r_name in record_list:
            try:
                print(f"    Reading PhysioNet MIT-BIH record {r_name}...")
                rec = wfdb.rdrecord(r_name, pn_dir='mitdb')
                ann = wfdb.rdann(r_name, 'atr', pn_dir='mitdb')
                
                # Check lead index for MLII (Lead II)
                lead_idx = 0
                if 'MLII' in rec.sig_name:
                    lead_idx = rec.sig_name.index('MLII')
                elif 'II' in rec.sig_name:
                    lead_idx = rec.sig_name.index('II')
                
                sig = rec.p_signal[:, lead_idx]
                # Replace NaNs if any
                sig = np.nan_to_num(sig)
                
                for r_peak, sym in zip(ann.sample, ann.symbol):
                    if sym in aami_map:
                        start = r_peak - window_size // 2
                        end = r_peak + window_size // 2
                        if start >= 0 and end <= len(sig):
                            beat = sig[start:end]
                            # Baseline z-score normalize individual beat
                            std = np.std(beat)
                            if std > 1e-5:
                                beat = (beat - np.mean(beat)) / std
                                all_beats.append(beat)
                                all_labels.append(aami_map[sym])
            except Exception as ex:
                print(f"    [WARN] Error extracting record {r_name}: {ex}")
                
        all_beats = np.array(all_beats, dtype=np.float32)
        all_labels = np.array(all_labels, dtype=np.int64)
        np.savez_compressed(npz_path, X=all_beats, y=all_labels)
        print(f"    [V] Successfully saved {len(all_beats):,} real Lead-II beats to {npz_path} ({os.path.getsize(npz_path)/1024/1024:.2f} MB)")
    else:
        data = np.load(npz_path)
        all_beats, all_labels = data['X'], data['y']
        print(f"    [V] Already extracted: {len(all_beats):,} real Lead-II beats")
        
    unique, counts = np.unique(all_labels, return_counts=True)
    class_names = ['Normal (N)', 'Supraventricular/PAC (S)', 'Ventricular/PVC (V)', 'Fusion (F)']
    for u, c in zip(unique, counts):
        print(f"    - {class_names[u]}: {c:,} beats ({c/len(all_labels)*100:.1f}%)")
        
    print("\n=================================================================")
    print("  ALL 4 CLINICAL DATASETS EXTRACTED & READY FOR SOTA GPU TRAINING ")
    print("=================================================================")

if __name__ == '__main__':
    extract_all_datasets()
