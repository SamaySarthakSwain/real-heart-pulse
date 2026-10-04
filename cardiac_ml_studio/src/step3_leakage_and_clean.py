import os
import pandas as pd
import ast
import json
import numpy as np

def audit_leakage_and_clean(data_dir):
    print("========================================")
    print("   STEP 3 & 4 — LEAKAGE AUDIT & CLEANING")
    print("========================================")
    
    db_path = os.path.join(data_dir, 'ptbxl_database.csv')
    scp_path = os.path.join(data_dir, 'scp_statements.csv')
    
    print(f"Loading metadata from {db_path}...")
    df = pd.read_csv(db_path, index_col='ecg_id')
    scp_df = pd.read_csv(scp_path, index_col=0)
    
    # Extract labels
    df['scp_codes'] = df['scp_codes'].apply(ast.literal_eval)
    
    def aggregate_diagnostic(y_dic):
        tmp = []
        for key in y_dic.keys():
            if key in scp_df.index:
                cls = scp_df.loc[key, 'diagnostic_class']
                if pd.notna(cls):
                    tmp.append(cls)
        return list(set(tmp))
        
    df['diagnostic_class'] = df['scp_codes'].apply(aggregate_diagnostic)
    
    print("\n[+] STEP 3: DATA LEAKAGE AUDIT")
    # Folds 1-8 are train, 9 is validation, 10 is test
    train_df = df[df['strat_fold'] <= 8]
    val_df = df[df['strat_fold'] == 9]
    test_df = df[df['strat_fold'] == 10]
    
    train_patients = set(train_df['patient_id'])
    val_patients = set(val_df['patient_id'])
    test_patients = set(test_df['patient_id'])
    
    val_leak = train_patients.intersection(val_patients)
    test_leak = train_patients.intersection(test_patients)
    val_test_leak = val_patients.intersection(test_patients)
    
    print(f"Train patients: {len(train_patients)}")
    print(f"Val patients: {len(val_patients)}")
    print(f"Test patients: {len(test_patients)}")
    
    print(f"\nPatient overlap (Train / Val): {len(val_leak)}")
    print(f"Patient overlap (Train / Test): {len(test_leak)}")
    print(f"Patient overlap (Val / Test): {len(val_test_leak)}")
    
    if len(val_leak) == 0 and len(test_leak) == 0 and len(val_test_leak) == 0:
        print(">> LEAKAGE AUDIT PASSED: Zero patient overlap between splits.")
    else:
        print(">> WARNING: Patient leakage detected!")
        
    print("\n[+] STEP 4: DATA CLEANING")
    original_len = len(df)
    
    # Remove records that don't have a diagnostic superclass
    df = df[df['diagnostic_class'].apply(len) > 0]
    clean_len = len(df)
    
    print(f"Removed {original_len - clean_len} records with missing diagnostic labels.")
    
    # Multi-Hot Encoding
    all_classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
    for cls in all_classes:
        df[cls] = df['diagnostic_class'].apply(lambda x: 1 if cls in x else 0)
        
    print("Multi-Hot encoding complete. Target distribution in cleaned dataset:")
    for cls in all_classes:
        count = df[cls].sum()
        print(f"   - {cls}: {count} ({count/clean_len*100:.1f}%)")
        
    # Save cleaned metadata
    save_path = os.path.join(data_dir, 'cleaned_metadata.csv')
    df[['patient_id', 'strat_fold', 'filename_hr'] + all_classes].to_csv(save_path)
    print(f"\n[+] Cleaned metadata saved to {save_path}")

if __name__ == "__main__":
    audit_leakage_and_clean('../data/ptbxl_full/ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.1')
