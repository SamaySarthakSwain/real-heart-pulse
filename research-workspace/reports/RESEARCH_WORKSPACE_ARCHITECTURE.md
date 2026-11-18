# RESEARCH WORKSPACE ARCHITECTURE: EAR TO HEART
**System:** Ear to Heart (VitalStream Biomedical Telemetry & AI Diagnostic System)  
**Repository:** `https://github.com/SamaySarthakSwain/real-heart-pulse`  
**Branch:** `research-paper-workspace`  
**Auditor:** Senior Software Architect & Biomedical Engineering Researcher  
**Date:** November 2026  
**Status:** Comprehensive Workspace Structural Blueprint & Reproducibility Guide

---

## 1. Architectural Philosophy & Isolation Principles

To ensure that scientific research and publication workflows proceed with the highest rigor while guaranteeing absolute safety for the existing production software, the **Ear to Heart Research Workspace** is engineered under four foundational isolation principles:

```
+----------------------------------------------------------------------------------------------------+
|                                    WORKSPACE ISOLATION BLUEPRINT                                   |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   PRODUCTION CODEBASE (Protected)                RESEARCH WORKSPACE (Isolated Sandbox)            |
|   +------------------------------------+         +--------------------------------------------+    |
|   | - firmware/firmware.ino (ESP32)    |         | real-heart-pulse-main/research-workspace/  |    |
|   | - src/ (React / Vite Frontend)     | <====== | - repository-analysis/ (Repomix packs)     |    |
|   | - android/ (Mobile Capacitor APK)  | (READ   | - literature/ (Verified papers & .bib)     |    |
|   | - cardiac_ml_studio/ (GPU Models)  |  ONLY)  | - manuscript/ (Modular LaTeX & Markdown)   |    |
|   | - Ear_to_Heart_RP.docx (Pristine)  |         | - figures/ (600 DPI Vector & Raster Plots) |    |
|   +------------------------------------+         | - experiments/ (Metric JSONs & Seeds)      |    |
|                                                  | - scripts/ (Automated build & verifiers)   |    |
|                                                  | - reports/ (Deliverables 1 - 8)            |    |
|                                                  +--------------------------------------------+    |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

1. **Zero Production Contamination:** The research environment lives strictly within `real-heart-pulse-main/research-workspace/`. Production dependencies (`package.json`, `android/`, `firmware/`) remain completely unmodified.
2. **Git Branch Confinement:** All research artifacts, analysis reports, and manuscript files are committed exclusively to the dedicated branch:
   $$\text{Branch: } \texttt{research-paper-workspace}$$
3. **Pristine Document Preservation:** Existing preliminary drafts (`Ear_to_Heart_RP.docx` and `Ear_to_Heart_RP_backup.docx`) are strictly read-only reference artifacts and will never be overwritten.
4. **Reproducibility by Design:** Every experimental number, figure, and citation in the manuscript is generated through version-controlled Python and Node.js scripts with fixed random seeds.

---

## 2. Directory Structure Blueprint

```text
real-heart-pulse-main/research-workspace/
├── config/
│   ├── research-config.yaml          # Global research configurations, target journals, styling rules
│   └── research-config.example.yaml  # Template for multi-author research configuration
├── datasets/
│   ├── dataset_catalog.json          # Schema, licensing, and provenance cards for all 9 cohorts
│   └── mirrors.md                    # Official PhysioNet & Kaggle download mirrors and checksums
├── experiments/
│   ├── evaluation/                   # Model evaluation scripts and holdout validation runners
│   ├── metrics/                      # JSON logs of ROC-AUCs, confusion matrices, F1 scores
│   └── reproducibility/              # Seed definitions (SEED=42), CUDA environment specifications
├── figures/
│   ├── architecture/                 # System telemetry diagrams, WebSockets, hardware wiring
│   ├── hardware/                     # Sensor pinouts, 3D ear-clip schematics, circuit models
│   ├── signal-processing/            # Butterworth filtering, Pan-Tompkins stages, SQI distributions
│   ├── machine-learning/             # SE-ResNet-BiGRU architectures, Stacking ensemble graphs
│   ├── experimental-results/         # ROC curves, confusion matrices, Grad-CAM heatmaps
│   └── exports/                      # High-resolution 600 DPI PNGs, PDF vector figures for LaTeX
├── integrity/
│   ├── academic_integrity_report.md  # Style analysis, AI cliché reduction, passive/active ratio
│   └── doi_crossref_audit.log        # Timestamped validation log of all bibliographic entries
├── literature/
│   ├── papers/                       # Open-access research PDFs and benchmark papers
│   ├── extracted-evidence/           # Key findings, direct quotes, and parameter comparison tables
│   └── references.bib                # Formally validated BibTeX database
├── manuscript/
│   ├── sections/                     # Modular manuscript drafting sections
│   │   ├── 01_abstract.md
│   │   ├── 02_introduction.md
│   │   ├── 03_related_work.md
│   │   ├── 04_system_architecture.md
│   │   ├── 05_signal_processing.md
│   │   ├── 06_machine_learning.md
│   │   ├── 07_experimental_results.md
│   │   ├── 08_discussion_limitations.md
│   │   └── 09_conclusion.md
│   ├── latex/                        # Complete IEEE / Nature format LaTeX project
│   │   ├── main.tex
│   │   ├── IEEEtran.cls
│   │   └── figures/                  # Symlinked or copied vector figures
│   └── draft_v1.md                   # Consolidated markdown manuscript draft
├── reports/                          # Formal foundational deliverables
│   ├── COMPLETE_PROJECT_AUDIT.md     # Deliverable 1
│   ├── IMPLEMENTATION_VERIFICATION.md# Deliverable 2
│   ├── DATASET_AND_MODEL_AUDIT.md    # Deliverable 3
│   ├── RESEARCH_GAP_ANALYSIS.md      # Deliverable 4
│   ├── LITERATURE_REVIEW_PLAN.md     # Deliverable 5
│   ├── OPEN_SOURCE_TOOLS_EVALUATION.md # Deliverable 6
│   ├── RESEARCH_WORKSPACE_ARCHITECTURE.md # Deliverable 7
│   └── PUBLICATION_READINESS_REPORT.md    # Deliverable 8
├── repository-analysis/
│   ├── repomix-architecture.md       # AST and file inventory of 643 files
│   └── application-source-snapshot.md# Sanitized 316k-token source code package
├── scripts/
│   ├── generate_figures.py           # Programmatic rendering of all scientific figures
│   ├── verify_references.py          # Crossref REST API DOI and metadata validator
│   ├── check_academic_integrity.py   # Linter for academic tone, passive voice, and clarity
│   └── compile_manuscript.py         # Automates Markdown concatenation and LaTeX/PDF compilation
└── tools/                            # Isolated helper utilities
```

---

## 3. Automated Build & Compilation Workflows

### 3.1 Scientific Figure Compilation Pipeline
* **Script:** `research-workspace/scripts/generate_figures.py`
* **Workflow:**
  1. Loads empirical test predictions from `experiments/metrics/` and raw sample tensors.
  2. Plots high-resolution ROC-AUC curves, Precision-Recall curves, and Confusion Matrices using Matplotlib/Seaborn with color-blind safe palettes (`viridis`, `crest`).
  3. Invokes Mermaid CLI (`mmdc`) to compile `.mmd` workflow charts into lossless SVGs and 600 DPI PNGs.
  4. Saves all figures to `figures/exports/` with consistent typography (Helvetica/Arial, 10 pt font).

### 3.2 Reference Verification Pipeline
* **Script:** `research-workspace/scripts/verify_references.py`
* **Workflow:**
  1. Parses all `@article`, `@inproceedings`, and `@book` entries in `literature/references.bib`.
  2. Queries the official Crossref REST API: `https://api.crossref.org/works/{doi}`.
  3. Compares author names, titles, journal names, and publication years.
  4. Generates `integrity/doi_crossref_audit.log` flagging any discrepancies or missing fields.

