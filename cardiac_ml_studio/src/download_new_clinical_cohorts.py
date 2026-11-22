import os
import sys
import pandas as pd
import numpy as np
import urllib.request
import time

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def download_cohorts():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    
    print("=================================================================")
    print("  EXTRACTING ADVANCED REAL-WORLD CARDIAC CLINICAL DATASETS       ")
    print("=================================================================")
    
    # 1. 70,000-Patient Cardiovascular Disease Dataset
    print("\n[+] 1. Downloading 70,000-Patient Cardiovascular Disease Dataset (cardio_train.csv)...")
    cardio_dir = os.path.join(data_dir, 'cardio_70k')
    os.makedirs(cardio_dir, exist_ok=True)
    cardio_path = os.path.join(cardio_dir, 'cardio_train.csv')
    
    url_cardio = "https://raw.githubusercontent.com/caravanuden/cardio/master/cardio_train.csv"
    if not os.path.exists(cardio_path) or os.path.getsize(cardio_path) < 100000:
        t0 = time.time()
        df_cardio = pd.read_csv(url_cardio, sep=';')
        df_cardio.to_csv(cardio_path, index=False)
        print(f"    [✓] Saved {len(df_cardio):,} patients in {time.time()-t0:.2f}s ({os.path.getsize(cardio_path)/1024/1024:.2f} MB)")
    else:
        df_cardio = pd.read_csv(cardio_path)
        print(f"    [✓] Already active: {len(df_cardio):,} patients")
        
    print(f"    Features: {list(df_cardio.columns)}")
    print(f"    Cardiovascular Disease Prevalence: {df_cardio['cardio'].mean()*100:.2f}% ({df_cardio['cardio'].sum():,} positive cases)")
    
    # 2. Framingham Heart Study 10-Year Coronary Heart Disease (CHD) Dataset
    print("\n[+] 2. Downloading Framingham Heart Study Cohort (framingham.csv)...")
    fram_dir = os.path.join(data_dir, 'framingham')
    os.makedirs(fram_dir, exist_ok=True)
    fram_path = os.path.join(fram_dir, 'framingham.csv')
    
    url_fram = "https://raw.githubusercontent.com/GauravPadawe/Framingham-Heart-Study/master/framingham.csv"
    if not os.path.exists(fram_path) or os.path.getsize(fram_path) < 50000:
        t0 = time.time()
        df_fram = pd.read_csv(url_fram)
        # Clinical median/mode imputation for missing biomarker fields
        for c in df_fram.columns:
            if df_fram[c].isnull().sum() > 0:
                if df_fram[c].dtype in [np.float64, np.float32]:
                    df_fram[c] = df_fram[c].fillna(df_fram[c].median())
                else:
                    df_fram[c] = df_fram[c].fillna(df_fram[c].mode()[0])
        df_fram.to_csv(fram_path, index=False)
        print(f"    [✓] Saved {len(df_fram):,} patients in {time.time()-t0:.2f}s ({os.path.getsize(fram_path)/1024:.1f} KB)")
    else:
        df_fram = pd.read_csv(fram_path)
        print(f"    [✓] Already active: {len(df_fram):,} patients")
        
    print(f"    Features: {list(df_fram.columns)}")
    print(f"    10-Year CHD Event Rate: {df_fram['TenYearCHD'].mean()*100:.2f}% ({df_fram['TenYearCHD'].sum():,} cases)")
    
    print("\n=================================================================")
    print("  ALL NEW CLINICAL COHORTS EXTRACTED & READY FOR TRAINING!       ")
    print("=================================================================")

if __name__ == '__main__':
    download_cohorts()
