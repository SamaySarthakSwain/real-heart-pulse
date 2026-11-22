import os
import sys
import subprocess

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def upload_all():
    target_folder_id = '105Dnc66hFfcusUkEY4yFPixVPCsdVfB2' # Complete_Datasets_and_SOTA_Trained_Models
    base_dir = r'c:\Users\LENOVO\Desktop\Ear to Heart\real-heart-pulse-main\cardiac_ml_studio'
    
    files = [
        # Models
        os.path.join(base_dir, 'models', 'sota_single_lead_se_resnet_gru.pt'),
        os.path.join(base_dir, 'models', 'single_lead_optimal_thresholds.json'),
        os.path.join(base_dir, 'models', 'mitbih_arrhythmia_se_resnet_gru.pt'),
        os.path.join(base_dir, 'models', 'sota_multimodal_fusion.pt'),
        os.path.join(base_dir, 'models', 'cardio_70k_sota_ensemble.joblib'),
        os.path.join(base_dir, 'models', 'framingham_10yr_sota_ensemble.joblib'),
        os.path.join(base_dir, 'models', 'stroke_sota_ensemble.joblib'),
        
        # Results & Metrics
        os.path.join(base_dir, 'results', 'sota_single_lead_real_ptbxl_metrics.json'),
        os.path.join(base_dir, 'results', 'mitbih_arrhythmia_metrics.json'),
        os.path.join(base_dir, 'results', 'multimodal_fusion_metrics.json'),
        os.path.join(base_dir, 'results', 'cardio_70k_metrics.json'),
        os.path.join(base_dir, 'results', 'framingham_metrics.json'),
        os.path.join(base_dir, 'results', 'stroke_metrics.json'),
        os.path.join(base_dir, 'model_training_history_log.json'),
        
        # Publication Figures
        os.path.join(base_dir, 'model_analysis_graphs', 'fig1_authentic_ptbxl_roc_pr_evaluation.png'),
        os.path.join(base_dir, 'model_analysis_graphs', 'fig1_authentic_ptbxl_roc_pr_evaluation.pdf'),
        os.path.join(base_dir, 'model_analysis_graphs', 'fig2_authentic_mitbih_interpatient_confusion_matrix.png'),
        os.path.join(base_dir, 'model_analysis_graphs', 'fig2_authentic_mitbih_interpatient_confusion_matrix.pdf'),
        os.path.join(base_dir, 'model_analysis_graphs', 'fig3_authentic_clinical_stacking_roc_comparison.png'),
        os.path.join(base_dir, 'model_analysis_graphs', 'fig3_authentic_clinical_stacking_roc_comparison.pdf')
    ]
    
    print(f"Uploading {len(files)} authentic SOTA assets to Google Drive folder '{target_folder_id}'...")
    uploaded_count = 0
    for f in files:
        if os.path.exists(f):
            sz_kb = os.path.getsize(f) / 1024.0
            print(f"Uploading: {os.path.basename(f)} ({sz_kb:.1f} KB)...")
            cmd = f'gdrive mutate upload "{f}" --parent {target_folder_id}'
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            out = res.stdout.strip() if res.stdout else res.stderr.strip()
            print(f"  --> {out}")
            uploaded_count += 1
        else:
            print(f"[!] File not found: {f}")
            
    print(f"\n[✓] Successfully processed {uploaded_count}/{len(files)} authentic clinical assets into Google Drive!")

if __name__ == '__main__':
    upload_all()