### 3.3 Manuscript Assembly & Export Pipeline
* **Script:** `research-workspace/scripts/compile_manuscript.py`
* **Workflow:**
  1. Concatenates modular markdown files from `manuscript/sections/` in sequence.
  2. Formats citations and table cross-references.
  3. Injects figure links pointing to `figures/exports/`.
  4. Compiles final output documents:
     - `manuscript/Ear_to_Heart_Manuscript.pdf` (via pdflatex or pandoc)
     - `manuscript/Ear_to_Heart_Manuscript.docx` (for collaborative journal co-authorship).

---

## 4. Reproducibility & Research Protocol

To guarantee that any independent researcher or peer-reviewer can replicate our exact findings:
1. **Fixed Random Seeds:** All stochastic operations (train/test splits, model initialization, SMOTE, CatBoost) are pinned to:
   $$\text{SEED} = 42$$
2. **Deterministic CUDA Flags:**
   ```python
   import torch, numpy as np, random
   torch.manual_seed(42)
   np.random.seed(42)
   random.seed(42)
   if torch.cuda.is_available():
       torch.cuda.manual_seed_all(42)
       torch.backends.cudnn.deterministic = True
       torch.backends.cudnn.benchmark = False
   ```
3. **Environment Specification:**
   Python dependencies are pinned with exact major and minor versions in `research-workspace/requirements-research.txt`.
4. **Data Privacy & Sanitization:**
   No patient-identifiable private health information (PHI) or personal API keys are ever stored in the repository. All clinical datasets used (PTB-XL, MIT-BIH, Cardio 70k, etc.) are strictly anonymized, de-identified public research databases.
