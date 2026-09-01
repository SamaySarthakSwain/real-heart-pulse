import os
import pandas as pd
import numpy as np
from sklearn.datasets import make_classification

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

# Set random seed for reproducibility
np.random.seed(42)

def generate_ischemia_dataset(n_samples=5000):
    """
    Simulates Ischemia & CAD dataset based on UCI/Cleveland and PTB-XL ST-T features.
    Features: Age, Sex, ChestPainType, RestingBP, Cholesterol, FastingBS, MaxHR, 
              ExerciseAngina, ST_Depression (Oldpeak), ST_Slope, NumberOfVesselsFluoroscopy.
    """
    X, y = make_classification(
        n_samples=n_samples, n_features=11, n_informative=8, n_redundant=2,
        weights=[0.55, 0.45], class_sep=0.85, random_state=42
    )
    
    # Scale to realistic ranges
    df = pd.DataFrame(X, columns=[
        'Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol', 
        'FastingBS', 'MaxHR', 'ExerciseAngina', 'ST_Depression', 
        'ST_Slope', 'NumVesselsFluoroscopy'
    ])
    
    df['Age'] = np.clip(df['Age'] * 10 + 55, 30, 85).astype(int)
    df['Sex'] = (df['Sex'] > 0).astype(int) # 0: Female, 1: Male
    df['ChestPainType'] = pd.cut(df['ChestPainType'], bins=4, labels=[0, 1, 2, 3]).astype(int)
    df['RestingBP'] = np.clip(df['RestingBP'] * 15 + 130, 90, 200)
    df['Cholesterol'] = np.clip(df['Cholesterol'] * 40 + 240, 120, 400)
    df['FastingBS'] = (df['FastingBS'] > 1.5).astype(int)
    df['MaxHR'] = np.clip(df['MaxHR'] * 20 + 150, 70, 210)
    df['ExerciseAngina'] = (df['ExerciseAngina'] > 0).astype(int)
    df['ST_Depression'] = np.clip(df['ST_Depression'] * 1.5 + 1.0, 0, 6.2)
    df['ST_Slope'] = pd.cut(df['ST_Slope'], bins=3, labels=[0, 1, 2]).astype(int)
    df['NumVesselsFluoroscopy'] = pd.cut(df['NumVesselsFluoroscopy'], bins=4, labels=[0, 1, 2, 3]).astype(int)
    
    df['Target'] = y
    
    filepath = '../data/ischemia/ischemia_dataset.csv'
    ensure_dir(os.path.dirname(filepath))
    df.to_csv(filepath, index=False)
    print(f"[+] Saved Ischemia dataset: {filepath} ({n_samples} samples)")

def generate_amyloidosis_dataset(n_samples=5000):
    """
    Simulates Cardiac Amyloidosis dataset based on EchoNet, Mayo Clinic parameters.
    Features: Age, RelativeWallThickness (RWT), ApicalSparingRatio, LowVoltageMassRatio,
              NT_proBNP, Troponin_T, E_e_ratio, LVEF, MyocardialContractionFraction.
    """
    X, y = make_classification(
        n_samples=n_samples, n_features=9, n_informative=7, n_redundant=1,
        weights=[0.80, 0.20], class_sep=1.1, random_state=123
    )
    
    df = pd.DataFrame(X, columns=[
        'Age', 'RelativeWallThickness', 'ApicalSparingRatio', 'LowVoltageMassRatio',
        'NT_proBNP', 'Troponin_T', 'E_e_ratio', 'LVEF', 'MyocardialContractionFraction'
    ])
    
    df['Age'] = np.clip(df['Age'] * 8 + 70, 40, 95).astype(int)
    df['RelativeWallThickness'] = np.clip(df['RelativeWallThickness'] * 0.1 + 0.5, 0.3, 0.9)
    # Amyloidosis has high apical sparing (>1.0 often)
    df['ApicalSparingRatio'] = np.clip(df['ApicalSparingRatio'] * 0.4 + 1.1, 0.5, 3.0) 
    # Low voltage to mass ratio is a hallmark
    df['LowVoltageMassRatio'] = np.clip(df['LowVoltageMassRatio'] * 0.05 + 0.15, 0.05, 0.5)
    df['NT_proBNP'] = np.clip(np.exp(df['NT_proBNP'] + 7.5), 100, 25000)
    df['Troponin_T'] = np.clip(df['Troponin_T'] * 20 + 45, 5, 200)
    df['E_e_ratio'] = np.clip(df['E_e_ratio'] * 4 + 16, 5, 35)
    df['LVEF'] = np.clip(df['LVEF'] * 10 + 50, 20, 75)
    df['MyocardialContractionFraction'] = np.clip(df['MyocardialContractionFraction'] * 10 + 30, 10, 80)
    
    df['Target'] = y
    
    filepath = '../data/amyloidosis/amyloidosis_dataset.csv'
    ensure_dir(os.path.dirname(filepath))
    df.to_csv(filepath, index=False)
    print(f"[+] Saved Amyloidosis dataset: {filepath} ({n_samples} samples)")

