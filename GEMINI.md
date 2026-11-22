# Ear to Heart: Research Paper Authoring, Humanizer, & Multi-Agent Guidelines

Whenever generating, editing, or evaluating research papers, manuscripts, technical reports, or documentation:

## 1. Integrated Research Tool Repositories
The workspace contains the following cloned research frameworks in `research-workspace/tools/`:
- **PaperOrchestra (Google Research):** `research-workspace/tools/paper-orchestra/`
  - Multi-agent writing pipeline: Outline, Literature Review, Section Writing, Content Refinement, Plotting, and Autoraters (`agent_review.py`, `citation_f1.py`).
  - Staging adapter: `python research-workspace/scripts/run_paper_orchestra.py`.
- **Academic Research Skills (ARS):** `research-workspace/tools/academic-research-skills/`
  - 7-stage academic paper pipeline, claim-to-anchor verification, style calibration, and peer review simulation.
- **Enhanced IEEE Template:** `research-workspace/tools/ieee-enhanced/`
  - Microtypography, standard IEEE conference styling, DOI-enabled bibliographies.
- **PaperShell:** `research-workspace/tools/PaperShell/`
  - Modular publisher-independent LaTeX typesetting.
- **Google NotebookLM Suite:** `research-workspace/notebooklm/`
  - 6 modular source bundles grounded in empirical data for 1-click ingestion into [notebooklm.google.com](https://notebooklm.google.com).

## 2. Deft Writing Principles (`deftwriting.com`)
- **Distribution Fine-Tuning (DFT):** Match natural human prose distributions rather than formulaic instruction-tuned LLM patterns.
- **Claim Ledger Fidelity:** Every assertion must connect to verified empirical numbers (sample sizes, ROC-AUC, sensitivity, hardware current draw).
- **No Negative Parallelisms:** Ban *"It is not X, but Y"* framing; assert claims directly.

## 3. Humanizer Invariants (Wikipedia WP:AISIGNS)
Never use any pattern identified in Wikipedia's guide on AI-generated text:
- **No Em-Dash Crutches (`—`):** Use standard commas, semicolons, parentheses, or split into two sentences.
- **Banned Vocabulary:** Never use *delve, tapestry, testament, beacon, landscape, pivotal, crucial, intricate, groundbreaking, transformative, seamless, paramount, underscore, foster, game-changer, watershed moment.*
- **No Participle Tails:** Ban ending sentences with *", highlighting the importance of..."*, *", paving the way for..."*, *", underscoring..."*.
- **No Editorializing Commentary:** Ban *"It is important to note that..."*, *"Crucially,...", "Indeed,..."*.
- **No Compulsive Section Recaps:** Ban closing or opening sections with *"In conclusion,"*, *"Overall,"*, *"To summarize,"*.
- **High Syntactic Burstiness:** Deliberately mix short, punchy statements (8–12 words) with multi-clause technical explanations (25–35 words).
