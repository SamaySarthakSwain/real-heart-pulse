import os
import pandas as pd
import ast
import json

def audit_dataset(data_dir):
    print("========================================")
    print("       STEP 1 — DATASET AUDIT")
    print("========================================")
    
    db_path = os.path.join(data_dir, 'ptbxl_database.csv')
    scp_path = os.path.join(data_dir, 'scp_statements.csv')
    
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found. Ensure dataset is downloaded and extracted.")
        return
        
    print(f"Loading metadata from {db_path}...")
    df = pd.read_csv(db_path, index_col='ecg_id')
    scp_df = pd.read_csv(scp_path, index_col=0)
    
    # 1. Dataset Name & Source
    print("\n1. Dataset Name: PTB-XL Electrocardiography Database")
    print("2. Source: PhysioNet (via Kaggle Mirror)")
    print("3. License: Open Data Commons Attribution License v1.0 (ODC-BY 1.0)")
    
    # 4 & 5. Subjects and Records
    num_records = len(df)
    num_subjects = df['patient_id'].nunique()
    print(f"4. Number of subjects: {num_subjects}")
    print(f"5. Number of records/samples: {num_records}")
    
    # 6 & 7. Classes and Distribution
    # Parse scp_codes column which contains dict as string
    df['scp_codes'] = df['scp_codes'].apply(ast.literal_eval)
    
    # Map scp codes to diagnostic classes
    def aggregate_diagnostic(y_dic):
        tmp = []
        for key in y_dic.keys():
            if key in scp_df.index:
                cls = scp_df.loc[key, 'diagnostic_class']
                if pd.notna(cls):
                    tmp.append(cls)
        return list(set(tmp))
        
    df['diagnostic_class'] = df['scp_codes'].apply(aggregate_diagnostic)
    
    # Explode and count
    all_classes = df['diagnostic_class'].explode()
    class_dist = all_classes.value_counts()
    print(f"6. Number of diagnostic superclasses: {len(class_dist)}")
    print("7. Class distribution (Superclasses):")
    for cls, count in class_dist.items():
        print(f"   - {cls}: {count} ({count/num_records*100:.1f}%)")
        
    # 8-11. Signal info
    print("8. Available physiological signals: 12-lead ECG (I, II, III, AVR, AVL, AVF, V1, V2, V3, V4, V5, V6)")
    print("9. Sampling frequency: 100 Hz (and 500 Hz available)")
    print("10. Signal duration: 10 seconds per record")
    print("11. Sensor/channel information: Standard 12-lead configuration")
    
    # 12-15. Data Quality Basics
    print("\n12. Missing values in metadata:")
    missing = df.isnull().sum()
    print(missing[missing > 0].to_string())
    
    print(f"13. Duplicate samples: {num_records - df.index.nunique()} (by ECG ID)")
    
    # 16-20. Metadata and Confounders
    print("\n16. Metadata available: Age, Sex, Height, Weight, Nurse, Site, Device, Heart Axis, Infarction stadium, Extra beats, Pacemaker, etc.")
    print(f"17. Subject/patient IDs: Available ('patient_id' column for grouping)")
    print("18. Labels: SCP-ECG statements (expert annotated)")
    print("19. Label quality: Validated by up to two cardiologists")
    
    print("\n20. Potential demographic confounders:")
    print(f"    - Sex distribution: \n{df['sex'].value_counts(normalize=True).to_string()}")
    print(f"    - Age range: {df['age'].min()} to {df['age'].max()} (Mean: {df['age'].mean():.1f})")
    
    print("\n[+] Dataset Audit Complete. Report generated.")
    
    # Save report
    report = {
        "dataset": "PTB-XL",
        "num_records": num_records,
        "num_subjects": num_subjects,
        "class_distribution": class_dist.to_dict()
    }
    with open('dataset_report.json', 'w') as f:
        json.dump(report, f, indent=4)

if __name__ == "__main__":
    audit_dataset('../data/ptbxl')