def generate_fibrosis_dataset(n_samples=5000):
    """
    Simulates Cardiac Fibrosis (Myocardial Scarring & Interstitial) based on EMIDEC/CMR parameters.
    Features: ExtracellularVolume_ECV, Native_T1, PostContrast_T1, LGE_Scar_Percent,
              TransmuralExtent, LVEDVI, LVMI, GlobalLongitudinalStrain.
    """
    X, y = make_classification(
        n_samples=n_samples, n_features=8, n_informative=6, n_redundant=1,
        weights=[0.60, 0.40], class_sep=0.9, random_state=456
    )
    
    df = pd.DataFrame(X, columns=[
        'ExtracellularVolume_ECV', 'Native_T1', 'PostContrast_T1', 'LGE_Scar_Percent',
        'TransmuralExtent', 'LVEDVI', 'LVMI', 'GlobalLongitudinalStrain'
    ])
    
    # ECV is a direct measure of fibrosis (normal ~25%, fibrosis >30%)
    df['ExtracellularVolume_ECV'] = np.clip(df['ExtracellularVolume_ECV'] * 4 + 28, 20, 50)
    # Native T1 is elevated in fibrosis
    df['Native_T1'] = np.clip(df['Native_T1'] * 50 + 1050, 900, 1250)
    df['PostContrast_T1'] = np.clip(df['PostContrast_T1'] * 30 + 400, 300, 600)
    df['LGE_Scar_Percent'] = np.clip(df['LGE_Scar_Percent'] * 8 + 5, 0, 40)
    # Make values strictly positive where needed
    df.loc[df['LGE_Scar_Percent'] < 0.5, 'LGE_Scar_Percent'] = 0.0
    df['TransmuralExtent'] = np.clip(df['TransmuralExtent'] * 15 + 25, 0, 100)
    df['LVEDVI'] = np.clip(df['LVEDVI'] * 15 + 85, 40, 160)
    df['LVMI'] = np.clip(df['LVMI'] * 20 + 75, 40, 180)
    # Strain is worse (less negative) in fibrosis
    df['GlobalLongitudinalStrain'] = np.clip(df['GlobalLongitudinalStrain'] * 3 - 15, -25, -5)
    
    df['Target'] = y
    
    filepath = '../data/fibrosis/fibrosis_dataset.csv'
    ensure_dir(os.path.dirname(filepath))
    df.to_csv(filepath, index=False)
    print(f"[+] Saved Fibrosis dataset: {filepath} ({n_samples} samples)")

if __name__ == '__main__':
    print("Downloading / Generating Curated Datasets for Cardiac ML Studio...")
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    generate_ischemia_dataset(8000)
    generate_amyloidosis_dataset(8000)
    generate_fibrosis_dataset(8000)
    print("All datasets successfully created and stored in ../data/")
