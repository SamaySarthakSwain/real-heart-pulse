import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set high DPI and publication aesthetics
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['axes.titlesize'] = 13
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10
plt.rcParams['legend.fontsize'] = 10

def generate_paper_figures():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    results_dir = os.path.join(base_dir, '..', 'results')
    output_dir = os.path.join(results_dir, 'paper_figures')
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Load Metric Reports
    with open(os.path.join(results_dir, 'metrics_report.json'), 'r') as f:
        tabular_metrics = json.load(f)
        
    with open(os.path.join(results_dir, 'heart_failure_metrics.json'), 'r') as f:
        hf_metrics = json.load(f)
        
    with open(os.path.join(results_dir, 'deep_learning_metrics.json'), 'r') as f:
        dl_metrics = json.load(f)
        
    print(f"[+] Loaded metrics. Generating publication figures into: {output_dir}")

    # =========================================================================
    # FIGURE 1: Tabular & Disease Classification Performance Benchmark (Grouped Bar Chart)
    # =========================================================================
    models = ['Heart Failure (RF)', 'Ischemia (XGB)', 'Amyloidosis (XGB)', 'Fibrosis (XGB)']
    accs = [
        hf_metrics['HeartFailure']['accuracy'] * 100,
        tabular_metrics['Ischemia']['accuracy'] * 100,
        tabular_metrics['Amyloidosis']['accuracy'] * 100,
        tabular_metrics['Fibrosis']['accuracy'] * 100
    ]
    aucs = [
        hf_metrics['HeartFailure']['roc_auc'] * 100,
        tabular_metrics['Ischemia']['roc_auc'] * 100,
        tabular_metrics['Amyloidosis']['roc_auc'] * 100,
        tabular_metrics['Fibrosis']['roc_auc'] * 100
    ]
    f1s = [
        hf_metrics['HeartFailure']['f1_score'] * 100,
        tabular_metrics['Ischemia']['f1_score'] * 100,
        tabular_metrics['Amyloidosis']['f1_score'] * 100,
        tabular_metrics['Fibrosis']['f1_score'] * 100
    ]

    x = np.arange(len(models))
    width = 0.25

    fig, ax = plt.subplots(figsize=(9, 5.5), constrained_layout=True)
    rects1 = ax.bar(x - width, accs, width, label='Accuracy (%)', color='#2b5c8f', edgecolor='black', linewidth=0.8)
    rects2 = ax.bar(x, aucs, width, label='ROC-AUC (%)', color='#48a9a6', edgecolor='black', linewidth=0.8)
    rects3 = ax.bar(x + width, f1s, width, label='F1-Score (%)', color='#d4a373', edgecolor='black', linewidth=0.8)

    ax.set_ylabel('Score (%)', fontweight='bold')
    ax.set_title('Comparative Performance of Disease Classification Models', fontweight='bold', pad=12)
    ax.set_xticks(x)
    ax.set_xticklabels(models, fontweight='semibold')
    ax.set_ylim(75, 103)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    ax.legend(frameon=True, facecolor='white', framealpha=0.9, loc='lower right')

    # Add value annotations
    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f'{height:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3), textcoords="offset points",
                        ha='center', va='bottom', fontsize=8.5, fontweight='bold')

    autolabel(rects1)
    autolabel(rects2)
    autolabel(rects3)

    fig1_path = os.path.join(output_dir, 'fig1_disease_models_benchmark.png')
    plt.savefig(fig1_path, dpi=300)
    plt.close()
    print(f" -> Saved: {fig1_path}")

    # =========================================================================
    # FIGURE 2: Deep Learning 1D-CNN Multi-label Performance across ECG Superclasses
    # =========================================================================
    classes = ['NORM\n(Normal)', 'MI\n(Infarction)', 'STTC\n(ST/T Changes)', 'CD\n(Conduction)', 'HYP\n(Hypertrophy)']
    keys = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
    
    dl_auc = [dl_metrics[k]['ROC-AUC'] for k in keys]
    dl_prauc = [dl_metrics[k]['PR-AUC'] for k in keys]
    dl_f1 = [dl_metrics[k]['F1'] for k in keys]
    dl_sens = [dl_metrics[k]['Sensitivity'] for k in keys]
    dl_spec = [dl_metrics[k]['Specificity'] for k in keys]

    x_dl = np.arange(len(classes))
    bar_w = 0.16

    fig, ax = plt.subplots(figsize=(10.5, 5.5), constrained_layout=True)
    ax.bar(x_dl - 2*bar_w, dl_auc, bar_w, label='ROC-AUC', color='#1d3557', edgecolor='black', linewidth=0.7)
    ax.bar(x_dl - bar_w, dl_prauc, bar_w, label='PR-AUC', color='#457b9d', edgecolor='black', linewidth=0.7)
    ax.bar(x_dl, dl_f1, bar_w, label='F1-Score', color='#a8dadc', edgecolor='black', linewidth=0.7)
    ax.bar(x_dl + bar_w, dl_sens, bar_w, label='Sensitivity', color='#e63946', edgecolor='black', linewidth=0.7)
    ax.bar(x_dl + 2*bar_w, dl_spec, bar_w, label='Specificity', color='#f4a261', edgecolor='black', linewidth=0.7)

    ax.set_ylabel('Metric Score', fontweight='bold')
    ax.set_title('1D-CNN Multi-Label Diagnostic Metrics on PTB-XL Test Cohort (Macro AUC: 0.9004)', fontweight='bold', pad=12)
    ax.set_xticks(x_dl)
    ax.set_xticklabels(classes, fontweight='semibold')
    ax.set_ylim(0, 1.08)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    ax.legend(frameon=True, loc='upper right', ncol=3)

    fig2_path = os.path.join(output_dir, 'fig2_ptbxl_1dcnn_evaluation.png')
    plt.savefig(fig2_path, dpi=300)
    plt.close()
    print(f" -> Saved: {fig2_path}")

    # =========================================================================
    # FIGURE 3: Confusion Matrices for All 3 XGBoost Models (1x3 Panel)
    # =========================================================================
    fig, axes = plt.subplots(1, 3, figsize=(13.5, 4.2), constrained_layout=True)
    diseases = [
        ('Ischemia (XGBoost)', np.array(tabular_metrics['Ischemia']['confusion_matrix']), axes[0], 'Blues'),
        ('Amyloidosis (XGBoost)', np.array(tabular_metrics['Amyloidosis']['confusion_matrix']), axes[1], 'Purples'),
        ('Fibrosis (XGBoost)', np.array(tabular_metrics['Fibrosis']['confusion_matrix']), axes[2], 'Greens')
    ]

    for title, cm, ax_sub, cmap in diseases:
        sns.heatmap(cm, annot=True, fmt='d', cmap=cmap, cbar=False, ax=ax_sub,
                    annot_kws={"size": 13, "weight": "bold"})
        ax_sub.set_title(title, fontweight='bold', pad=10)
        ax_sub.set_xlabel('Predicted Label', fontweight='semibold')
        ax_sub.set_ylabel('True Label', fontweight='semibold')
        ax_sub.set_xticklabels(['Negative', 'Positive'])
        ax_sub.set_yticklabels(['Negative', 'Positive'])

    fig3_path = os.path.join(output_dir, 'fig3_xgboost_confusion_matrices.png')
    plt.savefig(fig3_path, dpi=300)
    plt.close()
    print(f" -> Saved: {fig3_path}")

    # =========================================================================
    # FIGURE 4: Heart Failure Model Confusion Matrix & Metrics Summary
    # =========================================================================
    cm_hf = np.array(hf_metrics['HeartFailure']['confusion_matrix'])
    fig, ax = plt.subplots(figsize=(5.5, 4.6), constrained_layout=True)
    sns.heatmap(cm_hf, annot=True, fmt='d', cmap='Blues', ax=ax, cbar=True,
                annot_kws={"size": 14, "weight": "bold"})
    ax.set_title('Heart Failure Random Forest Confusion Matrix\n(Accuracy: 90.22%, AUC: 0.9369)', fontweight='bold', pad=10)
    ax.set_xlabel('Predicted Label', fontweight='semibold')
    ax.set_ylabel('True Clinical Diagnosis', fontweight='semibold')
    ax.set_xticklabels(['No Disease', 'Heart Disease'])
    ax.set_yticklabels(['No Disease', 'Heart Disease'])

    fig4_path = os.path.join(output_dir, 'fig4_heart_failure_confusion_matrix.png')
    plt.savefig(fig4_path, dpi=300)
    plt.close()
    print(f" -> Saved: {fig4_path}")

    # =========================================================================
    # FIGURE 5: Summary Benchmark Radar / Spider Chart of Model Capabilities
    # =========================================================================
    categories = ['Accuracy', 'ROC-AUC', 'F1-Score', 'Precision', 'Recall']
    N = len(categories)

    # Values for the 4 conditions
    values_hf = [
        hf_metrics['HeartFailure']['accuracy'],
        hf_metrics['HeartFailure']['roc_auc'],
        hf_metrics['HeartFailure']['f1_score'],
        hf_metrics['HeartFailure']['precision'],
        hf_metrics['HeartFailure']['recall']
    ]
    values_isc = [
        tabular_metrics['Ischemia']['accuracy'],
        tabular_metrics['Ischemia']['roc_auc'],
        tabular_metrics['Ischemia']['f1_score'],
        tabular_metrics['Ischemia']['precision'],
        tabular_metrics['Ischemia']['recall']
    ]
    values_amy = [
        tabular_metrics['Amyloidosis']['accuracy'],
        tabular_metrics['Amyloidosis']['roc_auc'],
        tabular_metrics['Amyloidosis']['f1_score'],
        tabular_metrics['Amyloidosis']['precision'],
        tabular_metrics['Amyloidosis']['recall']
    ]
    values_fib = [
        tabular_metrics['Fibrosis']['accuracy'],
        tabular_metrics['Fibrosis']['roc_auc'],
        tabular_metrics['Fibrosis']['f1_score'],
        tabular_metrics['Fibrosis']['precision'],
        tabular_metrics['Fibrosis']['recall']
    ]

    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]

    values_hf += values_hf[:1]
    values_isc += values_isc[:1]
    values_amy += values_amy[:1]
    values_fib += values_fib[:1]

    fig, ax = plt.subplots(figsize=(6.5, 6.5), subplot_kw=dict(polar=True))
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)

    plt.xticks(angles[:-1], categories, fontweight='bold', size=10)
    ax.set_rlabel_position(0)
    plt.yticks([0.80, 0.85, 0.90, 0.95, 1.0], ["0.80", "0.85", "0.90", "0.95", "1.00"], color="grey", size=8)
    plt.ylim(0.78, 1.0)

    ax.plot(angles, values_hf, linewidth=2, linestyle='solid', label='Heart Failure (RF)', color='#e63946')
    ax.fill(angles, values_hf, color='#e63946', alpha=0.1)

    ax.plot(angles, values_isc, linewidth=2, linestyle='solid', label='Ischemia (XGB)', color='#1d3557')
    ax.fill(angles, values_isc, color='#1d3557', alpha=0.1)

    ax.plot(angles, values_amy, linewidth=2, linestyle='solid', label='Amyloidosis (XGB)', color='#2a9d8f')
    ax.fill(angles, values_amy, color='#2a9d8f', alpha=0.1)

    ax.plot(angles, values_fib, linewidth=2, linestyle='solid', label='Fibrosis (XGB)', color='#e76f51')
    ax.fill(angles, values_fib, color='#e76f51', alpha=0.1)

    plt.title('Radar Profile: Multi-Metric Clinical Comparison', y=1.08, fontweight='bold', size=13)
    plt.legend(loc='upper right', bbox_to_anchor=(1.35, 1.1), frameon=True)

    fig5_path = os.path.join(output_dir, 'fig5_radar_metrics_profile.png')
    plt.savefig(fig5_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f" -> Saved: {fig5_path}")

    print("\n[+] All publication figures successfully generated!")

if __name__ == '__main__':
    generate_paper_figures()
