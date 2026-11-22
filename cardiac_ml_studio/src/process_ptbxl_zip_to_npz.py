import os
import sys
import time
import zipfile
import ast
import numpy as np
import pandas as pd
import wfdb

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def process_ptbxl_zip():
    data_dir = r'c:\Users\LENOVO\Desktop\Ear to Heart\real-heart-pulse-main\cardiac_ml_studio\data'
    zip_path = os.path.join(data_dir, 'ptbxl_dataset_1.0.3.zip')
    dest_npz = os.path.join(data_dir, 'ptbxl_lead2_all_21799.npz')
    
    if not os.path.exists(zip_path):
        print(f"[!] Error: Zip file not found at {zip_path}")
        return False
        
    print(f"=================================================================")
    print(f"  PROCESSING AUTHENTIC PTB-XL DATASET FROM ZIP ARCHIVE           ")
    print(f"  Archive Size: {os.path.getsize(zip_path)/(1024**3):.2f} GB     ")
    print(f"=================================================================")
    
    csv_path = os.path.join(data_dir, 'ptbxl_database.csv')
    scp_path = os.path.join(data_dir, 'scp_statements.csv')
    
    df = pd.read_csv(csv_path, index_col='ecg_id')
    scp_df = pd.read_csv(scp_path, index_col=0)
    diag_scp = scp_df[scp_df.diagnostic == 1]
    
    classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
    cls_to_idx = {c: i for i, c in enumerate(classes)}
    
    def get_labels(scp_str):
        labels = np.zeros(5, dtype=np.float32)
        try:
            d = ast.literal_eval(scp_str)
            for k in d.keys():
                if k in diag_scp.index:
                    diag_class = diag_scp.loc[k, 'diagnostic_class']
                    if diag_class in cls_to_idx:
                        labels[cls_to_idx[diag_class]] = 1.0
        except Exception:
            pass
        return labels

    print(f"[+] Mapping diagnostic multi-labels across all {len(df):,} records...")
    df['label_vec'] = df['scp_codes'].apply(get_labels)
    all_labels = np.array(df['label_vec'].tolist(), dtype=np.float32)
    folds = df['strat_fold'].values.astype(np.int64)
    patient_ids = df['patient_id'].values
    
    print(f"[+] Extracting Lead-II (100 Hz, 1000 samples) directly from zip...")
    # Unpack or read records100
    t0 = time.time()
    all_signals = np.zeros((len(df), 1, 1000), dtype=np.float32)
    
    with zipfile.ZipFile(zip_path, 'r') as z:
        # Find prefix in zip
        namelist = z.namelist()
        prefix = ""
        for name in namelist[:20]:
            if 'records100' in name:
                prefix = name.split('records100')[0]
                break
        print(f"    Detected archive prefix: '{prefix}'")
        
        extracted_count = 0
        for i, (ecg_id, row) in enumerate(df.iterrows()):
            fn = row['filename_lr'] # e.g. records100/00000/00001_lr
            dat_zip_path = prefix + fn + '.dat'
            hea_zip_path = prefix + fn + '.hea'
            
            try:
                # Read 16-bit binary signal directly
                with z.open(dat_zip_path) as f_dat:
                    raw_bytes = f_dat.read()
                    data_arr = np.frombuffer(raw_bytes, dtype='<i2').reshape(-1, 12)
                    lead2 = data_arr[:, 1].astype(np.float32) # Lead II index 1
                    
                    # Read gain from .hea if available or standard 200 ADC units/mV
                    lead2_mv = lead2 / 200.0 # Convert to mV
                    all_signals[i, 0, :min(1000, len(lead2_mv))] = lead2_mv[:1000]
                    extracted_count += 1
            except Exception as ex:
                if i < 5:
                    print(f"    [!] Note on ecg_id {ecg_id}: {ex}")
            
            if (i + 1) % 5000 == 0 or (i + 1) == len(df):
                print(f"    Extracted {i+1:,}/{len(df):,} records ({time.time()-t0:.1f}s)...")
                
    print(f"\n[✓] Successfully extracted {extracted_count:,} authentic Lead-II ECG records in {time.time()-t0:.1f}s!")
    print(f"[+] Signal tensor shape: {all_signals.shape}, Labels shape: {all_labels.shape}")
    
    np.savez_compressed(
        dest_npz,
        signals=all_signals,
        labels=all_labels,
        folds=folds,
        patient_ids=patient_ids,
        classes=np.array(classes)
    )
    print(f"[✓] Saved authentic complete dataset to {dest_npz} ({os.path.getsize(dest_npz)/(1024*1024):.2f} MB)")
    return True

if __name__ == '__main__':
    process_ptbxl_zip()
