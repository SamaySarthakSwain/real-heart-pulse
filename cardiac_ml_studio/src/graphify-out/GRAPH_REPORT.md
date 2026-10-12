# Graph Report - cardiac_ml_studio\src  (2026-10-12)

## Corpus Check
- 10 files · ~4,583 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 37 nodes · 46 edges · 8 communities (6 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f6ca7aec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_ECG_1D_CNN|ECG_1D_CNN]]
- [[_COMMUNITY_download_datasets.py|download_datasets.py]]
- [[_COMMUNITY_update_summary_registry|update_summary_registry]]
- [[_COMMUNITY_CardiacMLPredictor|CardiacMLPredictor]]
- [[_COMMUNITY_train_all.py|train_all.py]]

## God Nodes (most connected - your core abstractions)
1. `ECG_1D_CNN` - 9 edges
2. `CardiacMLPredictor` - 5 edges
3. `update_summary_registry()` - 5 edges
4. `ensure_dir()` - 4 edges
5. `load_and_preprocess_signals()` - 4 edges
6. `generate_ischemia_dataset()` - 3 edges
7. `generate_amyloidosis_dataset()` - 3 edges
8. `generate_fibrosis_dataset()` - 3 edges
9. `evaluate()` - 3 edges
10. `main()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `CardiacMLPredictor` --uses--> `ECG_1D_CNN`  [INFERRED]
  predict.py → train_dl_pipeline.py
- `main()` --calls--> `update_summary_registry()`  [EXTRACTED]
  train_heart_failure.py → summary_updater.py
- `evaluate()` --calls--> `ECG_1D_CNN`  [EXTRACTED]
  eval_dl.py → train_dl_pipeline.py
- `evaluate()` --calls--> `load_and_preprocess_signals()`  [EXTRACTED]
  eval_dl.py → train_dl_pipeline.py

## Import Cycles
- None detected.

## Communities (8 total, 2 thin omitted)

### Community 0 - "ECG_1D_CNN"
Cohesion: 0.42
Nodes (4): evaluate(), ECG_1D_CNN, load_and_preprocess_signals(), main()

### Community 1 - "download_datasets.py"
Cohesion: 0.36
Nodes (7): ensure_dir(), generate_amyloidosis_dataset(), generate_fibrosis_dataset(), generate_ischemia_dataset(), Simulates Ischemia & CAD dataset based on UCI/Cleveland and PTB-XL ST-T features, Simulates Cardiac Amyloidosis dataset based on EchoNet, Mayo Clinic parameters., Simulates Cardiac Fibrosis (Myocardial Scarring & Interstitial) based on EMIDEC/

### Community 2 - "update_summary_registry"
Cohesion: 0.47
Nodes (4): get_dir_size_str(), Automated utility to update 'ML model Summary.md' with new model training result, update_summary_registry(), main()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ECG_1D_CNN` connect `ECG_1D_CNN` to `CardiacMLPredictor`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `CardiacMLPredictor` connect `CardiacMLPredictor` to `ECG_1D_CNN`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `ECG_1D_CNN` (e.g. with `CardiacMLPredictor` and `.__init__()`) actually correct?**
  _`ECG_1D_CNN` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Simulates Ischemia & CAD dataset based on UCI/Cleveland and PTB-XL ST-T features`, `Simulates Cardiac Amyloidosis dataset based on EchoNet, Mayo Clinic parameters.`, `Simulates Cardiac Fibrosis (Myocardial Scarring & Interstitial) based on EMIDEC/` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._