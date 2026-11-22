import os
import sys
import subprocess

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def upload_all():
    folder = '12FNeRj8f_OrWD7aAJxU2LafEfPrkMy0B'
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    
    files = [
        os.path.join(base_dir, 'ML_MODEL_EVALUATION_AND_GRAPHS.md'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'src', 'ml_model_evaluation_graphs', 'fig5_physionet_arrhythmia_evaluation.png'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'src', 'ml_model_evaluation_graphs', 'fig6_expanded_clinical_cohorts_evaluation.png'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'data', 'cardio_70k', 'cardio_clean.csv'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'data', 'framingham', 'framingham_clean.csv'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'data', 'stroke', 'stroke_clean.csv'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'models', 'mitbih_arrhythmia_se_resnet_gru.pt'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'models', 'cardio_70k_sota_ensemble.joblib'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'models', 'framingham_10yr_sota_ensemble.joblib'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'models', 'stroke_sota_ensemble.joblib'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'results', 'mitbih_arrhythmia_metrics.json'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'results', 'cardio_70k_metrics.json'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'results', 'framingham_metrics.json'),
        os.path.join(base_dir, 'real-heart-pulse-main', 'cardiac_ml_studio', 'results', 'stroke_metrics.json')
    ]
    
    print(f"Uploading {len(files)} expanded clinical assets to Google Drive folder {folder}...")
    for f in files:
        if os.path.exists(f):
            print(f"Uploading: {os.path.basename(f)} ({os.path.getsize(f)/1024:.1f} KB)...")
            cmd = f'gdrive mutate upload "{f}" --parent {folder}'
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            out = res.stdout.strip() if res.stdout else res.stderr.strip()
            print(f"  --> {out}")
        else:
            print(f"[!] Missing: {f}")
            
    print("\n[✓] All assets processed!")

if __name__ == '__main__':
    upload_all()
