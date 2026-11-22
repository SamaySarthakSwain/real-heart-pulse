# VISUAL & TYPESETTING AUDIT REPORT: EAR TO HEART MANUSCRIPT
**Project:** Ear to Heart (VitalStream Biomedical Telemetry & AI Diagnostic System)  
**Repository:** `https://github.com/SamaySarthakSwain/real-heart-pulse`  
**Branch:** `research-paper-workspace`  
**Auditor:** Senior Scientific Publication Designer & LaTeX Typesetting Specialist  
**Phase:** Phase 1 — Diagnostic Manuscript Inspection & Defect Taxonomy  
**Date:** November 2026  

---

## 1. Executive Summary

This visual and typesetting audit inspects the current research manuscript artifacts of the **Ear to Heart** project:
1. Legacy Draft: [`Ear_to_Heart_RP.docx`](file:///c:/Users/LENOVO/Desktop/Ear%20to%20Heart/real-heart-pulse-main/Ear_to_Heart_RP.docx) (211 paragraphs, 11 tables, 0 figures)
2. Preliminary Compilation: [`Ear_to_Heart_SOTA_Publication_Manuscript.docx`](file:///c:/Users/LENOVO/Desktop/Ear%20to%20Heart/Ear_to_Heart_SOTA_Publication_Manuscript.docx) (64 paragraphs, 4 tables, 11 raster images)

While the scientific substance (113,449 clinical patients, native Lead-II SE-ResNet-BiGRU, 6-DoF IMU motion gating, conformal uncertainty bounds) is technically sound, the presentation suffers from **substantial typesetting, visual design, and academic formatting flaws**. To an IEEE Transactions, Nature Digital Medicine, or Elsevier reviewer, the documents look like an automatically assembled report rather than a carefully designed manuscript from an established biomedical engineering laboratory.

---

## 2. Detailed Visual & Typesetting Defect Taxonomy

```
+----------------------------------------------------------------------------------------------------+
|                                    DEFECT TAXONOMY OVERVIEW                                        |
+----------------------------------------------------------------------------------------------------+
|  [Defect 1: Page Layout & Grid System]          |  [Defect 2: Typography & Font Hierarchy]        |
|  Single-column word flow vs. IEEE 2-column grid |  Generic sans-serif vs. Formal Serif / Math Font |
|-------------------------------------------------+--------------------------------------------------|
|  [Defect 3: Scientific Figures & Graphics]      |  [Defect 4: Tabular Design & Border Clutter]     |
|  Raster PNGs vs. Vector PDF/SVG with SciencePlot|  Word gridlines vs. Booktabs rules (\toprule)    |
|-------------------------------------------------+--------------------------------------------------|
|  [Defect 5: Mathematical Typesetting]          |  [Defect 6: Dynamic Cross-Referencing & BibTeX]  |
|  Informal ASCII text vs. Formal LaTeX equations |  Hardcoded text numbers vs. \ref{} and \cite{}   |
+----------------------------------------------------------------------------------------------------+
```

---

### Defect 1: Page Layout, Margins, and Multi-Column Composition
* **Observed Flaw:** The existing manuscripts are formatted as single-column flowing documents with standard 1.0-inch Word margins.
* **Reviewer Perception:** Premier engineering conferences (IEEE EMBC, Computing in Cardiology) and journal transactions (IEEE TBME, IEEE J-BHI) strictly mandate a **two-column layout** (column width: 3.5 in / 88.9 mm, column separation gutter: 0.17 in / 4.3 mm). Submitting a single-column document signals an unformatted pre-submission draft.
* **Layout Imbalance:** On the final pages, columns are not balanced, leaving excessive white space and orphan section headings.

---

### Defect 2: Typography, Font Hierarchy & First-Page Composition
* **Observed Flaw:** The existing documents utilize generic system fonts (Calibri) with inconsistent heading scalings, non-standard line spacing (1.15x), and unconstrained paragraph gaps.
* **Standard Academic Requirement:**
  - Body text must be typeset in a formal academic serif typeface (e.g., Times New Roman / Computer Modern / Nimbus Roman @ 10 pt with 12 pt leading).
  - Heading hierarchy must adhere to publisher style:
    * Primary headings: Small Caps Roman numerals (`I. INTRODUCTION`, `II. RELATED WORK`).
    * Secondary headings: Italic letters (`A. The Ear as a Sensing Site`).
    * Tertiary headings: Italic numbers with run-in text (`1) Convolutional Stem:`).
* **First-Page Title Block:** The existing title block is excessively large, spanning half the first page before the abstract begins. The abstract lacks formal bold italic side-margins and IEEE Index Terms formatting.

---

### Defect 3: Scientific Figures & Visual Design
* **Observed Flaw in Legacy Draft:** `Ear_to_Heart_RP.docx` contained **zero embedded figures** across 211 paragraphs.
* **Observed Flaw in Recent Compilation:** The figures embedded in `Ear_to_Heart_SOTA_Publication_Manuscript.docx` are raster PNGs. While rendered at high DPI, raster figures lack vector scalability, causing blurring when zoomed or printed in conference proceedings.
* **Figure Styling Discrepancies:**
  - Figure axes use default matplotlib styles rather than standardized publication styles (`SciencePlots` / IEEE standards: 8 pt font, inward ticks, 0.6 pt spine width).
  - Multi-panel figures lack standardized sub-labels `(a)`, `(b)`, `(c)` aligned consistently with caption text.
  - Figure placement flows linearly after paragraphs rather than floating to the top or bottom of columns (`[t!]` or `[b!]`).

---

### Defect 4: Table Design & Border Clutter
* **Observed Flaw:** Tables in the existing document utilize default Word gridlines with full vertical borders and colored cell backgrounds.
* **Standard Academic Rule:** In professional scientific publishing, **vertical lines are strictly prohibited** (`booktabs` rule).
* **Defect Detail:**
  - Table headers lack clear visual hierarchy.
  - Numerical entries are centered or left-aligned rather than aligned on the decimal point via `siunitx`.
  - Column headers overflow with awkward word breaks (e.g., "Physiological\nTarget").
  - Tables must use three primary horizontal rules: `\toprule` (heavy top border), `\midrule` (separator below header), and `\bottomrule` (heavy bottom border).

---

### Defect 5: Mathematical Expressions & Formula Typesetting
* **Observed Flaw:** Mathematical equations are typeset as informal inline ASCII text or basic Word equation strings:
  - Example in existing text: `AccMag = sqrt(Ax^2 + Ay^2 + Az^2)`
  - Example in existing text: `κ = (1/N * Σ(x_i - µ)⁴) / (1/N * Σ(x_i - µ)²)²`
* **Defect Detail:**
  - Missing formal display equation numbers `(1)`, `(2)`, `(3)`.
  - Missing standard summation limits $\sum_{i=1}^N$ and integration fractions.
  - Variables in text are not typeset in math mode ($x_i, \mu, \sigma$).
  - Lack of multi-line equation alignment (`\begin{align} ... \end{align}`) for neural network layers and focal loss formulations.

---

### Defect 6: Dynamic Cross-Referencing & Bibliographic Integrity
* **Observed Flaw:** Citations and references in the existing drafts are hardcoded static numbers (`[1]`, `[2]`) rather than dynamic BibTeX keys (`\cite{Wagner2020}`).
* **Defect Detail:**
  - If a paragraph is reordered or a new paper added, hardcoded numbers become misaligned.
  - Figures and tables are referenced as plain text strings ("Figure 2", "Table 1") without hyperlinking or automated enumeration (`\ref{fig:sqi_gating}`).

---

## 3. Systematic Publishing Roadmap (Phases 2 to 11)

To transition from the current unpolished state to a world-class scientific paper:

| Phase | Milestone Objective | Target Deliverables & Tooling |
| :--- | :--- | :--- |
| **Phase 2** | Clone & evaluate open-source publishing repositories | Clone `PaperShell`, `ieee-enhanced`, `ConferenceTemplate`, `latexPaperTemplate`; integrate `SciencePlots`. |
| **Phase 3** | Establish dedicated LaTeX publishing workspace | Construct `research-workspace/manuscript/` with modular `.tex` architecture, styles, and tools. |
| **Phase 4** | Build typography and visual design system | Configure IEEE two-column grid, Computer Modern / Times Roman typography, math fonts, and color palettes. |
| **Phase 5** | Convert manuscript into modular LaTeX sections | Author `abstract.tex`, `introduction.tex`, `methodology.tex`, `experiments.tex`, `results.tex`, etc. |
| **Phase 6** | Generate vector figures & booktabs tables | Re-render all 8 figures in vector PDF using SciencePlots; format tables with `booktabs` and `siunitx`. |
| **Phase 7** | Integrate verified BibTeX bibliography | Wire 12 Crossref-verified citations with dynamic `\cite{}` and `\ref{}` cross-referencing. |
| **Phase 8** | Compile manuscript with local Tectonic compiler | Execute standalone modern XeTeX engine (`tectonic.exe`) to generate `main.pdf`. |
| **Phase 9** | Automated PDF visual inspection & page rendering | Render all PDF pages to high-res images; inspect for margin overflow, clipped figures, or orphaned text. |
| **Phase 10** | Layout defect correction & final polish | Resolve any overfull `\hbox`, tune figure floats (`[t!]`), balance final-page columns. |
| **Phase 11** | Deliver complete publication package | Export final publication PDF, editable LaTeX sources, quality report, and sync to Google Drive. |
